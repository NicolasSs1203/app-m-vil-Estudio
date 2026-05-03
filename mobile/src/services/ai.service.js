import api from './api';

const aiService = {
  // Enviar código o preguntas a la IA para recibir feedback
  getFeedback: async (prompt, currentCode) => {
    const response = await api.post('/ai/tutor', { 
      message: prompt, 
      code: currentCode 
    });
    return response.data;
  }
};

export default aiService;