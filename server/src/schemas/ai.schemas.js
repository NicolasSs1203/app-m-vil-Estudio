const { z } = require('zod');

// ============================================================
// Zod Schemas — Structured Outputs de la IA
// ============================================================
// Estos schemas garantizan que TODAS las respuestas de la IA
// cumplan un formato predecible. Si la IA devuelve algo que no
// cumple el schema, Zod lanzará un error de validación.
//
// El frontend y backend SIEMPRE pueden confiar en estas estructuras.
// ============================================================

// ───────────────────────────────────────────
// Schema: Área débil identificada por la IA
// ───────────────────────────────────────────
const WeakAreaSchema = z.object({
  topic: z.string().describe('Nombre del tema o concepto débil'),
  severity: z.enum(['low', 'medium', 'high']).describe('Nivel de severidad de la debilidad'),
  explanation: z.string().describe('Por qué este concepto es importante en la práctica profesional'),
  suggestion: z.string().describe('Acción concreta para mejorar: qué leer, practicar o investigar'),
});

// ───────────────────────────────────────────
// Schema: Análisis de un ejercicio individual
// ───────────────────────────────────────────
const ExerciseAnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe('Puntaje del 0 al 100'),
  correctConcepts: z.array(z.string()).describe('Conceptos que el estudiante demostró dominar'),
  weakAreas: z.array(WeakAreaSchema).describe('Áreas débiles identificadas con sugerencias'),
  overallFeedback: z.string().describe('Retroalimentación general, motivadora y constructiva'),
});

// ───────────────────────────────────────────
// Schema: Una recomendación de estudio
// ───────────────────────────────────────────
const SingleRecommendationSchema = z.object({
  type: z.enum(['review', 'practice', 'explore', 'reinforce']).describe(
    'Tipo de acción: review=releer, practice=ejercitar, explore=investigar nuevo, reinforce=reforzar'
  ),
  topic: z.string().describe('Tema específico a trabajar'),
  priority: z.enum(['low', 'medium', 'high']).describe('Prioridad de la recomendación'),
  reason: z.string().describe('Por qué se recomienda esto basado en el historial'),
  estimatedTime: z.string().describe('Tiempo estimado, ej: "30 minutos"'),
  resources: z.array(z.string()).describe('Recursos sugeridos: artículos, libros, ejercicios'),
});

// ───────────────────────────────────────────
// Schema: Ruta de aprendizaje generada
// ───────────────────────────────────────────
const LearningPathSnapshotSchema = z.object({
  currentLevel: z.string().describe('Nivel actual estimado del estudiante'),
  nextMilestone: z.string().describe('Siguiente hito o meta a alcanzar'),
  progress: z.number().min(0).max(100).describe('Porcentaje de progreso estimado hacia el milestone'),
});

// ───────────────────────────────────────────
// Schema: Recomendaciones de estudio completas
// ───────────────────────────────────────────
const StudyRecommendationSchema = z.object({
  recommendations: z.array(SingleRecommendationSchema).describe('Lista de recomendaciones ordenadas por prioridad'),
  learningPath: LearningPathSnapshotSchema.describe('Snapshot de la ruta de aprendizaje'),
  motivationalNote: z.string().describe('Nota motivacional personalizada para el estudiante'),
});

// ───────────────────────────────────────────
// Schema: Debilidad persistente en el progreso
// ───────────────────────────────────────────
const PersistentWeaknessSchema = z.object({
  topic: z.string().describe('Tema con debilidad persistente'),
  attemptCount: z.number().describe('Número de intentos en este tema'),
  trend: z.enum(['improving', 'stagnant', 'declining']).describe('Tendencia: mejorando, estancado o declinando'),
  actionPlan: z.string().describe('Plan de acción sugerido por la IA'),
});

// ───────────────────────────────────────────
// Schema: Análisis de progreso histórico
// ───────────────────────────────────────────
const ProgressAnalysisSchema = z.object({
  period: z.string().describe('Periodo analizado, ej: "últimas 2 semanas"'),
  summary: z.string().describe('Resumen general del progreso'),
  improvements: z.array(z.string()).describe('Áreas donde el estudiante ha mejorado'),
  persistentWeaknesses: z.array(PersistentWeaknessSchema).describe('Debilidades que persisten a lo largo del tiempo'),
  streaks: z.object({
    currentStreak: z.number().describe('Racha actual de días consecutivos'),
    longestStreak: z.number().describe('Racha más larga registrada'),
    consistency: z.string().describe('Descripción de la consistencia del estudio'),
  }),
});

