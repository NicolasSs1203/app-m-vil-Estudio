const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { User } = require('../models/Schemas');
const { authMiddleware } = require('../middleware/auth.middleware');

// ───────────────────────────────────────────
// 1. POST /api/auth/login — Conectado a MongoDB Atlas ✅
// ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario en MongoDB Atlas (incluir passwordHash explícitamente)
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ error: 'Recluta no encontrado. Verifica tu correo.' });
    }

    // Si el usuario tiene contraseña hasheada, verificarla; si no (usuarios de prueba), permitir
    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Contraseña incorrecta.' });
      }
    }

    // Actualizar actividad
    user.lastActiveAt = new Date();
    await user.save();

    // Generar JWT real
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('❌ Error en /api/auth/login:', error);
    res.status(500).json({ error: 'Error interno del servidor al autenticar' });
  }
});

// ───────────────────────────────────────────
// 2. POST /api/auth/register — Crea usuario en MongoDB ✅
// ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, nivel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
    }

    // Verificar si ya existe
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Mapear nivel al formato del schema
    const levelMap = { 'Principiante': 'beginner', 'Intermedio': 'intermediate', 'Avanzado': 'advanced' };
    const experienceLevel = levelMap[nivel] || 'beginner';

    // Crear usuario en la DB
    const newUser = new User({
      email: email.trim().toLowerCase(),
      displayName: name,
      passwordHash,
      preferences: {
        language: 'es',
        experienceLevel,
        learningGoals: [],
        dailyGoalMinutes: 30
      }
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: newUser._id, email: newUser.email, displayName: newUser.displayName }
    });

  } catch (error) {
    console.error('❌ Error en /api/auth/register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// ───────────────────────────────────────────
// 3. POST /api/auth/refresh — Renueva el token ✅
// ───────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, token: newToken });
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
});

// ───────────────────────────────────────────
// 4. GET /api/auth/me — Perfil del usuario logueado ✅
// ───────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// ───────────────────────────────────────────
// 5. PUT /api/auth/preferences — Actualizar preferencias ✅
// ───────────────────────────────────────────
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    const { dailyGoalMinutes, experienceLevel } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (dailyGoalMinutes) user.preferences.dailyGoalMinutes = dailyGoalMinutes;
    if (experienceLevel) user.preferences.experienceLevel = experienceLevel;

    await user.save();
    res.json({ success: true, message: 'Preferencias actualizadas', user });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar preferencias' });
  }
});

module.exports = router;