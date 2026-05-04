import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const DEV_IP = Platform.OS === 'android' ? '10.0.2.2' : '192.168.1.3';
// const API_URL = `http://${DEV_IP}:3001/api`;
const API_URL = 'https://app-m-vil-estudio.onrender.com/api';

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
