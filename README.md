# Software Learning App 📚🤖

App móvil de aprendizaje de software con **tutor de IA personalizado** que analiza el desempeño del estudiante para recomendar qué reforzar, practicar o investigar.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Mobile** | React Native + Expo |
| **Backend** | Node.js + Express |
| **Base de Datos** | MongoDB (NoSQL) |
| **IA** | OpenAI API / DeepSeek API (intercambiables) |
| **Validación** | Zod (structured outputs) |

## Arquitectura General

```
┌─────────────────┐     ┌──────────────────────────────────────────┐     ┌─────────────┐
│                 │     │              BACKEND                     │     │             │
│   📱 Mobile     │────▶│  Routes ──▶ AI Service ──▶ AI Provider   │────▶│  🤖 OpenAI  │
│   (React Native)│◀────│    ▲            │                        │◀────│  / DeepSeek │
│                 │     │    │            ▼                        │     │             │
└─────────────────┘     │    │     History Builder                 │     └─────────────┘
                        │    │            │                        │
                        │    │            ▼                        │
                        │    └──── 🗄️ MongoDB ◀────────────────────│
                        └──────────────────────────────────────────┘
```

## Estructura del Proyecto

```
software-learning-app/
├── server/                          # Backend Node.js
│   ├── src/
│   │   ├── config/
│   │   │   └── ai.config.js        # Configuración del proveedor de IA
│   │   ├── schemas/
│   │   │   └── ai.schemas.js       # Schemas Zod (contratos de respuesta de IA)
│   │   ├── services/
│   │   │   ├── ai.service.js       # Núcleo de integración con la IA
│   │   │   └── history.builder.js  # Constructor de contexto histórico
│   │   ├── routes/
│   │   │   └── ai.routes.js        # Endpoints REST de la API
│   │   ├── models/
│   │   │   └── data.contracts.js   # Contratos de datos (MongoDB)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # Autenticación (placeholder)
│   │   └── index.js                # Entry point del servidor
│   ├── .env                        # Variables de entorno (NO commitear)
│   └── package.json
│
├── mobile/                          # Frontend React Native + Expo
│   ├── App.js
│   └── package.json
│
└── docs/                            # Documentación por equipo
    ├── EQUIPO_DATABASE.md
    ├── EQUIPO_BACKEND.md
    └── EQUIPO_FRONTEND.md
```

## Quick Start

```bash
# 1. Clonar e instalar
cd server
npm install

# 2. Configurar variables de entorno
# Editar .env con tu API key real (OpenAI o DeepSeek)

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Verificar
# GET http://localhost:3001/api/health
# GET http://localhost:3001/api/ai/health
```

## Documentación por Equipo

| Equipo | Documento | Descripción |
|--------|-----------|-------------|
| 🗄️ Base de Datos | [EQUIPO_DATABASE.md](docs/EQUIPO_DATABASE.md) | Colecciones, schemas, índices |
| 🖥️ Backend | [EQUIPO_BACKEND.md](docs/EQUIPO_BACKEND.md) | Conexión DB, auth, integración |
| 📱 Frontend | [EQUIPO_FRONTEND.md](docs/EQUIPO_FRONTEND.md) | Endpoints, request/response, flujos UI |

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check general |
| `GET` | `/api/ai/health` | Health check del servicio de IA |
| `POST` | `/api/ai/analyze-exercise` | Analiza respuesta a un ejercicio |
| `POST` | `/api/ai/recommendations` | Genera recomendaciones de estudio |
| `GET` | `/api/ai/progress/:userId` | Análisis de progreso histórico |
| `POST` | `/api/ai/chat` | Chat libre con el tutor IA |

## Cambiar de Proveedor de IA

Solo editar `.env`:

```env
# OpenAI
AI_PROVIDER=openai
AI_API_KEY=sk-tu-key-openai
AI_MODEL=gpt-4o-mini

# DeepSeek (descomentar para usar)
# AI_PROVIDER=deepseek
# AI_API_KEY=sk-tu-key-deepseek
# AI_MODEL=deepseek-chat
```

No se necesitan cambios de código. Ambos usan el mismo SDK.
