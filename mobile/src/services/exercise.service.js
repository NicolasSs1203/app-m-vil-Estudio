import api from './api';

const exercise_service = {
  /**
   * Obtener todos los ejercicios
   * El backend devuelve: { success: true, count: X, data: [...] }
   */
  getExercises: async (params = {}) => {
    try {
      const response = await api.get('/exercises', { params });
      // Retornamos response.data completo (el objeto con success, count y data)
      return response.data;
    } catch (error) {
      console.error("Error al obtener ejercicios:", error);
      throw error;
    }
  },

  /**
   * Obtener un ejercicio específico por ID
   */
  getExerciseById: async (id) => {
    try {
      const response = await api.get(`/exercises/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el ejercicio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Enviar respuesta para análisis de IA (F-05)
   */
  submitExercise: async (exerciseId, answer) => {
    try {
      const response = await api.post(`/exercises/${exerciseId}/submit`, { answer });
      return response.data;
    } catch (error) {
      console.error("Error en el envío a la IA:", error);
      throw error;
    }
  }
};

export default exercise_service;