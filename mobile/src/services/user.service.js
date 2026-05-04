import api from './api';

const user_service = {
  /**
   * Actualizar preferencias de aprendizaje y metas del usuario actual
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      throw error;
    }
  },

  /**
   * Obtener datos detallados del perfil del usuario logueado
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error("Error al obtener perfil:", error);
      throw error;
    }
  }
};

export default user_service;