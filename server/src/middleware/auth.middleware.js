// ============================================================
// Auth Middleware — Placeholder
// ============================================================
// Este middleware es un placeholder para que el equipo de backend
// implemente la autenticación real (JWT, sessions, etc.).
//
// Actualmente pasa todas las requests sin autenticación para
// facilitar el desarrollo de la capa de IA.
// ============================================================

/**
 * Middleware de autenticación.
 *
 * TODO (equipo backend):
 * 1. Implementar verificación de JWT o sesión
 * 2. Extraer userId del token verificado
 * 3. Adjuntar user info a req.user
 * 4. Retornar 401 si no hay token o es inválido
 *
 * Ejemplo de implementación futura:
 * ```
 * const jwt = require('jsonwebtoken');
 *
 * function authMiddleware(req, res, next) {
 *   const token = req.headers.authorization?.split(' ')[1];
 *   if (!token) return res.status(401).json({ error: 'Token requerido' });
 *
 *   try {
 *     const decoded = jwt.verify(token, process.env.JWT_SECRET);
 *     req.user = { id: decoded.userId, email: decoded.email };
 *     next();
 *   } catch (err) {
 *     return res.status(401).json({ error: 'Token inválido' });
 *   }
 * }
 * ```
 */
function authMiddleware(req, res, next) {
  // MODO DESARROLLO: No requiere autenticación
  // El userId se toma del body o params de cada request

  console.log(`[Auth] Request: ${req.method} ${req.path} (modo desarrollo — sin autenticación)`);

  // Placeholder: adjuntar user genérico
  req.user = req.body?.userId
    ? { id: req.body.userId }
    : { id: 'dev-user-001' };

  next();
}

/**
 * Middleware de rate limiting para endpoints de IA.
 *
 * TODO (equipo backend):
 * Implementar rate limiting real usando redis o similar.
 * Sugerencia: máximo 50 llamadas por usuario por hora.
 */
function aiRateLimiter(req, res, next) {
  // PLACEHOLDER: sin rate limiting en desarrollo
  next();
}

module.exports = {
  authMiddleware,
  aiRateLimiter,
};