// ───────────────────────────────────────────
// Schema: Plan de estudio para un proyecto específico
// ───────────────────────────────────────────
const ProjectPlanSchema = z.object({
  title: z.string().describe('Nombre del proyecto o área de estudio'),
  description: z.string().describe('Breve descripción del objetivo del proyecto'),
  prerequisites: z.array(z.string()).describe('Conocimientos previos recomendados'),
  roadmap: z.array(z.object({
    phase: z.string().describe('Nombre de la fase, ej: "Fase 1: UI/UX"'),
    description: z.string().describe('Qué se aprenderá en esta fase'),
    keyTopics: z.array(z.string()).describe('Temas específicos a dominar')
  })).describe('Hoja de ruta paso a paso'),
  keySkills: z.array(z.string()).describe('Habilidades que el estudiante adquirirá'),
  estimatedWeeks: z.number().describe('Tiempo estimado para completar el plan')
});

// ───────────────────────────────────────────
// Schema: Respuesta de chat libre con el tutor
// ───────────────────────────────────────────
const TutorChatResponseSchema = z.object({
  answer: z.string().describe('Respuesta del tutor a la pregunta del estudiante'),
  relatedTopics: z.array(z.string()).describe('Temas relacionados que podría explorar'),
  suggestedExercise: z.string().nullable().describe('Ejercicio sugerido basado en la conversación, o null si no aplica'),
});

// ───────────────────────────────────────────
// Helpers: Conversión de Zod a JSON Schema (para OpenAI structured outputs)
// ───────────────────────────────────────────

/**
 * Convierte un Zod schema a JSON Schema compatible con OpenAI API.
 * Se utiliza en el parámetro `response_format` del API call.
 *
 * @param {string} name - Nombre del schema
 * @param {z.ZodObject} zodSchema - Schema de Zod a convertir
 * @returns {object} JSON Schema para OpenAI response_format
 */
function zodToResponseFormat(name, zodSchema) {
  // Construimos el JSON Schema recursivamente desde el Zod schema
  const jsonSchema = zodSchemaToJsonSchema(zodSchema);

  return {
    type: 'json_schema',
    json_schema: {
      name,
      strict: true,
      schema: {
        ...jsonSchema,
        additionalProperties: false,
      },
    },
  };
}

/**
 * Convierte recursivamente un schema Zod a JSON Schema.
 * Soporta: string, number, boolean, enum, array, object, nullable.
 */
function zodSchemaToJsonSchema(schema) {
  // Unwrap optional/nullable
  if (schema instanceof z.ZodNullable) {
    const inner = zodSchemaToJsonSchema(schema.unwrap());
    return { anyOf: [inner, { type: 'null' }] };
  }

  if (schema instanceof z.ZodOptional) {
    return zodSchemaToJsonSchema(schema.unwrap());
  }

  // String
  if (schema instanceof z.ZodString) {
    return { type: 'string' };
  }

  // Number
  if (schema instanceof z.ZodNumber) {
    return { type: 'number' };
  }

  // Boolean
  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  // Enum
  if (schema instanceof z.ZodEnum) {
    return { type: 'string', enum: schema.options };
  }

  // Array
  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodSchemaToJsonSchema(schema.element),
    };
  }

  // Object
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties = {};
    const required = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodSchemaToJsonSchema(value);
      required.push(key);
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
  }

  // Fallback
  return { type: 'string' };
}

module.exports = {
  // Schemas individuales
  WeakAreaSchema,
  ExerciseAnalysisSchema,
  SingleRecommendationSchema,
  LearningPathSnapshotSchema,
  StudyRecommendationSchema,
  PersistentWeaknessSchema,
  ProgressAnalysisSchema,
  ProjectPlanSchema,
  TutorChatResponseSchema,

  // Helper
  zodToResponseFormat,
};
