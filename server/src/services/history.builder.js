const { ObjectId } = require('mongodb');

const HISTORY_WINDOWS = {
  exercise_analysis: {
    responsesLimit: 10,
    analysisLimit: 3,
    filterByTopic: true,
  },
  study_recommendation: {
    responsesLimit: 30,
    analysisLimit: 5,
    filterByTopic: false,
  },
  progress_analysis: {
    responsesLimit: 50,
    analysisLimit: 10,
    filterByTopic: false,
    maxDaysBack: 14,
  },
  chat: {
    responsesLimit: 15,
    analysisLimit: 3,
    filterByTopic: false,
  },
};

class HistoryBuilder {
  constructor(db) {
    this.db = db;
  }

  // Helper para convertir ID de forma segura
  safeId(userId) {
    if (typeof userId === 'string' && /^[0-9a-fA-F]{24}$/.test(userId)) {
      try {
        return new ObjectId(userId);
      } catch (e) {
        return userId;
      }
    }
    return userId;
  }

  async buildContext(userId, analysisType, options = {}) {
    const window = HISTORY_WINDOWS[analysisType];
    if (!window) throw new Error(`Tipo de análisis no soportado: "${analysisType}"`);

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

  async getUser(userId) {
    if (this.db && this.db.collection) {
      const id = this.safeId(userId);
      return await this.db.collection('users').findOne({ _id: id });
    }
    return null;
  }

  async getRecentResponses(userId, window, topicFilter) {
    if (this.db && this.db.collection) {
      const id = this.safeId(userId);
      const query = { userId: id };
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

  async getPreviousAnalysis(userId, window) {
    if (this.db && this.db.collection) {
      const id = this.safeId(userId);
      return await this.db.collection('ai_analysis')
        .find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(window.analysisLimit)
        .toArray();
    }
    return [];
  }

  async getLearningPath(userId) {
    if (this.db && this.db.collection) {
      const id = this.safeId(userId);
      return await this.db.collection('learning_paths').findOne({ userId: id });
    }
    return null;
  }

  formatUserSummary(user) {
    if (!user) return { name: 'Estudiante', level: 'no definido', goals: [], language: 'es' };
    return {
      name: user.displayName || 'Estudiante',
      level: user.preferences?.experienceLevel || 'no definido',
      goals: user.preferences?.learningGoals || [],
      language: user.preferences?.language || 'es',
    };
  }

  formatResponses(responses) {
    return responses.map((r, index) => ({
      index: index + 1,
      exercise: r.exerciseId,
      topic: r.topic || 'N/A',
      answer: typeof r.answer === 'string' ? r.answer.substring(0, 500) : r.answer,
      score: r.score,
      correct: r.isCorrect,
      date: r.submittedAt,
    }));
  }

  formatAnalysis(analyses) {
    return analyses.map(a => ({
      type: a.type,
      date: a.createdAt,
      result: a.result,
    }));
  }

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

  contextToPromptText(context) {
    const parts = [];
    parts.push(`## Perfil del Estudiante`);
    parts.push(`- Nombre: ${context.user.name}`);
    parts.push(`- Nivel: ${context.user.level}`);

    if (context.recentResponses.length > 0) {
      parts.push(`\n## Historial Reciente (${context.recentResponses.length} respuestas)`);
      context.recentResponses.forEach(r => {
        parts.push(`${r.index}. [${r.topic}] Puntaje: ${r.score}/100 | Fecha: ${r.date}`);
      });
    }

    return parts.join('\n');
  }
}

module.exports = HistoryBuilder;
