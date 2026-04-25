// ============================================================
// History Context Builder
// ============================================================
// Construye el contexto histórico del usuario para inyectarlo
// en los prompts de la IA. Consulta la base de datos y arma
// un resumen estructurado que la IA pueda analizar.
//
// NOTA: Los métodos de consulta a DB están abstraídos como
// placeholders. El equipo de backend los conectará con MongoDB.
// ============================================================

/**
 * @typedef {Object} UserContext
 * @property {Object} user - Datos del usuario
 * @property {Array} recentResponses - Respuestas recientes
 * @property {Array} previousAnalysis - Análisis previos de la IA
 * @property {Object|null} learningPath - Ruta de aprendizaje actual
 */

// ───────────────────────────────────────────
// Configuración de ventanas de historial por tipo de análisis
// ───────────────────────────────────────────
const HISTORY_WINDOWS = {
  exercise_analysis: {
    responsesLimit: 10,     // Últimas 10 respuestas del mismo topic
    analysisLimit: 3,       // Últimos 3 análisis previos
    filterByTopic: true,    // Filtrar por el topic del ejercicio
  },
  study_recommendation: {
    responsesLimit: 30,     // Últimas 30 respuestas globales
    analysisLimit: 5,       // Últimos 5 análisis
    filterByTopic: false,   // Todas las respuestas
  },
  progress_analysis: {
    responsesLimit: 50,     // Últimas 50 respuestas o 2 semanas
    analysisLimit: 10,      // Últimos 10 análisis
    filterByTopic: false,
    maxDaysBack: 14,        // Máximo 2 semanas hacia atrás
  },
  chat: {
    responsesLimit: 15,     // Últimas 15 respuestas para contexto
    analysisLimit: 3,
    filterByTopic: false,
  },
};

class HistoryBuilder {
  /**
   * @param {Object} db - Instancia de conexión a la base de datos.
   *                      El equipo de backend proveerá esta dependencia.
   */
  constructor(db) {
    this.db = db;
  }

  // ───────────────────────────────────────────
  // Método principal: construir contexto completo
  // ───────────────────────────────────────────

  /**
   * Construye el contexto completo del usuario para enviar a la IA.
   *
   * @param {string} userId - ID del usuario
   * @param {string} analysisType - Tipo: 'exercise_analysis' | 'study_recommendation' | 'progress_analysis' | 'chat'
   * @param {Object} [options={}] - Opciones adicionales
   * @param {string} [options.topicFilter] - Topic para filtrar (en exercise_analysis)
   * @param {Object} [options.currentExercise] - Ejercicio actual siendo evaluado
   * @param {string} [options.currentAnswer] - Respuesta actual del usuario
   * @returns {Promise<UserContext>} Contexto armado para inyectar en el prompt
   */
  async buildContext(userId, analysisType, options = {}) {
    const window = HISTORY_WINDOWS[analysisType];

    if (!window) {
      throw new Error(`Tipo de análisis no soportado: "${analysisType}"`);
    }

    // Ejecutar consultas en paralelo para eficiencia
    const [user, recentResponses, previousAnalysis, learningPath] = await Promise.all([
      this.getUser(userId),
      this.getRecentResponses(userId, window, options.topicFilter),
      this.getPreviousAnalysis(userId, window),
      this.getLearningPath(userId),
    ]);

    return {
      user: this.formatUserSummary(user),
      recentResponses: this.formatResponses(recentResponses),
      previousAnalysis: this.formatAnalysis(previousAnalysis),
      learningPath: learningPath ? this.formatLearningPath(learningPath) : null,
      currentExercise: options.currentExercise || null,
      currentAnswer: options.currentAnswer || null,
    };
  }

  // ───────────────────────────────────────────
  // Métodos de consulta a DB (abstraídos)
  // ───────────────────────────────────────────
  // TODO: El equipo de backend conectará estos métodos con MongoDB.
  //       Por ahora retornan datos vacíos como placeholder.

