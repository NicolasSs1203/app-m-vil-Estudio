# 🗄️ Guía del Equipo de Base de Datos

## Tu Rol

Implementar y mantener las **5 colecciones de MongoDB** que la capa de IA necesita para funcionar. Los schemas están definidos como contratos en `server/src/models/data.contracts.js`.

## Herramientas Recomendadas

Pueden usar cualquiera de estas opciones:
- **Mongoose** — ODM con validación integrada (recomendado para velocidad de desarrollo)
- **Driver nativo de MongoDB** — Más control, menos abstracción
- **MongoDB Atlas** — Para hosting en la nube (tiene tier gratuito)

---

## Colecciones a Crear

### 1. `users` — Usuarios registrados

```javascript
{
  _id: ObjectId,                    // Generado automáticamente
  email: String,                    // REQUERIDO, ÚNICO
  displayName: String,              // Nombre visible en la app
  preferences: {
    language: String,               // "es" o "en" — idioma del tutor IA
    learningGoals: [String],        // Ej: ["Frontend", "Backend", "DevOps"]
    experienceLevel: String,        // "beginner" | "intermediate" | "advanced"
    dailyGoalMinutes: Number        // Meta diaria en minutos (ej: 30)
  },
  createdAt: Date,                  // Fecha de registro
  lastActiveAt: Date                // Última actividad
}
```

**Índices:**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ lastActiveAt: -1 })
```

**Ejemplo de documento:**
```json
{
  "_id": "664a1b2c3d4e5f6a7b8c9d0e",
  "email": "estudiante@example.com",
  "displayName": "Juan Pérez",
  "preferences": {
    "language": "es",
    "learningGoals": ["Frontend", "React"],
    "experienceLevel": "beginner",
    "dailyGoalMinutes": 30
  },
  "createdAt": "2026-04-20T10:00:00Z",
  "lastActiveAt": "2026-04-25T15:30:00Z"
}
```

---

### 2. `exercises` — Catálogo de ejercicios

```javascript
{
  _id: ObjectId,
  topic: String,                    // Ej: "JavaScript - Closures"
  category: String,                 // "Frontend" | "Backend" | "DevOps" | etc.
  difficulty: String,               // "easy" | "medium" | "hard"
  type: String,                     // "multiple_choice" | "code" | "open_answer"
  question: String,                 // Enunciado del ejercicio
  options: [String],                // SOLO para multiple_choice
  correctAnswer: Mixed,             // String o Array según el tipo
  explanation: String,              // Explicación de la respuesta correcta
  tags: [String],                   // Tags para búsqueda y filtrado
  createdAt: Date
}
```

**Índices:**
```javascript
db.exercises.createIndex({ topic: 1, difficulty: 1 })
db.exercises.createIndex({ tags: 1 })
db.exercises.createIndex({ category: 1 })
```

**Ejemplo — Multiple Choice:**
```json
{
  "topic": "JavaScript - Closures",
  "category": "Frontend",
  "difficulty": "medium",
  "type": "multiple_choice",
  "question": "¿Qué es un closure en JavaScript?",
  "options": [
    "Una función que se ejecuta inmediatamente",
    "Una función que tiene acceso al scope de su función padre, incluso después de que esta haya terminado",
    "Un método para cerrar conexiones de red",
    "Una forma de encapsular CSS en JavaScript"
  ],
  "correctAnswer": "Una función que tiene acceso al scope de su función padre, incluso después de que esta haya terminado",
  "explanation": "Un closure es una función que 'recuerda' el entorno léxico en el que fue creada...",
  "tags": ["javascript", "closures", "scope", "funciones"]
}
```

**Ejemplo — Code:**
```json
{
  "topic": "JavaScript - Array Methods",
  "category": "Frontend",
  "difficulty": "easy",
  "type": "code",
  "question": "Escribe una función que filtre los números pares de un array usando .filter()",
  "correctAnswer": "function filterEven(arr) { return arr.filter(n => n % 2 === 0); }",
  "explanation": "Array.filter() crea un nuevo array con los elementos que cumplan la condición...",
  "tags": ["javascript", "arrays", "filter", "métodos"]
}
```

---

### 3. `user_responses` — Historial de respuestas  COLECCIÓN CRÍTICA

> **Esta es la colección MÁS consultada por la IA.** Los índices son esenciales para el rendimiento.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref → users._id
  exerciseId: ObjectId,             // ref → exercises._id
  answer: Mixed,                    // Lo que el usuario respondió (texto, código, opción)
  isCorrect: Boolean,               // Si la respuesta fue correcta
  timeSpentSeconds: Number,         // Cuánto tiempo tardó en responder
  attemptNumber: Number,            // Intento #1, #2, #3... para el MISMO ejercicio
  submittedAt: Date                 // Cuándo envió la respuesta
}
```

