import api from './api';

const exercise_service = {
  // Obtener todos los ejercicios
  getExercises: async () => {
    const response = await api.get('/exercises');
    return response.data;
  },

  // Obtener un ejercicio específico por ID
  getExerciseById: async (id) => {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },

  // Enviar respuesta para calificar
  submitExercise: async (exerciseId, answer) => {
    const response = await api.post(`/exercises/${exerciseId}/submit`, { answer });
    return response.data;
  }
};

export default exercise_service;