  /**
   * Obtiene los datos del usuario.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getUser(userId) {
    // PLACEHOLDER — Reemplazar con consulta real a MongoDB
    // Ejemplo: return await this.db.collection('users').findOne({ _id: userId });
    if (this.db && this.db.collection) {
      return await this.db.collection('users').findOne({ _id: userId });
    }
    return { _id: userId, displayName: 'Usuario', preferences: {} };
  }

  /**
   * Obtiene las respuestas recientes del usuario.
   * @param {string} userId
   * @param {Object} window - Configuración de ventana de historial
   * @param {string} [topicFilter] - Topic para filtrar
   * @returns {Promise<Array>}
   */
  async getRecentResponses(userId, window, topicFilter) {
    // PLACEHOLDER — Reemplazar con consulta real a MongoDB
    // Ejemplo:
    // const query = { userId };
    // if (window.filterByTopic && topicFilter) {
    //   query['exercise.topic'] = topicFilter;
    // }
    // if (window.maxDaysBack) {
    //   const cutoff = new Date();
    //   cutoff.setDate(cutoff.getDate() - window.maxDaysBack);
    //   query.submittedAt = { $gte: cutoff };
    // }
    // return await this.db.collection('user_responses')
    //   .find(query)
    //   .sort({ submittedAt: -1 })
    //   .limit(window.responsesLimit)
    //   .toArray();
    if (this.db && this.db.collection) {
      const query = { userId };
      if (window.filterByTopic && topicFilter) {
        // Se necesita un join/lookup con exercises para filtrar por topic
        // El equipo de backend definirá el pipeline de agregación
      }
      if (window.maxDaysBack) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - window.maxDaysBack);
        query.submittedAt = { $gte: cutoff };
      }
      return await this.db.collection('user_responses')
        .find(query)
        .sort({ submittedAt: -1 })
        .limit(window.responsesLimit)
        .toArray();
    }
    return [];
  }

  /**
   * Obtiene análisis previos de la IA para este usuario.
   * @param {string} userId
   * @param {Object} window
   * @returns {Promise<Array>}
   */
  async getPreviousAnalysis(userId, window) {
    // PLACEHOLDER — Reemplazar con consulta real
    if (this.db && this.db.collection) {
      return await this.db.collection('ai_analysis')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(window.analysisLimit)
        .toArray();
    }
    return [];
  }

  /**
   * Obtiene la ruta de aprendizaje actual del usuario.
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getLearningPath(userId) {
    // PLACEHOLDER — Reemplazar con consulta real
    if (this.db && this.db.collection) {
      return await this.db.collection('learning_paths')
        .findOne({ userId });
    }
    return null;
  }

  // ───────────────────────────────────────────
  // Métodos de formateo para el prompt
  // ───────────────────────────────────────────

  /**
   * Formatea los datos del usuario para incluir en el prompt.
   * Solo incluye info relevante, no datos sensibles.
   */
  formatUserSummary(user) {
    return {
      name: user.displayName || 'Estudiante',
      level: user.preferences?.experienceLevel || 'no definido',
      goals: user.preferences?.learningGoals || [],
      language: user.preferences?.language || 'es',
    };
  }

  /**
   * Formatea las respuestas recientes en un formato legible para la IA.
   * Reduce el tamaño del payload eliminando campos innecesarios.
   */
  formatResponses(responses) {
    return responses.map((r, index) => ({
      index: index + 1,
      exercise: r.exerciseId,
      answer: typeof r.answer === 'string' ? r.answer.substring(0, 500) : r.answer, // Limitar tamaño
      correct: r.isCorrect,
      timeSpent: r.timeSpentSeconds,
      attempt: r.attemptNumber,
      date: r.submittedAt,
    }));
  }

  /**
   * Formatea los análisis previos de la IA.
   * Solo incluye los resultados, no los metadatos.
   */
  formatAnalysis(analyses) {
    return analyses.map(a => ({
      type: a.type,
      date: a.createdAt,
      result: a.result,
    }));
  }

  /**
   * Formatea la ruta de aprendizaje.
   */
  formatLearningPath(path) {
    return {
      topics: (path.topics || []).map(t => ({
        name: t.name,
        status: t.status,
        priority: t.priority,
      })),
      lastUpdated: path.lastGeneratedAt,
    };
  }

  // ───────────────────────────────────────────
  // Convertir contexto a texto para el prompt
  // ───────────────────────────────────────────

  /**
   * Convierte el contexto del usuario en un bloque de texto
   * para inyectar en el system prompt de la IA.
   *
   * @param {UserContext} context
   * @returns {string} Texto formateado para incluir en el prompt
   */
  contextToPromptText(context) {
    const parts = [];

    // Info del usuario
    parts.push(`## Perfil del Estudiante`);
    parts.push(`- Nombre: ${context.user.name}`);
    parts.push(`- Nivel: ${context.user.level}`);
    if (context.user.goals.length > 0) {
      parts.push(`- Metas: ${context.user.goals.join(', ')}`);
    }

    // Ejercicio actual (si aplica)
    if (context.currentExercise) {
      parts.push(`\n## Ejercicio Actual`);
      parts.push(`- Tema: ${context.currentExercise.topic || 'N/A'}`);
      parts.push(`- Dificultad: ${context.currentExercise.difficulty || 'N/A'}`);
      parts.push(`- Pregunta: ${context.currentExercise.question || 'N/A'}`);
      if (context.currentExercise.correctAnswer) {
        parts.push(`- Respuesta correcta: ${context.currentExercise.correctAnswer}`);
      }
      parts.push(`- Respuesta del estudiante: ${context.currentAnswer || 'N/A'}`);
    }

    // Historial de respuestas
    if (context.recentResponses.length > 0) {
      parts.push(`\n## Historial Reciente (${context.recentResponses.length} respuestas)`);
      context.recentResponses.forEach(r => {
        const status = r.correct ? '✅' : '❌';
        parts.push(`${r.index}. ${status} Ejercicio ${r.exercise} | Tiempo: ${r.timeSpent}s | Intento #${r.attempt}`);
      });
    }

    // Análisis previos
    if (context.previousAnalysis.length > 0) {
      parts.push(`\n## Análisis Previos de la IA`);
      context.previousAnalysis.forEach(a => {
        parts.push(`- [${a.type}] ${a.date}: ${JSON.stringify(a.result).substring(0, 300)}...`);
      });
    }

    // Ruta de aprendizaje
    if (context.learningPath) {
      parts.push(`\n## Ruta de Aprendizaje Actual`);
      context.learningPath.topics.forEach(t => {
        parts.push(`- [${t.status}] ${t.name} (prioridad: ${t.priority})`);
      });
    }

    return parts.join('\n');
  }
}

module.exports = HistoryBuilder;
