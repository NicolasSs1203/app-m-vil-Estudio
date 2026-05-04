import api from './api';

const ai_service = {
  /**
   * F-07: Enviar mensaje al chat con el Tutor IA
   */
  sendMessage: async (message, userId) => {
    try {
      // El backend espera 'userId' y 'message' en el body
      const response = await api.post('/ai/chat', { 
        userId: userId,
        message: message 
      });
      
      // El backend devuelve { success: true, response: { ... } }
      // El objeto 'response' contiene reply, relatedTopics, etc.
      return response.data.response; 
    } catch (error) {
      console.error("Error en chat IA:", error);
      throw error;
    }
  },

  /**
   * F-08: Obtener recomendaciones personalizadas
   */
  getRecommendations: async (userId) => {
    try {
      const response = await api.post('/ai/recommendations', { userId });
      return response.data;
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
      throw error;
    }
  },

  /**
   * F-06: Obtener análisis de progreso detallado
   */
  analyzeProgress: async (userId) => {
    try {
      const response = await api.get(`/ai/progress/${userId}`);
      return response.data; // { success, progress: { summary, improvements, persistentWeaknesses, streaks, ... } }
    } catch (error) {
      console.error("Error al analizar progreso:", error);
      throw error;
    }
  }
};

export default ai_service;