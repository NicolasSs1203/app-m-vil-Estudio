const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');  // ← Agrega esta línea

const express = require('express');
const cors = require('cors');
// ... resto del código
const mongoose = require('mongoose'); // Agregado: Mongoose para la conexión
require('dotenv').config();

const createAIRoutes = require('./routes/ai.routes');
const authRoutes = require('./routes/auth.routes');
const createExerciseRoutes = require('./routes/exercise.routes');
const { authMiddleware, aiRateLimiter } = require('./middleware/auth.middleware');

// ============================================================
// IMPORTACIÓN DE MODELOS (Basado en image_a4e876.png)
// ============================================================
// Importamos los modelos para que estén disponibles en toda la app
const { 
  User, 
  Exercise, 
  UserResponse, 
  AIAnalysis, 
  LearningPath 
} = require('./models/Schemas');

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
    // Actualizado: Reporta estado de DB (0: desc, 1: conn, 2: connecting, 3: disconn)
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ───────────────────────────────────────────
// Conexión a base de datos (Implementado según image_b0cbec.png)
// ───────────────────────────────────────────
let db = null;

const connectDB = async () => {
  try {
    // Conexión usando la URI del .env
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    db = conn.connection;
    console.log(`✅ MongoDB Conectado: ${db.host}`);
  } catch (error) {
    // Manejo de errores y logs
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    
    // Tip de seguridad para el usuario (image_a4e876.png)
    if (error.message.includes('Authentication failed')) {
        console.log('👉 Revisa que la contraseña en tu archivo .env no tenga los caracteres < >');
    }
    
    console.log('Reintentando conexión en 5 segundos...');
    setTimeout(connectDB, 5000); // Retry automático
  }
};

connectDB();

// ───────────────────────────────────────────
// Rutas de IA (con middleware de auth y rate limit)
// ───────────────────────────────────────────
// Ahora se pasa la instancia 'db' real una vez conectada
app.use('/api/ai', authMiddleware, aiRateLimiter, createAIRoutes(db));
app.use('/api/auth', authRoutes);
app.use('/api/exercises', createExerciseRoutes(db));

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
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/register`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/exercises`);
  console.log(`   GET  /api/exercises/:id`);
  console.log(`   POST /api/exercises/:id/submit`);
  console.log(`   POST /api/ai/chat`);
  console.log('');
});

module.exports = app;
