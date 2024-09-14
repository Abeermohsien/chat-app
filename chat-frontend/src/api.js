// src/api.js
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000/api' });

export const registerUser = (userData) => API.post('/register', userData);
export const loginUser = (userData) => API.post('/login', userData);
export const fetchMessages = (token) => API.get('/messages', {
    headers: { 'auth-token': token }
});
