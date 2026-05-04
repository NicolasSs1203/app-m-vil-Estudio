import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = 'http://192.168.40.224:3001/api'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar el JWT automáticamente (Requisito F-03)
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;