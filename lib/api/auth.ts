import { apiRequest } from './client';

export const registerUser = async (userData: any) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (loginData: any) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });
};

export const getProfile = async () => {
  return apiRequest('/auth/profile');
};

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  return apiRequest(endpoint, options);
};


 