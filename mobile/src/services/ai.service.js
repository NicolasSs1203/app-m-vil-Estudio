import api from './api';

const ai_service = {
  // ... (getUserProgress y sendMessage)

  /**
   * F-08: Obtener recomendaciones personalizadas
   */
  getRecommendations: async (userId) => {
    try {
      const response = await api.post('/ai/recommendations', { userId });
      return response.data; // { success, recommendations, learningPath, motivationalNote }
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
      throw error;
    }
  }
};

export default ai_service;