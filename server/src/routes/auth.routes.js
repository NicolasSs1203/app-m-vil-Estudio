const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
// Importamos tu middleware para la ruta /me
const { authMiddleware } = require('../middleware/auth.middleware');

// ───────────────────────────────────────────
// 1. POST /api/auth/register (Checklist ✅)
// ───────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Hasheamos la contraseña antes de "guardarla"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // TODO: Aquí conectarás con tu DB de MongoDB
    const newUser = { id: Date.now().toString(), name, email };

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ success: true, token, user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// ───────────────────────────────────────────
// 2. POST /api/auth/login (Checklist ✅)
// ───────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const mockUser = {
      id: 'user_123',
      email: 'santiago@estudio.com',
      passwordHash: await bcrypt.hash('123456', 10) 
    };

    const isMatch = await bcrypt.compare(password, mockUser.passwordHash);
    
    if (email !== mockUser.email || !isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, user: { id: mockUser.id, email: mockUser.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ───────────────────────────────────────────
// 3. POST /api/auth/refresh (Checklist ✅)
// ───────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    // Verificamos el token (incluso si ya expiró para poder renovarlo)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    // Generamos un nuevo token con otros 24h de vida
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
// 4. GET /api/auth/me (Checklist ✅)
// ───────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;