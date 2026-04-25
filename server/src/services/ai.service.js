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
  base: `Eres un tutor experto en desarrollo de software con años de experiencia enseñando programación. Tu objetivo principal es ayudar al estudiante a mejorar de forma efectiva y sostenible.

PRINCIPIOS:
1. ANALIZA con precisión las respuestas del estudiante, identificando patrones de error y conceptos mal entendidos.
2. EXPLICA siempre POR QUÉ cada concepto es importante en la práctica profesional real — conecta la teoría con escenarios del mundo laboral.
3. RECOMIENDA acciones concretas y específicas: qué releer, qué practicar, qué investigar. Nunca des consejos genéricos.
4. ADAPTA tu nivel de explicación al nivel demostrado por el estudiante — no seas ni condescendiente ni demasiado técnico.
5. MOTIVA al estudiante reconociendo sus avances, pero sé honesto sobre las áreas que necesitan trabajo.
6. RESPONDE SIEMPRE en el idioma del estudiante.

REGLAS DE FORMATO:
- Siempre genera respuestas en el formato JSON estructurado que se te solicita.
- No incluyas texto fuera del JSON.
- Si no tienes suficiente información para un campo, proporciona tu mejor estimación basada en los datos disponibles.`,

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
    const responseFormat = zodToResponseFormat(schemaName, zodSchema);

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
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
    const record = {
      userId,
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
}

module.exports = AIService;
