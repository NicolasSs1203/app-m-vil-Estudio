const express = require('express');
const cors = require('cors');
require('dotenv').config();

const createAIRoutes = require('./routes/ai.routes');
const { authMiddleware, aiRateLimiter } = require('./middleware/auth.middleware');

// ============================================================
// Server Entry Point
// ============================================================

const app = express();
const PORT = process.env.PORT || 3001;

// ───────────────────────────────────────────
// Middleware global
// ───────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ───────────────────────────────────────────
// Health check general
// ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'software-learning-app',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ───────────────────────────────────────────
// Conexión a base de datos
// ───────────────────────────────────────────
// TODO (equipo backend): Implementar conexión real a MongoDB
// Ejemplo con driver nativo:
//
// const { MongoClient } = require('mongodb');
// const client = new MongoClient(process.env.MONGODB_URI);
// await client.connect();
// const db = client.db();
//
// Ejemplo con Mongoose:
//
// const mongoose = require('mongoose');
// await mongoose.connect(process.env.MONGODB_URI);

// Por ahora, db es null — la capa de IA funciona sin DB (logs a consola)
let db = null;

// ───────────────────────────────────────────
// Rutas de IA (con middleware de auth y rate limit)
// ───────────────────────────────────────────
app.use('/api/ai', authMiddleware, aiRateLimiter, createAIRoutes(db));

// ───────────────────────────────────────────
// Manejo de errores global
// ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ───────────────────────────────────────────
// Iniciar servidor
// ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   AI Provider: ${process.env.AI_PROVIDER || 'openai'}`);
  console.log(`   AI Model: ${process.env.AI_MODEL || 'gpt-4o-mini'}`);
  console.log(`\n📡 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/ai/health`);
  console.log(`   POST /api/ai/analyze-exercise`);
  console.log(`   POST /api/ai/recommendations`);
  console.log(`   GET  /api/ai/progress/:userId`);
  console.log(`   POST /api/ai/chat`);
  console.log('');
});

module.exports = app;
