const { z } = require('zod');
const { getAIClient, getAIConfig } = require('../config/ai.config');
const {
  ExerciseAnalysisSchema,
  StudyRecommendationSchema,
  ProgressAnalysisSchema,
  TutorChatResponseSchema,
  zodToResponseFormat,
} = require('../schemas/ai.schemas');
const HistoryBuilder = require('./history.builder');

// ============================================================
// AI Service — Núcleo de la Integración con IA
// ============================================================
// Este servicio es responsable de:
// 1. Construir prompts con contexto del usuario
// 2. Llamar a la API de IA (OpenAI / DeepSeek)
// 3. Parsear y validar respuestas con Zod schemas
// 4. Guardar análisis en la base de datos
// ============================================================

// ───────────────────────────────────────────
// System Prompts
// ───────────────────────────────────────────

const SYSTEM_PROMPTS = {
  /**
   * Prompt base del tutor — se incluye en TODAS las llamadas.
   * Al ser consistente, DeepSeek lo cachea automáticamente (ahorro de costos).
   */
  base: `Eres un tutor experto en desarrollo de software. Tu objetivo es ayudar al estudiante a mejorar.
  
  PRINCIPIOS:
  1. RECONOCE los aciertos parciales. Si el estudiante usa la palabra clave correcta pero olvida un detalle técnico, valora ese conocimiento en el puntaje.
  2. EXPLICA de forma pedagógica y motivadora.
  3. ADAPTA tu nivel: sé un mentor, no un juez.
  4. PUNTUACIÓN: Sé justo. Las respuestas parcialmente correctas deben recibir un puntaje proporcional (ej: 40-70), nunca 0 si hay intención correcta.
  5. RESPONDE SIEMPRE en el idioma del estudiante.
  
  FORMATO: Genera siempre JSON estructurado.`,

  /**
   * Prompt específico para análisis de ejercicio.
   */
  exerciseAnalysis: `Analiza la respuesta del estudiante al ejercicio proporcionado. Evalúa:
- Qué conceptos demuestra dominar
- Qué áreas necesitan mejora y por qué son importantes
- Sugiere acciones concretas para cada área débil
- Asigna un puntaje del 0 al 100 basado en la corrección y profundidad de comprensión demostrada`,

  /**
   * Prompt específico para recomendaciones de estudio.
   */
  studyRecommendation: `Basándote en el historial completo del estudiante, genera recomendaciones de estudio personalizadas. Considera:
- Patrones de error recurrentes (temas que falla repetidamente)
- Temas que no ha practicado recientemente
- Su nivel actual y metas de aprendizaje
- Una ruta de aprendizaje progresiva y realista
Prioriza las recomendaciones de mayor a menor urgencia.`,

  /**
   * Prompt específico para análisis de progreso.
   */
  progressAnalysis: `Analiza el progreso del estudiante durante el periodo indicado. Identifica:
- Mejoras concretas que ha logrado
- Debilidades persistentes que necesitan atención especial
- Tendencias: ¿está mejorando, estancado o declinando en cada área?
- Consistencia de estudio (rachas de días, regularidad)
Sé específico con datos del historial, no generalices.`,

  /**
   * Prompt específico para chat libre con el tutor.
   */
  chat: `El estudiante te hace una pregunta libre. Responde de manera clara y pedagógica, 
considerando su historial de aprendizaje para personalizar tu respuesta.
Si la pregunta se relaciona con un tema que le ha costado, aprovecha para reforzar.
Sugiere un ejercicio práctico si es relevante.`,
};

class AIService {
  /**
   * @param {Object} db - Instancia de conexión a la base de datos.
   */
  constructor(db) {
    this.db = db;
    this.historyBuilder = new HistoryBuilder(db);
    this.client = getAIClient();
    this.config = getAIConfig();
  }

  // ───────────────────────────────────────────
  // Método principal de llamada a la IA
  // ───────────────────────────────────────────

