# 🚀 Guía de Deploy — Backend NEXUS en Railway

> **Para:** Equipo de Base de Datos / Backend  
> **Tiempo estimado:** 10-15 minutos  
> **Requisitos:** Tener acceso al repositorio de GitHub y a las credenciales del proyecto

---

## ¿Qué es Railway?

Railway es una plataforma de hosting en la nube que detecta automáticamente proyectos Node.js y los despliega sin configuración manual. Es gratis hasta $5 USD/mes de uso (suficiente para este proyecto).

---

## Paso 1 — Crear cuenta en Railway

1. Ir a **[railway.app](https://railway.app)**
2. Hacer clic en **"Start a New Project"**
3. Seleccionar **"Login with GitHub"**
4. Autorizar a Railway a acceder a tu cuenta de GitHub

---

## Paso 2 — Crear el proyecto

1. Una vez dentro del dashboard, hacer clic en **"New Project"**
2. Seleccionar **"Deploy from GitHub repo"**
3. Buscar y seleccionar el repositorio: **`NicolasSs1203/app-m-vil-Estudio`**
4. Railway detectará el repositorio y pedirá configuración

> ⚠️ **IMPORTANTE:** En la siguiente pantalla verás una opción de **"Root Directory"**. Debes configurarla antes de continuar.

---

## Paso 3 — Configurar el Root Directory

Como el repositorio contiene tanto el frontend como el backend en subcarpetas, hay que indicarle a Railway cuál desplegar:

1. Hacer clic en **"Configure"** o en el engranaje ⚙️ del proyecto
2. Ir a **"Settings"** → **"Source"**
3. En el campo **"Root Directory"**, escribir:
   ```
   software-learning-app/server
   ```
4. Guardar los cambios

Railway automáticamente ejecutará `npm install` y luego `npm start` desde esa carpeta.

---

## Paso 4 — Agregar las Variables de Entorno

> ⚠️ **Este paso es crítico.** Sin estas variables, el servidor no puede conectarse a la base de datos ni generar tokens JWT.

1. Dentro del proyecto en Railway, ir a la pestaña **"Variables"**
2. Hacer clic en **"New Variable"** y agregar **cada una** de las siguientes:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Indica que es entorno de producción |
| `MONGODB_URI` | *(ver abajo)* | Cadena de conexión a MongoDB Atlas |
| `JWT_SECRET` | `nexus_super_secret_key_2026` | Clave para firmar los tokens de sesión |
| `AI_PROVIDER` | `deepseek` | Proveedor de IA que usa el proyecto |
| `AI_API_KEY` | *(ver abajo)* | API Key de DeepSeek |
| `AI_MODEL` | `deepseek-chat` | Modelo de IA a usar |

> 📌 **`PORT`** NO la agregues. Railway asigna el puerto automáticamente.

### ¿Dónde encuentro los valores secretos?

- **`MONGODB_URI`**: Está en el archivo `server/.env` del repositorio local (pregúntale a Nicolás)
- **`AI_API_KEY`**: Igual, está en `server/.env`

### Cómo agregar variables en Railway:
```
Variables → Raw Editor → Pegar todo de una vez en formato:

NODE_ENV=production
JWT_SECRET=nexus_super_secret_key_2026
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
MONGODB_URI=<pegar el valor completo>
AI_API_KEY=<pegar el valor completo>
```

---

## Paso 5 — Hacer el Deploy

1. Railway debería empezar a desplegarse automáticamente al guardar las variables
2. Si no lo hace, ir a la pestaña **"Deployments"** y hacer clic en **"Deploy Now"**
3. Verás los logs en tiempo real. El deploy exitoso muestra:

```
✅ MongoDB Conectado: ac-byz0nsz-shard-00-00...
🚀 Server running on port XXXX
   Environment: production
   AI Provider: deepseek
```

---

## Paso 6 — Obtener la URL pública

1. Ir a la pestaña **"Settings"** → **"Networking"**
2. Hacer clic en **"Generate Domain"**
3. Railway genera una URL como:
   ```
   https://software-learning-app-production.up.railway.app
   ```
4. **Copiar esa URL** y enviársela a Nicolás (equipo frontend) para que actualice la app.

---

## Paso 7 — Verificar que todo funciona

Abre el navegador y prueba estas URLs (reemplaza con tu URL real):

### ✅ Health Check
```
GET https://tu-url.up.railway.app/api/health
```
**Respuesta esperada:**
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production"
}
```

### ✅ Login de prueba (desde Postman o navegador)
```
POST https://tu-url.up.railway.app/api/auth/login
Content-Type: application/json

{
  "email": "beginner@test.com",
  "password": "cualquiera"
}
```
**Respuesta esperada:** Token JWT + datos del usuario

### ✅ Lista de ejercicios
```
GET https://tu-url.up.railway.app/api/exercises
```
**Respuesta esperada:** Lista de 20 ejercicios de la base de datos

---

## Endpoints disponibles en producción

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|----------------|
| `GET` | `/api/health` | Estado del servidor | ❌ No |
| `POST` | `/api/auth/register` | Registrar usuario | ❌ No |
| `POST` | `/api/auth/login` | Iniciar sesión | ❌ No |
| `POST` | `/api/auth/refresh` | Renovar token | ❌ No |
| `GET` | `/api/auth/me` | Perfil del usuario | ✅ JWT |
| `GET` | `/api/exercises` | Lista de ejercicios | ❌ No |
| `GET` | `/api/exercises/:id` | Ejercicio específico | ❌ No |
| `POST` | `/api/exercises/:id/submit` | Enviar respuesta | ✅ JWT |
| `POST` | `/api/ai/chat` | Chat con tutor IA | ✅ JWT |
| `POST` | `/api/ai/recommendations` | Recomendaciones | ✅ JWT |
| `GET` | `/api/ai/progress/:userId` | Análisis de progreso | ✅ JWT |

---

## Solución de problemas comunes

### ❌ Error: "MongoDB connection failed"
- Verifica que `MONGODB_URI` esté bien copiada en Railway (sin espacios al inicio/final)
- Verifica que la IP `0.0.0.0/0` esté en la whitelist de MongoDB Atlas:
  - Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### ❌ Error: "Cannot find module"
- El **Root Directory** no está configurado correctamente
- Asegúrate de que sea `software-learning-app/server` exactamente

### ❌ El deploy se cae inmediatamente
- Revisa los logs en Railway → Deployments
- Lo más común es una variable de entorno faltante

### ❌ Error 401 en rutas protegidas
- Significa que el `JWT_SECRET` en Railway es diferente al usado para generar el token
- Asegúrate de que `JWT_SECRET=nexus_super_secret_key_2026` esté correctamente configurado

---

## Redeploy automático

Una vez configurado, Railway **redespliega automáticamente** cada vez que se hace un push a la rama `main` del repositorio. No hay que hacer nada manual.

---

> 💬 Cualquier duda, contactar a **Nicolás** (equipo frontend/integración)
