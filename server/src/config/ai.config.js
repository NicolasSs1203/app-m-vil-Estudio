const OpenAI = require('openai');
require('dotenv').config();

// ============================================================
// AI Provider Configuration — Provider Agnostic (OpenAI / DeepSeek)
// ============================================================
// Cambiar de provider solo requiere modificar variables de entorno.
// DeepSeek es 100% compatible con el SDK de OpenAI.
// ============================================================

const PROVIDERS = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
  },
};

/**
 * Obtiene la configuración del proveedor de IA actual.
 * @returns {{ provider: string, baseURL: string, model: string, apiKey: string }}
 */
function getAIConfig() {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

  if (!PROVIDERS[provider]) {
    throw new Error(
      `Proveedor de IA no soportado: "${provider}". ` +
      `Proveedores válidos: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'AI_API_KEY no está configurada. Agrega la variable de entorno en .env'
    );
  }

  return {
    provider,
    baseURL: process.env.AI_BASE_URL || PROVIDERS[provider].baseURL,
    model: process.env.AI_MODEL || PROVIDERS[provider].defaultModel,
    apiKey,
  };
}

/**
 * Crea e inicializa el cliente de OpenAI SDK configurado para el provider activo.
 * Singleton — se reutiliza la misma instancia en toda la app.
 */
let _clientInstance = null;

function getAIClient() {
  if (_clientInstance) return _clientInstance;

  const config = getAIConfig();

  _clientInstance = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  console.log(`[AI Config] Provider: ${config.provider} | Model: ${config.model} | Base URL: ${config.baseURL}`);

  return _clientInstance;
}

/**
 * Resetea el cliente (útil para testing o cambio de config en runtime).
 */
function resetAIClient() {
  _clientInstance = null;
}

module.exports = {
  PROVIDERS,
  getAIConfig,
  getAIClient,
  resetAIClient,
};
