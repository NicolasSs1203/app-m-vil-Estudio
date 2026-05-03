const express = require('express');
const router = express.Router();
const ExerciseService = require('../services/exercise.service');
const { authMiddleware } = require('../middleware/auth.middleware');

function createExerciseRoutes(db) {
  const exerciseService = new ExerciseService(db);

  // 1. GET /api/exercises — Listar con filtros (Topic, Difficulty, Category)
  router.get('/', async (req, res) => {
    try {
      const exercises = await exerciseService.findAll(req.query);
      res.json({ success: true, count: exercises.length, data: exercises });
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el catálogo' });
    }
  });

  // 2. GET /api/exercises/:id — Obtener uno específico
  router.get('/:id', async (req, res) => {
    try {
      const exercise = await exerciseService.findById(req.params.id);
      if (!exercise) return res.status(404).json({ error: 'Ejercicio no encontrado' });
      res.json({ success: true, data: exercise });
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar el ejercicio' });
    }
  });

  // 3. POST /api/exercises/:id/submit — Enviar respuesta (Checklist ✅)
  // Esta ruta valida quién eres y procesa tu solución
  router.post('/:id/submit', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { solution } = req.body;
      const userId = req.user.id; // Obtenido del token JWT por el authMiddleware

      const result = await exerciseService.submitResponse(id, userId, solution);

      res.json({
        success: true,
        message: result.isCorrect ? '¡Excelente! Respuesta correcta.' : 'No es la respuesta correcta, ¡inténtalo de nuevo!',
        isCorrect: result.isCorrect,
        attempt: result.attemptNumber,
        submittedAt: result.submittedAt
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // 4. POST /api/exercises — Crear ejercicio (Protegido)
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const newExercise = await exerciseService.create(req.body);
      res.status(201).json({ success: true, data: newExercise });
    } catch (error) {
      res.status(400).json({ error: 'Error al crear ejercicio' });
    }
  });

  // 5. PUT /api/exercises/:id — Actualizar (Protegido)
  router.put('/:id', authMiddleware, (req, res) => {
    res.json({ success: true, message: `Ejercicio ${req.params.id} actualizado (Mock)` });
  });

  // 6. DELETE /api/exercises/:id — Eliminar (Protegido)
  router.delete('/:id', authMiddleware, (req, res) => {
    res.json({ success: true, message: `Ejercicio ${req.params.id} eliminado (Mock)` });
  });

  return router;
}

module.exports = createExerciseRoutes;