**Índices (CRÍTICOS):**
```javascript
// Consulta más frecuente: historial reciente del usuario
db.user_responses.createIndex({ userId: 1, submittedAt: -1 })

// Para contar intentos por ejercicio
db.user_responses.createIndex({ userId: 1, exerciseId: 1, submittedAt: -1 })
```

**Notas importantes:**
- `attemptNumber` se calcula contando cuántas respuestas previas existen para el mismo `userId + exerciseId`
- `isCorrect` se determina comparando `answer` con `exercises.correctAnswer`
- Para ejercicios tipo `"code"` y `"open_answer"`, `isCorrect` puede ser `null` inicialmente y la IA lo determinará en su análisis

---

### 4. `ai_analysis` — Análisis generados por la IA

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref → users._id
  type: String,                     // "exercise_analysis" | "study_recommendation" | "progress_analysis"
  triggerEvent: String,             // "exercise_submitted" | "daily_review" | "user_request"
  input: {
    responseIds: [ObjectId],        // Qué respuestas se analizaron
    historyWindow: Number           // Cuántas respuestas se incluyeron como contexto
  },
  result: Object,                   // JSON estructurado de la IA (varía según type)
  model: String,                    // "gpt-4o-mini" | "deepseek-chat"
  tokensUsed: {
    prompt: Number,                 // Tokens de entrada
    completion: Number,             // Tokens de salida
    total: Number                   // Total consumido
  },
  createdAt: Date
}
```

**Índices:**
```javascript
db.ai_analysis.createIndex({ userId: 1, type: 1, createdAt: -1 })
db.ai_analysis.createIndex({ userId: 1, createdAt: -1 })
```

**Nota:** El campo `result` tiene estructura diferente según el `type`. Ver los Zod schemas en `server/src/schemas/ai.schemas.js` para el formato exacto de cada tipo.

---

### 5. `learning_paths` — Ruta de aprendizaje personalizada

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // ref → users._id (ÚNICO — 1 path por usuario)
  generatedByAI: Boolean,           // true si la IA lo generó/actualizó
  topics: [{
    name: String,                   // Nombre del tema
    status: String,                 // "pending" | "in_progress" | "completed" | "needs_review"
    priority: Number,               // 1 = más urgente
    lastUpdated: Date,
    aiNotes: String                 // Notas del tutor IA sobre este tema
  }],
  lastGeneratedAt: Date,            // Última actualización por la IA
  nextReviewAt: Date                // Cuándo sugiere la IA revisarlo
}
```

**Índices:**
```javascript
db.learning_paths.createIndex({ userId: 1 }, { unique: true })
```

---

## Datos Iniciales (Seed)

Necesitan crear un script de seed con al menos **10-15 ejercicios** cubriendo distintos temas y dificultades para poder probar la IA. Distribución sugerida:

| Categoría | Topics sugeridos | Cantidad |
|-----------|-----------------|----------|
| Frontend | JavaScript Basics, DOM, React | 5 |
| Backend | Node.js, Express, APIs REST | 5 |
| General | Git, Terminal, Debugging | 3-5 |

Mezclar dificultades: 40% easy, 40% medium, 20% hard.

---

## Queries que la IA Ejecuta

Estas son las consultas que el History Builder hace. Optimicen los índices para estas:

```javascript
// 1. Últimas N respuestas del usuario (la más frecuente)
db.user_responses.find({ userId: X })
  .sort({ submittedAt: -1 })
  .limit(10)

// 2. Respuestas filtradas por topic (requiere lookup con exercises)
db.user_responses.aggregate([
  { $match: { userId: X } },
  { $lookup: { from: "exercises", localField: "exerciseId", foreignField: "_id", as: "exercise" } },
  { $match: { "exercise.topic": "JavaScript - Closures" } },
  { $sort: { submittedAt: -1 } },
  { $limit: 10 }
])

// 3. Análisis previos de la IA
db.ai_analysis.find({ userId: X })
  .sort({ createdAt: -1 })
  .limit(5)

// 4. Learning path del usuario
db.learning_paths.findOne({ userId: X })
```

---

## Checklist de Entrega

- [ ] Las 5 colecciones creadas en MongoDB
- [ ] Todos los índices creados
- [ ] Script de seed con ejercicios de prueba
- [ ] Validaciones a nivel de DB (campos requeridos, únicos)
- [ ] Conexión configurada y exportada para que el backend la use
- [ ] Documentar el string de conexión en `.env` (`MONGODB_URI`)
