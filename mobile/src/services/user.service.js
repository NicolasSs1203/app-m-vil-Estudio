import api from './api';

const user_service = {
  /**
   * Actualizar preferencias de aprendizaje y metas
   */
  updatePreferences: async (userId, preferences) => {
    try {
      const response = await api.put(`/users/${userId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    }
  },

  /**
   * Obtener datos detallados del perfil
   */
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      throw error;
    }
  }
};

export default user_service;