  /**
   * Realiza una llamada a la API de IA con structured output.
   *
   * @param {string} systemPrompt - System prompt completo
   * @param {string} userMessage - Mensaje del usuario / contexto
   * @param {string} schemaName - Nombre del schema para structured output
   * @param {z.ZodObject} zodSchema - Schema Zod para validar la respuesta
   * @returns {Promise<{data: Object, usage: Object}>} Datos parseados y uso de tokens
   */
  async callAI(systemPrompt, userMessage, schemaName, zodSchema) {
    const useStrictSchema = this.config.provider === 'openai';

    // DeepSeek no soporta json_schema estricto, usa json_object con el schema en el prompt
    let responseFormat;
    let finalSystemPrompt = systemPrompt;

    if (useStrictSchema) {
      // OpenAI: structured output estricto con json_schema
      responseFormat = zodToResponseFormat(schemaName, zodSchema);
    } else {
      // DeepSeek/otros: json_object + schema inyectado en el prompt
      responseFormat = { type: 'json_object' };
      const schemaExample = this._zodSchemaToExample(zodSchema);
      finalSystemPrompt += `\n\nRESPONDE ÚNICAMENTE con un JSON válido que siga EXACTAMENTE esta estructura:\n${JSON.stringify(schemaExample, null, 2)}`;
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: responseFormat,
        temperature: 0.7,
      });

      const choice = completion.choices[0];

      // Verificar refusal (por políticas de seguridad)
      if (choice.message.refusal) {
        throw new Error(`La IA rechazó la solicitud: ${choice.message.refusal}`);
      }

      // Parsear JSON
      const rawData = JSON.parse(choice.message.content);

      // Validar con Zod
      const validated = zodSchema.parse(rawData);

