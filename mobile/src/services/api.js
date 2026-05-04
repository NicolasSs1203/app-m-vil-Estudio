import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// const DEV_IP = Platform.OS === 'android' ? '10.0.2.2' : '192.168.1.3';
// const API_URL = `http://${DEV_IP}:3001/api`; 
const API_URL = 'https://app-m-vil-estudio.onrender.com/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar interceptor para adjuntar JWT automáticamente [Checklist F-03]
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Manejar errores 401 (Sesión expirada / Unauthorized) [Checklist F-03]
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Sesión no válida o expirada');
      // Aquí podrías agregar lógica para limpiar el storage y redirigir al Login
    }
    return Promise.reject(error);
  }
);

export default api;