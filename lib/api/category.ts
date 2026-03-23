import { apiRequest } from './client';

export interface Category {
  id: string;
  name: string;
}

export const getCategories = async (): Promise<Category[]> => {
  return apiRequest('/category');
};

export const createCategory = async (categoryData: { name: string }) => {
  return apiRequest('/category', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

export const updateCategory = async (id: string, categoryData: { name: string }) => {
  return apiRequest(`/category/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
};

export const deleteCategory = async (id: string) => {
  return apiRequest(`/category/${id}`, {
    method: 'DELETE',
  });
};