      return {
        data: validated,
        usage: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      // Re-lanzar con contexto adicional
      if (error.name === 'ZodError') {
        console.error('[AI Service] Error de validación de schema:', error.errors);
        throw new Error(
          `La respuesta de la IA no cumple con el schema esperado (${schemaName}): ${error.message}`
        );
      }
      throw error;
    }
  }

  // ───────────────────────────────────────────
  // Análisis de ejercicio
  // ───────────────────────────────────────────

  /**
   * Analiza la respuesta de un usuario a un ejercicio específico.
   *
   * @param {string} userId - ID del usuario
   * @param {Object} exercise - Datos del ejercicio
   * @param {string} answer - Respuesta del usuario
   * @param {number} timeSpentSeconds - Tiempo empleado
   * @returns {Promise<Object>} Análisis validado
   */
  async analyzeExercise(userId, exercise, answer, timeSpentSeconds) {
    // 1. Construir contexto histórico
    const context = await this.historyBuilder.buildContext(
      userId,
      'exercise_analysis',
      {
        topicFilter: exercise.topic,
        currentExercise: exercise,
        currentAnswer: answer,
      }
    );

    // 2. Armar prompt completo
    const systemPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.exerciseAnalysis}`;
    const userMessage = this.historyBuilder.contextToPromptText(context);

    // 3. Llamar a la IA
    const result = await this.callAI(
      systemPrompt,
      userMessage,
      'exercise_analysis',
      ExerciseAnalysisSchema
    );

    // 4. Guardar análisis en DB
    await this.saveAnalysis(userId, 'exercise_analysis', 'exercise_submitted', {
      result: result.data,
      tokensUsed: result.usage,
    });

    return result.data;
  }

  // ───────────────────────────────────────────
  // Recomendaciones de estudio
  // ───────────────────────────────────────────

  /**
   * Genera recomendaciones de estudio personalizadas.
   *
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Recomendaciones validadas
   */
  async getStudyRecommendations(userId) {
    const context = await this.historyBuilder.buildContext(userId, 'study_recommendation');

    const systemPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.studyRecommendation}`;
    const userMessage = this.historyBuilder.contextToPromptText(context);

    const result = await this.callAI(
      systemPrompt,
      userMessage,
      'study_recommendation',
      StudyRecommendationSchema
    );

    await this.saveAnalysis(userId, 'study_recommendation', 'user_request', {
      result: result.data,
      tokensUsed: result.usage,
    });

    return result.data;
  }

  // ───────────────────────────────────────────
  // Análisis de progreso
  // ───────────────────────────────────────────

  /**
   * Genera un análisis de progreso histórico del usuario.
   *
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Análisis de progreso validado
   */
  async analyzeProgress(userId) {
    const context = await this.historyBuilder.buildContext(userId, 'progress_analysis');

    const systemPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.progressAnalysis}`;
    const userMessage = this.historyBuilder.contextToPromptText(context);

    const result = await this.callAI(
      systemPrompt,
      userMessage,
      'progress_analysis',
      ProgressAnalysisSchema
    );

    await this.saveAnalysis(userId, 'progress_analysis', 'user_request', {
      result: result.data,
      tokensUsed: result.usage,
    });

    return result.data;
  }

  // ───────────────────────────────────────────
  // Chat libre con el tutor
  // ───────────────────────────────────────────

  /**
   * Conversación libre con el tutor IA.
   *
   * @param {string} userId - ID del usuario
   * @param {string} message - Mensaje/pregunta del usuario
   * @returns {Promise<Object>} Respuesta del tutor validada
   */
  async chat(userId, message) {
    const context = await this.historyBuilder.buildContext(userId, 'chat');

    const systemPrompt = `${SYSTEM_PROMPTS.base}\n\n${SYSTEM_PROMPTS.chat}`;
    const userMessage = `${this.historyBuilder.contextToPromptText(context)}\n\n## Pregunta del Estudiante\n${message}`;

    const result = await this.callAI(
      systemPrompt,
      userMessage,
      'tutor_chat_response',
      TutorChatResponseSchema
    );

    return result.data;
  }

  // ───────────────────────────────────────────
  // Persistencia de análisis
  // ───────────────────────────────────────────

  /**
   * Guarda un análisis generado por la IA en la base de datos.
   * @param {string} userId
   * @param {string} type - Tipo de análisis
   * @param {string} triggerEvent - Evento que disparó el análisis
   * @param {Object} data - Datos del análisis (result + tokensUsed)
   */
  async saveAnalysis(userId, type, triggerEvent, data) {
    const { ObjectId } = require('mongodb');
    let queryId = userId;
    try {
      if (typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId)) {
        queryId = new ObjectId(userId);
      }
    } catch (e) {
      queryId = userId;
    }

    const record = {
      userId: queryId,
      type,
      triggerEvent,
      result: data.result,
      model: this.config.model,
      tokensUsed: data.tokensUsed,
      createdAt: new Date(),
    };

    // PLACEHOLDER — El equipo de backend conectará con MongoDB
    if (this.db && this.db.collection) {
      await this.db.collection('ai_analysis').insertOne(record);
    } else {
      console.log('[AI Service] Análisis generado (DB no conectada):', JSON.stringify(record, null, 2));
    }

    return record;
  }

  // ───────────────────────────────────────────
  // Helper: Generar ejemplo de schema para prompt
  // ───────────────────────────────────────────

  /**
   * Genera un objeto de ejemplo a partir de un Zod schema.
   * Se usa para inyectar la estructura esperada en el prompt cuando
   * el provider no soporta json_schema estricto (ej: DeepSeek).
   */
  _zodSchemaToExample(schema) {
    if (schema instanceof z.ZodObject) {
      const result = {};
      for (const [key, value] of Object.entries(schema.shape)) {
        result[key] = this._zodSchemaToExample(value);
      }
      return result;
    }
    if (schema instanceof z.ZodArray) {
      return [this._zodSchemaToExample(schema.element)];
    }
    if (schema instanceof z.ZodEnum) {
      return schema.options.join(' | ');
    }
    if (schema instanceof z.ZodString) {
      return schema.description || 'string';
    }
    if (schema instanceof z.ZodNumber) {
      return schema.description || 0;
    }
    if (schema instanceof z.ZodBoolean) {
      return false;
    }
    if (schema instanceof z.ZodNullable) {
      return this._zodSchemaToExample(schema.unwrap()) + ' | null';
    }
    return 'string';
  }
}

module.exports = AIService;
