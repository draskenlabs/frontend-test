import { apiRequest } from './client';

export const createService = async (serviceData: { name: string; categoryId: string }) => {
  return apiRequest('/service', {
    method: "POST",
    body: JSON.stringify(serviceData),
  });
};

export const getServices = async () => {
  return apiRequest('/service', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateService = async (id: string, serviceData: { name: string; categoryId?: string }) => {
  return apiRequest(`/service/${id}`, {
    method: "PUT",
    body: JSON.stringify(serviceData),
  });
};

export const deleteService = async (id: string) => {
  return apiRequest(`/service/${id}`, {
    method: "DELETE",
  });
};
