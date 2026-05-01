#  Guía del Equipo de Frontend (React Native + Expo)

## Tu Rol

Construir la interfaz móvil que consume los endpoints de la API. El backend ya expone los servicios de IA; tu trabajo es:

1. Implementar el **API client** para comunicarse con el backend
2. Diseñar las **pantallas** de la app
3. Implementar el flujo de **autenticación**
4. Mostrar los datos de la IA de forma visual y motivadora

---

## Configuración Inicial

### Instalar dependencias necesarias

```bash
cd mobile
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npm install axios
npm install @react-native-async-storage/async-storage
```

### Configurar URL del backend

Crear `mobile/src/config/api.config.js`:

```javascript
// En desarrollo con Expo, usar la IP local de tu máquina
// NO usar "localhost" — el emulador no lo resuelve igual

const API_BASE_URL = __DEV__
  ? 'http://192.168.X.X:3001/api'   // Cambiar por tu IP local
  : 'https://tu-dominio.com/api';    // URL de producción

export default API_BASE_URL;
```

>  **Nota**: En Android emulator usar `http://10.0.2.2:3001/api`. En dispositivo físico, usar la IP de tu red local.

---

## API Client

Crear `mobile/src/services/api.client.js` para centralizar todas las llamadas HTTP:

### Endpoints Disponibles

####  Autenticación (cuando el equipo backend los implemente)

| Método | Endpoint | Body | Respuesta |
|--------|----------|------|-----------|
| `POST` | `/auth/register` | `{ email, password, displayName }` | `{ token, user }` |
| `POST` | `/auth/login` | `{ email, password }` | `{ token, user }` |

####  Servicios de IA

| Método | Endpoint | Body / Params | Respuesta |
|--------|----------|---------------|-----------|
| `POST` | `/ai/analyze-exercise` | `{ userId, exerciseId, answer, timeSpentSeconds }` | `{ success, analysis }` |
| `POST` | `/ai/recommendations` | `{ userId }` | `{ success, recommendations }` |
| `GET` | `/ai/progress/:userId` | — | `{ success, progress }` |
| `POST` | `/ai/chat` | `{ userId, message }` | `{ success, response }` |
| `GET` | `/ai/health` | — | `{ status, provider, model }` |

---

## Formatos de Respuesta de la IA

Estas son las **estructuras exactas** que recibirás. Son fijas y validadas con Zod en el backend, así que puedes confiar en ellas al 100%.

### `POST /ai/analyze-exercise` → Análisis de Ejercicio

```json
{
  "success": true,
  "analysis": {
    "score": 65,
    "correctConcepts": [
      "Sintaxis de funciones",
      "Declaración de variables"
    ],
    "weakAreas": [
      {
        "topic": "Closures y Scope léxico",
        "severity": "high",
        "explanation": "Los closures son esenciales para callbacks, event handlers y React hooks. Sin entenderlos, tendrás problemas con useState y useEffect.",
        "suggestion": "Lee el capítulo 'Scope & Closures' de You Don't Know JS. Practica creando 3 funciones que mantengan estado privado con closures."
      },
      {
        "topic": "Hoisting",
        "severity": "medium",
        "explanation": "Entender hoisting evita bugs sutiles al declarar variables y funciones.",
        "suggestion": "Experimenta en la consola con var vs let/const y observa las diferencias."
      }
    ],
    "overallFeedback": "Tienes buena base con la sintaxis. El siguiente paso es dominar el scope, que es la clave para entender JavaScript moderno. ¡Sigue así! 💪"
  }
}
```

**Campos clave para la UI:**
- `score` → Barra de progreso o círculo de puntaje (0-100)
- `weakAreas[].severity` → Color coding: `high`=rojo, `medium`=amarillo, `low`=verde
- `overallFeedback` → Mostrar con estilo motivacional

---

### `POST /ai/recommendations` → Recomendaciones de Estudio

```json
{
  "success": true,
  "recommendations": {
    "recommendations": [
      {
        "type": "reinforce",
        "topic": "JavaScript Closures",
        "priority": "high",
        "reason": "Has fallado en 4 de 5 ejercicios de closures en la última semana.",
        "estimatedTime": "45 minutos",
        "resources": [
          "You Don't Know JS - Cap. Closures",
          "MDN Web Docs - Closures"
        ]
      },
      {
        "type": "explore",
        "topic": "Async/Await",
        "priority": "medium",
        "reason": "Ya dominas promesas básicas Async/await es el siguiente paso natural.",
        "estimatedTime": "1 hora",
        "resources": [
          "javascript.info - Async/Await",
          "Ejercicios prácticos con fetch()"
        ]
      }
    ],
    "learningPath": {
      "currentLevel": "Principiante avanzado",
      "nextMilestone": "Dominar programación asíncrona",
      "progress": 35
    },
    "motivationalNote": "Llevas 5 días seguidos practicando. Tu consistencia es tu mejor herramienta. 🔥"
  }
}
```

**Campos clave para la UI:**
- `type` → Iconos: `review`=📖, `practice`=💻, `explore`=🔍, `reinforce`=🔄
- `priority` → Orden de la lista y badge de urgencia
- `learningPath.progress` → Barra de progreso general
- `motivationalNote` → Banner o card destacado

---

### `GET /ai/progress/:userId` → Análisis de Progreso

