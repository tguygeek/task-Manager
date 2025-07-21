import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', // Utilisez import.meta.env avec Vite
  withCredentials: true,
});

export default instance;