import { apiRequest } from './client';

export interface CreateEnquiryPayload {
  name: string;
  email: string;
  phone?: string;
  description?: string;
  serviceId: string;
}

export interface UpdateEnquiryPayload {
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  serviceId?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

export const createEnquiry = async (enquiryData: CreateEnquiryPayload) => {
  return apiRequest('/enquiry', {
    method: "POST",
    body: JSON.stringify(enquiryData),
  });
};

export const getEnquiries = async () => {
  return apiRequest('/enquiry');
};

export const updateEnquiry = async (id: string, enquiryData: UpdateEnquiryPayload) => {
  return apiRequest(`/enquiry/${id}`, {
    method: 'PUT',
    body: JSON.stringify(enquiryData),
  });
};

export const deleteEnquiry = async (id: string) => {
  return apiRequest(`/enquiry/${id}`, {
    method: 'DELETE',
  });
};

export const convertEnquiryToLead = async (id: string) => {
  return apiRequest(`/enquiry/${id}/convert-to-lead`, {
    method: 'POST',
  });
};
