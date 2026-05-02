#  Guía del Equipo de Backend

## Tu Rol

Conectar la **capa de IA** (ya implementada) con la **base de datos** (equipo DB) y el **frontend** (equipo mobile). Tu trabajo principal es:

1. Conectar MongoDB al servidor Express
2. Implementar la autenticación (JWT)
3. Llenar los placeholders de consultas a DB en el History Builder
4. Implementar rate limiting para las llamadas a la IA
5. Agregar rutas adicionales (CRUD de usuarios, ejercicios, etc.)

---

## Contexto: Lo que ya está implementado

La capa de IA ya está completa y funcional. Estos archivos **no necesitan modificación** :

| Archivo | Qué hace | ¿Modificar? |
|---------|----------|-------------|
| `src/config/ai.config.js` | Configura OpenAI/DeepSeek | No tocar |
| `src/schemas/ai.schemas.js` | Schemas de respuesta de IA | No tocar |
| `src/services/ai.service.js` | Lógica de IA y prompts | No tocar |
| `src/services/history.builder.js` | Consultas a DB para contexto |  **Llenar placeholders** |
| `src/routes/ai.routes.js` | Endpoints de IA |  Ajustar validaciones |
| `src/middleware/auth.middleware.js` | Auth placeholder |  **Implementar JWT** |
| `src/index.js` | Entry point |  **Conectar DB** |

---

## Paso 1: Conectar MongoDB

### Opción A: Driver Nativo

```bash
npm install mongodb
```

### Opción B: Mongoose (recomendado)

```bash
npm install mongoose
```

### Modificar `src/index.js`

Reemplazar el placeholder de conexión a DB:

```javascript
// ─── ANTES (placeholder) ───
let db = null;

// ─── DESPUÉS (con Mongoose) ───
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Conectado a MongoDB');
    return mongoose.connection.db; // Instancia nativa del driver
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// En la inicialización del servidor:
async function startServer() {
  const db = await connectDB();
  
  // Pasar db a las rutas de IA
  app.use('/api/ai', authMiddleware, aiRateLimiter, createAIRoutes(db));
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
```

> ⚠️ **Importante**: La variable `db` que pasan a `createAIRoutes(db)` debe ser la instancia nativa de MongoDB (`mongoose.connection.db`), NO la instancia de Mongoose. El History Builder usa `db.collection('nombre')` directamente.

---

## Paso 2: Implementar Autenticación

### Instalar dependencias

```bash
npm install jsonwebtoken bcryptjs
```

### Modificar `src/middleware/auth.middleware.js`

El archivo ya tiene un ejemplo comentado. La implementación real:

```javascript
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
```

### Agregar a `.env`

```env
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
JWT_EXPIRES_IN=7d
```

### Crear rutas de auth

Crear `src/routes/auth.routes.js` con:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registro de nuevo usuario |
| `POST` | `/api/auth/login` | Login, retorna JWT |
| `GET` | `/api/auth/me` | Obtener usuario actual con token |

---

## Paso 3: Llenar Placeholders del History Builder

El archivo `src/services/history.builder.js` tiene métodos con placeholders listos para conectar con MongoDB. Los métodos que necesitan implementación real:

### `getUser(userId)`
```javascript
async getUser(userId) {
  // Ya implementado como placeholder — solo verificar que funciona con su DB
  return await this.db.collection('users').findOne({ _id: new ObjectId(userId) });
}
```

### `getRecentResponses(userId, window, topicFilter)`
```javascript
async getRecentResponses(userId, window, topicFilter) {
  const query = { userId: new ObjectId(userId) };

  // Si hay filtro de tiempo
  if (window.maxDaysBack) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - window.maxDaysBack);
    query.submittedAt = { $gte: cutoff };
  }

  // Si hay filtro por topic, usar aggregation pipeline
  if (window.filterByTopic && topicFilter) {
    return await this.db.collection('user_responses').aggregate([
      { $match: query },
      { $lookup: {
          from: 'exercises',
          localField: 'exerciseId',
          foreignField: '_id',
          as: 'exercise'
      }},
      { $unwind: '$exercise' },
      { $match: { 'exercise.topic': topicFilter } },
      { $sort: { submittedAt: -1 } },
      { $limit: window.responsesLimit },
    ]).toArray();
  }

  return await this.db.collection('user_responses')
    .find(query)
    .sort({ submittedAt: -1 })
    .limit(window.responsesLimit)
    .toArray();
}
```

---

## Paso 4: Implementar Rate Limiting

### Opción simple (en memoria)

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hora
  max: 50,                     // 50 requests por hora por IP
  message: {
    error: 'Demasiadas solicitudes. Intenta de nuevo en una hora.',
  },
  standardHeaders: true,
});
```

### Opción producción (con Redis)

```bash
npm install rate-limit-redis ioredis
```

---

## Paso 5: Rutas CRUD Adicionales

Crear estos archivos de rutas que el frontend también necesitará:

### `src/routes/user.routes.js`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/users/me` | Perfil del usuario actual |
| `PUT` | `/api/users/me/preferences` | Actualizar preferencias |
| `GET` | `/api/users/me/stats` | Estadísticas generales |

### `src/routes/exercise.routes.js`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/exercises` | Listar ejercicios (con filtros) |
| `GET` | `/api/exercises/:id` | Detalle de un ejercicio |
| `POST` | `/api/exercises/:id/submit` | Enviar respuesta |
| `GET` | `/api/exercises/topics` | Listar topics disponibles |

### `src/routes/history.routes.js`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/history` | Historial de respuestas del usuario |
| `GET` | `/api/history/stats` | Estadísticas de desempeño |

---

## Flujo de Datos Completo

Este es el flujo que ocurre cuando un usuario envía una respuesta:

```
1. Frontend envía POST /api/ai/analyze-exercise
   Body: { userId, exerciseId, answer, timeSpentSeconds }
        │
2. ──▶ auth.middleware.js verifica JWT
        │
3. ──▶ ai.routes.js valida el body
        │
4. ──▶ Guarda en collection 'user_responses'
        │
5. ──▶ ai.service.js.analyzeExercise()
        │
6.   ──▶ history.builder.js consulta las últimas 10 respuestas del mismo topic
        │
7.   ──▶ Construye prompt con contexto del historial
        │
8.   ──▶ Envía a OpenAI/DeepSeek API
        │
9.   ──▶ Valida respuesta con Zod schema
        │
10.  ──▶ Guarda en collection 'ai_analysis'
        │
11. ◀── Retorna JSON validado al frontend
```

---

## Variables de Entorno Requeridas

```env
# Ya definidas (no modificar)
AI_PROVIDER=openai
AI_API_KEY=sk-xxx
AI_MODEL=gpt-4o-mini
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/learning-app

# Agregar (equipo backend)
JWT_SECRET=cambiar-en-produccion
JWT_EXPIRES_IN=7d
```

---

## Checklist de Entrega

- [ ] MongoDB conectado en `index.js` (con manejo de errores)
- [ ] `db` pasado correctamente a `createAIRoutes(db)`
- [ ] Auth middleware implementado con JWT
- [ ] Placeholders de `history.builder.js` conectados con queries reales
- [ ] Rate limiting en endpoints de IA
- [ ] Rutas CRUD de usuarios y ejercicios
- [ ] Ruta de submit de respuesta guarda en `user_responses`
- [ ] Manejo de errores global funcional
- [ ] `.env` con todas las variables documentadas
