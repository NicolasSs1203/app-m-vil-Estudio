// ============================================================
// Data Contracts — Modelos de Datos para MongoDB
// ============================================================
// Este archivo documenta los contratos de datos que el equipo
// de base de datos debe implementar. NO es un ORM ni un driver,
// es una referencia de la estructura esperada por la capa de IA.
//
// El equipo de DB puede usar Mongoose schemas, validaciones
// nativas de MongoDB, o cualquier herramienta, siempre que
// las colecciones cumplan con estas estructuras.
// ============================================================

/**
 * Colección: users
 *
 * Almacena la información del usuario y sus preferencias.
 *
 * Índices recomendados:
 * - { email: 1 } — único
 * - { lastActiveAt: -1 }
 */
const USER_CONTRACT = {
  _id: 'ObjectId',
  email: 'String — requerido, único',
  displayName: 'String — nombre visible',
  preferences: {
    language: '"es" | "en" — idioma preferido del tutor',
    learningGoals: '[String] — ej: ["Frontend", "Backend", "DevOps"]',
    experienceLevel: '"beginner" | "intermediate" | "advanced"',
    dailyGoalMinutes: 'Number — meta diaria en minutos',
  },
  createdAt: 'Date',
  lastActiveAt: 'Date',
};

/**
 * Colección: exercises
 *
 * Catálogo de ejercicios disponibles.
 *
 * Índices recomendados:
 * - { topic: 1, difficulty: 1 }
 * - { tags: 1 }
 * - { category: 1 }
 */
const EXERCISE_CONTRACT = {
  _id: 'ObjectId',
  topic: 'String — ej: "JavaScript - Closures"',
  category: 'String — ej: "Frontend", "Backend", "DevOps"',
  difficulty: '"easy" | "medium" | "hard"',
  type: '"multiple_choice" | "code" | "open_answer"',
  question: 'String — la pregunta o enunciado del ejercicio',
  options: '[String] — solo para multiple_choice, array de opciones',
  correctAnswer: 'Mixed — String o Array según tipo',
  explanation: 'String — explicación de la respuesta correcta',
  tags: '[String] — ej: ["javascript", "closures", "scope"]',
  createdAt: 'Date',
};

/**
 * Colección: user_responses
 *
 * Historial de todas las respuestas enviadas por los usuarios.
 * Esta es la colección MÁS consultada por la IA.
 *
 * Índices recomendados (CRÍTICOS para performance):
 * - { userId: 1, submittedAt: -1 } — consultas de historial reciente
 * - { userId: 1, exerciseId: 1, submittedAt: -1 } — intentos por ejercicio
 */
const USER_RESPONSE_CONTRACT = {
  _id: 'ObjectId',
  userId: 'ObjectId — ref: users._id',
  exerciseId: 'ObjectId — ref: exercises._id',
  answer: 'Mixed — texto, código, o opción seleccionada',
  isCorrect: 'Boolean — si la respuesta fue correcta',
  timeSpentSeconds: 'Number — tiempo que tardó en responder',
  attemptNumber: 'Number — intento #1, #2, etc. para el mismo ejercicio',
  submittedAt: 'Date — cuándo se envió la respuesta',
};

/**
 * Colección: ai_analysis
 *
 * Almacena todos los análisis generados por la IA.
 * Sirve como historial auditable y para contextualizar futuros análisis.
 *
 * Índices recomendados:
 * - { userId: 1, type: 1, createdAt: -1 }
 * - { userId: 1, createdAt: -1 }
 */
const AI_ANALYSIS_CONTRACT = {
  _id: 'ObjectId',
  userId: 'ObjectId — ref: users._id',
  type: '"exercise_analysis" | "study_recommendation" | "progress_analysis"',
  triggerEvent: '"exercise_submitted" | "daily_review" | "user_request"',
  input: {
    responseIds: '[ObjectId] — respuestas que se analizaron',
    historyWindow: 'Number — cuántas respuestas se incluyeron como contexto',
  },
  result: 'Mixed — JSON estructurado devuelto por la IA (varía según type)',
  model: 'String — ej: "gpt-4o-mini" o "deepseek-chat"',
  tokensUsed: {
    prompt: 'Number — tokens de input',
    completion: 'Number — tokens de output',
    total: 'Number — total de tokens consumidos',
  },
  createdAt: 'Date',
};

/**
 * Colección: learning_paths
 *
 * Ruta de aprendizaje personalizada por usuario.
 * Puede ser generada por la IA o configurada manualmente.
 *
 * Índices recomendados:
 * - { userId: 1 } — único
 */
const LEARNING_PATH_CONTRACT = {
  _id: 'ObjectId',
  userId: 'ObjectId — ref: users._id (único)',
  generatedByAI: 'Boolean — si fue generada automáticamente por la IA',
  topics: [{
    name: 'String — nombre del tema',
    status: '"pending" | "in_progress" | "completed" | "needs_review"',
    priority: 'Number — 1 = más urgente',
    lastUpdated: 'Date',
    aiNotes: 'String — notas de la IA sobre el estado del estudiante en este tema',
  }],
  lastGeneratedAt: 'Date — última vez que la IA actualizó este path',
  nextReviewAt: 'Date — fecha sugerida para próxima revisión',
};

// ============================================================
// Exportar contratos (para referencia en otros módulos)
// ============================================================

module.exports = {
  USER_CONTRACT,
  EXERCISE_CONTRACT,
  USER_RESPONSE_CONTRACT,
  AI_ANALYSIS_CONTRACT,
  LEARNING_PATH_CONTRACT,

  /**
   * Lista de todas las colecciones que deben existir en MongoDB.
   */
  COLLECTIONS: [
    'users',
    'exercises',
    'user_responses',
    'ai_analysis',
    'learning_paths',
  ],

  /**
   * Índices recomendados por colección.
   * El equipo de DB debe crear estos índices para garantizar
   * el rendimiento de las consultas de la capa de IA.
   */
  RECOMMENDED_INDEXES: {
    users: [
      { email: 1, _options: { unique: true } },
      { lastActiveAt: -1 },
    ],
    exercises: [
      { topic: 1, difficulty: 1 },
      { tags: 1 },
      { category: 1 },
    ],
    user_responses: [
      { userId: 1, submittedAt: -1 },
      { userId: 1, exerciseId: 1, submittedAt: -1 },
    ],
    ai_analysis: [
      { userId: 1, type: 1, createdAt: -1 },
      { userId: 1, createdAt: -1 },
    ],
    learning_paths: [
      { userId: 1, _options: { unique: true } },
    ],
  },
};
