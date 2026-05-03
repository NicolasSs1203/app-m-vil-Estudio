const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación REAL con JWT.
 */
function authMiddleware(req, res, next) {
    // 1. Extraer el token del encabezado Authorization
    const authHeader = req.headers.authorization;

    // Checklist: Retornar 401 si el token no existe o no empieza con 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Acceso denegado. No se proporcionó un token válido.' 
        });
    }

    // El header viene como "Bearer XXXX...", así que tomamos solo el código (posición 1)
    const token = authHeader.split(' ')[1];

    try {
        // Checklist: Verificar el token usando la clave secreta del .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Checklist: Extraer userId del token y adjuntar a req.user
        // Ahora cualquier ruta que use este middleware sabrá exactamente quién es el usuario
        req.user = { 
            id: decoded.id || decoded.userId, 
            email: decoded.email 
        };

        console.log(`[Auth] Usuario autenticado: ${req.user.id}`);
        next(); 
    } catch (err) {
        // Checklist: Retornar 401 con mensaje claro si el token es inválido o expiró
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

/**
 * Middleware de rate limiting para endpoints de IA.
 * (Lo dejamos como está por ahora, ya que tu tarea actual es el Auth)
 */
function aiRateLimiter(req, res, next) {
    next();
}

module.exports = {
    authMiddleware,
    aiRateLimiter,
};