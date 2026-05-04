const express = require('express');
const AIService = require('../services/ai.service');

// ============================================================
// AI Routes — Endpoints de la API de IA
// ============================================================
// Estos endpoints son los contratos que el frontend consumirá.
// El equipo de backend los integrará con el middleware de auth
// y la conexión real a MongoDB.
// ============================================================

const router = express.Router();

/**
 * Inicializa las rutas con la instancia de DB.
 * @param {Object} db - Instancia de conexión a MongoDB
 * @returns {express.Router}
 */
function createAIRoutes(db) {
  const aiService = new AIService(db);

  // ───────────────────────────────────────────
  // POST /api/ai/analyze-exercise
  // ───────────────────────────────────────────
  // Analiza la respuesta de un usuario a un ejercicio.
  //
  // Body: { userId, exerciseId, answer, timeSpentSeconds }
  // Response: { analysis: ExerciseAnalysisSchema }
  // ───────────────────────────────────────────
  router.post('/analyze-exercise', async (req, res) => {
    try {
      const { userId, exerciseId, answer, timeSpentSeconds } = req.body;

      // Validar campos requeridos
      if (!userId || !exerciseId || answer === undefined) {
        return res.status(400).json({
          error: 'Campos requeridos: userId, exerciseId, answer',
        });
      }

      // TODO: Obtener el ejercicio completo desde la DB
      // Por ahora se acepta el exerciseId y se construye un placeholder
      let exercise = { _id: exerciseId };
      if (db && db.collection) {
        exercise = await db.collection('exercises').findOne({ _id: exerciseId });
        if (!exercise) {
          return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }
      }

      // Guardar la respuesta del usuario en user_responses
      const userResponse = {
        userId,
        exerciseId,
        answer,
        timeSpentSeconds: timeSpentSeconds || 0,
        isCorrect: null, // La IA determinará esto en su análisis
        attemptNumber: 1, // TODO: calcular basado en respuestas previas
        submittedAt: new Date(),
      };

      if (db && db.collection) {
        await db.collection('user_responses').insertOne(userResponse);
      }

      // Analizar con IA
      const analysis = await aiService.analyzeExercise(
        userId,
        exercise,
        answer,
        timeSpentSeconds || 0
      );

      res.json({
        success: true,
        analysis,
      });
    } catch (error) {
      console.error('[AI Route] Error en analyze-exercise:', error);
      res.status(500).json({
        error: 'Error al analizar el ejercicio',
        message: error.message,
      });
    }
  });

  // ───────────────────────────────────────────
  // POST /api/ai/recommendations
  // ───────────────────────────────────────────
  // Genera recomendaciones de estudio personalizadas.
  //
  // Body: { userId }
  // Response: { recommendations: StudyRecommendationSchema }
  // ───────────────────────────────────────────
  router.post('/recommendations', async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: 'Campo requerido: userId',
        });
      }

      const recommendations = await aiService.getStudyRecommendations(userId);

      res.json({
        success: true,
        recommendations,
      });
    } catch (error) {
      console.error('[AI Route] Error en recommendations:', error);
      res.status(500).json({
        error: 'Error al generar recomendaciones',
        message: error.message,
      });
    }
  });

  // ───────────────────────────────────────────
  // GET /api/ai/progress/:userId
  // ───────────────────────────────────────────
  // Análisis de progreso histórico del usuario.
  //
  // Params: userId
  // Response: { progress: ProgressAnalysisSchema }
  // ───────────────────────────────────────────
  router.get('/progress/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          error: 'Parámetro requerido: userId',
        });
      }

      const progress = await aiService.analyzeProgress(userId);

      res.json({
        success: true,
        progress,
      });
    } catch (error) {
      console.error('❌ [AI Route] CRASH en analyze-progress:', error);
      res.status(500).json({
        error: 'Error al analizar el progreso',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // ───────────────────────────────────────────
  // POST /api/ai/project-plan
  // ───────────────────────────────────────────
  // Genera un plan de estudio para un proyecto específico.
  router.post('/project-plan', async (req, res) => {
    try {
      const { userId, projectName } = req.body;

      if (!userId || !projectName) {
        return res.status(400).json({
          error: 'Campos requeridos: userId, projectName',
        });
      }

      const plan = await aiService.generateProjectPlan(userId, projectName);

      res.json({
        success: true,
        plan,
      });
    } catch (error) {
      console.error('❌ [AI Route] Error en project-plan:', error);
      res.status(500).json({
        error: 'Error al generar el plan de proyecto',
        message: error.message,
      });
    }
  });

  // ───────────────────────────────────────────
  // POST /api/ai/chat
  // ───────────────────────────────────────────
  // Chat libre con el tutor IA.
  //
  // Body: { userId, message }
  // Response: { response: TutorChatResponseSchema }
  // ───────────────────────────────────────────
  router.post('/chat', async (req, res) => {
    try {
      const { userId, message } = req.body;

      if (!userId || !message) {
        return res.status(400).json({
          error: 'Campos requeridos: userId, message',
        });
      }

      if (message.length > 2000) {
        return res.status(400).json({
          error: 'El mensaje no puede exceder 2000 caracteres',
        });
      }

      const response = await aiService.chat(userId, message);

      res.json({
        success: true,
        response,
      });
    } catch (error) {
      console.error('[AI Route] Error en chat:', error);
      res.status(500).json({
        error: 'Error en el chat con el tutor',
        message: error.message,
      });
    }
  });

  // ───────────────────────────────────────────
  // GET /api/ai/health
  // ───────────────────────────────────────────
  // Health check del servicio de IA.
  // ───────────────────────────────────────────
  router.get('/health', (req, res) => {
    const config = require('../config/ai.config').getAIConfig();
    res.json({
      status: 'ok',
      provider: config.provider,
      model: config.model,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = createAIRoutes;
