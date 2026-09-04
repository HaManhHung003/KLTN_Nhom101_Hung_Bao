import { api } from './api';
import type { Appointment, AppointmentStatus } from '../types';

export interface CreateAppointmentPayload {
  propertyId: string;
  agentId: string;
  date: string;
  time: string;
  note?: string;
  tourType?: 'in_person' | 'video';
}

export const appointmentService = {
  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    return api.post<any, Appointment>('/appointments', payload);
  },

  async getMyAppointments(params?: { page?: number; limit?: number; status?: AppointmentStatus }): Promise<any> {
    return api.get('/appointments', { params });
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return api.patch<any, Appointment>(`/appointments/${id}/status`, { status });
  },
};
