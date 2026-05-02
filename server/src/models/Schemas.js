const mongoose = require('mongoose');

// 1. Esquema de Usuarios (users) - image_a5d03d.png
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: String,
  preferences: {
    language: { type: String, enum: ['es', 'en'], default: 'es' },
    learningGoals: [String],
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    dailyGoalMinutes: Number,
  },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, index: -1 } // Índice recomendado
});

// 2. Esquema de Ejercicios (exercises)
const exerciseSchema = new mongoose.Schema({
  topic: String,
  category: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  type: { type: String, enum: ['multiple_choice', 'code', 'open_answer'] },
  question: String,
  options: [String],
  correctAnswer: mongoose.Schema.Types.Mixed,
  explanation: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});
exerciseSchema.index({ topic: 1, difficulty: 1 }); // Índice compuesto
exerciseSchema.index({ tags: 1 });
exerciseSchema.index({ category: 1 });

// 3. Esquema de Respuestas (user_responses) - CRÍTICO PARA IA
const userResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  timeSpentSeconds: Number,
  attemptNumber: Number,
  submittedAt: { type: Date, default: Date.now }
});
userResponseSchema.index({ userId: 1, submittedAt: -1 }); // Historial reciente
userResponseSchema.index({ userId: 1, exerciseId: 1, submittedAt: -1 }); // Intentos

// 4. Esquema de Análisis IA (ai_analysis)
const aiAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['exercise_analysis', 'study_recommendation', 'progress_analysis'] },
  triggerEvent: String,
  input: {
    responseIds: [{ type: mongoose.Schema.Types.ObjectId }],
    historyWindow: Number
  },
  result: mongoose.Schema.Types.Mixed,
  model: String,
  tokensUsed: { prompt: Number, completion: Number, total: Number },
  createdAt: { type: Date, default: Date.now }
});
aiAnalysisSchema.index({ userId: 1, type: 1, createdAt: -1 });
aiAnalysisSchema.index({ userId: 1, createdAt: -1 });

// 5. Esquema de Rutas de Aprendizaje (learning_paths)
const learningPathSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  generatedByAI: Boolean,
  topics: [{
    name: String,
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'needs_review'] },
    priority: Number,
    lastUpdated: Date,
    aiNotes: String
  }],
  lastGeneratedAt: Date,
  nextReviewAt: Date
});
learningPathSchema.index({ nextReviewAt: 1 }); 


// Exportar Modelos
module.exports = {
  User: mongoose.model('User', userSchema),
  Exercise: mongoose.model('Exercise', exerciseSchema),
  UserResponse: mongoose.model('UserResponse', userResponseSchema),
  AIAnalysis: mongoose.model('AIAnalysis', aiAnalysisSchema),
  LearningPath: mongoose.model('LearningPath', learningPathSchema)
};