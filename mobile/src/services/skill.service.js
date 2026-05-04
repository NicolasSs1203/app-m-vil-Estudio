import api from './api';

const skill_service = {
  /**
   * Obtener el árbol completo de habilidades con el progreso del usuario
   */
  getSkillTree: async (userId) => {
    try {
      const response = await api.get(`/skills/tree/${userId}`);
      return response.data; // { success: true, tree: [...] }
    } catch (error) {
      console.error("Error al obtener el árbol de habilidades:", error);
      throw error;
    }
  }
};

export default skill_service;