```json
{
  "success": true,
  "progress": {
    "period": "últimas 2 semanas",
    "summary": "Has completado 28 ejercicios con un promedio de acierto del 62%. Mejora notable en CSS Grid.",
    "improvements": [
      "CSS Grid - pasaste de 30% a 80% de acierto",
      "Git - dominas los comandos básicos"
    ],
    "persistentWeaknesses": [
      {
        "topic": "JavaScript Closures",
        "attemptCount": 8,
        "trend": "stagnant",
        "actionPlan": "Cambiar el enfoque: en lugar de ejercicios teóricos, intenta construir un mini-proyecto que use closures (ej: un contador con estado privado)."
      }
    ],
    "streaks": {
      "currentStreak": 5,
      "longestStreak": 12,
      "consistency": "Buena regularidad entre semana, baja los fines de semana"
    }
  }
}
```

**Campos clave para la UI:**
- `streaks` → Visualización tipo calendario (como GitHub contributions)
- `persistentWeaknesses[].trend` → Indicador visual: `improving`=↗️, `stagnant`=→, `declining`=↘️
- `improvements` → Lista con checkmarks verdes

---

### `POST /ai/chat` → Chat con el Tutor

```json
{
  "success": true,
  "response": {
    "answer": "Las promesas en JavaScript son objetos que representan un valor que puede estar disponible ahora, en el futuro, o nunca...",
    "relatedTopics": [
      "Async/Await",
      "Event Loop",
      "Callbacks"
    ],
    "suggestedExercise": "Crea una función que haga fetch a 3 APIs diferentes en paralelo usando Promise.all() y muestre cuál respondió primero."
  }
}
```

---

## Pantallas Sugeridas

### Estructura de navegación

```
App
├── AuthStack (sin login)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainStack (con login)
    ├── HomeScreen            → Dashboard principal
    ├── ExerciseScreen        → Resolver ejercicio
    ├── AnalysisScreen        → Resultado del análisis de IA
    ├── RecommendationsScreen → Recomendaciones de estudio
    ├── ProgressScreen        → Progreso histórico
    ├── ChatScreen            → Chat con el tutor
    └── ProfileScreen         → Perfil y preferencias
```

### Descripción de cada pantalla

####  HomeScreen (Dashboard)
- Racha actual de días (`streaks.currentStreak`)
- Botón principal "Practicar" → navega a un ejercicio
- Cards: "Ver recomendaciones", "Mi progreso", "Hablar con tutor"
- Último puntaje obtenido

####  ExerciseScreen
- Muestra la pregunta del ejercicio
- Input según tipo: radio buttons (multiple_choice), text area (code/open_answer)
- Timer visible contando segundos
- Botón "Enviar" → llama `/ai/analyze-exercise`
- Navega a AnalysisScreen con el resultado

####  AnalysisScreen
- Círculo con score (0-100) con animación
- Lista de conceptos correctos ( verde)
- Lista de áreas débiles con severity coding (🔴🟡🟢)
- Cada área débil expandible para ver explicación y sugerencia
- Feedback general en un card destacado
- Botón "Ver recomendaciones"

####  RecommendationsScreen
- Lista ordenada por prioridad
- Cada card muestra: icono de tipo, tema, tiempo estimado, razón
- Learning path con barra de progreso
- Nota motivacional en banner superior

####  ProgressScreen
- Periodo analizado
- Sección de mejoras (verde)
- Sección de debilidades persistentes (con tendencia visual)
- Calendario de rachas (tipo GitHub)
- Resumen general

####  ChatScreen
- Interfaz tipo chat (mensajes del usuario a la derecha, tutor a la izquierda)
- Cada respuesta del tutor tiene:
  - El texto principal
  - Tags de temas relacionados (tocables → navegan al tema)
  - Card de ejercicio sugerido (si aplica)

---

## Manejo de Estado

Para el estado global (auth token, datos del usuario), opciones recomendadas:

| Opción | Cuándo usarla |
|--------|--------------|
| **React Context** | Si la app es simple y el equipo es pequeño |
| **Zustand** | Si necesitan un store más robusto sin la complejidad de Redux |
| **Redux Toolkit** | Si la app va a crecer mucho en features |

### Mínimo necesario en el estado global:
```javascript
{
  auth: {
    token: string | null,
    user: { id, email, displayName, preferences } | null,
    isLoading: boolean,
  },
  // El resto puede ser estado local de cada pantalla
}
```

---

## Manejo de Errores

Todos los endpoints pueden retornar errores con esta estructura:

```json
{
  "error": "Descripción del error",
  "message": "Detalle técnico (solo en development)"
}
```

**Códigos HTTP a manejar:**
| Código | Significado | Acción en la UI |
|--------|------------|-----------------|
| `400` | Datos inválidos | Mostrar qué campo falta |
| `401` | No autenticado | Redirigir a login |
| `404` | No encontrado | Mostrar mensaje amigable |
| `429` | Rate limit | "Espera un momento antes de consultar al tutor" |
| `500` | Error del servidor | "Algo salió mal, intenta de nuevo" |

---

## Checklist de Entrega

- [ ] API client configurado con base URL y token interceptor
- [ ] Flujo de auth: registro, login, persistencia de token
- [ ] Pantalla de ejercicio con timer y envío de respuesta
- [ ] Pantalla de análisis mostrando resultados de la IA
- [ ] Pantalla de recomendaciones
- [ ] Pantalla de progreso con visualización de rachas
- [ ] Chat con el tutor
- [ ] Manejo de errores y estados de carga
- [ ] Navegación entre pantallas
