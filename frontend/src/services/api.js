import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Tax Profiles
export const getProfiles = () => api.get('/profiles');
export const createProfile = (data) => api.post('/profiles', data);
export const getProfile = (id) => api.get(`/profiles/${id}`);
export const updateProfile = (id, data) => api.put(`/profiles/${id}`, data);

// Income
export const getIncome = (profileId) => api.get(`/income?profileId=${profileId}`);
export const addIncome = (data) => api.post('/income', data);
export const updateIncome = (id, data) => api.put(`/income/${id}`, data);
export const deleteIncome = (id) => api.delete(`/income/${id}`);

// Deductions
export const getDeductions = (profileId) => api.get(`/deductions?profileId=${profileId}`);
export const addDeduction = (data) => api.post('/deductions', data);
export const deleteDeduction = (id) => api.delete(`/deductions/${id}`);

// Credits
export const getCredits = (profileId) => api.get(`/credits?profileId=${profileId}`);
export const addCredit = (data) => api.post('/credits', data);

// Calculations
export const calculateTax = (data) => api.post('/calculations', data);
export const getCalculations = (profileId) => api.get(`/calculations?profileId=${profileId}`);

// Filings
export const getFilings = (profileId) => api.get(`/filings?profileId=${profileId}`);
export const createFiling = (data) => api.post('/filings', data);
export const submitFiling = (id) => api.post(`/filings/${id}/submit`);

// Documents
export const getDocuments = () => api.get('/documents');
export const uploadDocument = (formData) => api.post('/documents', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

export default api;
