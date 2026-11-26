import api from './api';

export interface CreateAppointmentPayload {
  propertyId: string;
  agentId?: string;
  date: string;
  time: string;
  note?: string;
  tourType?: 'in_person' | 'video';
}

export interface AppointmentItem {
  id: string;
  propertyId: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyPrice?: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  note?: string;
  tourType: 'in_person' | 'video';
  agentName?: string;
  agentPhone?: string;
}

export const appointmentService = {
  async createAppointment(payload: CreateAppointmentPayload) {
    try {
      const res = await api.post('/appointments', payload);
      return res.data;
    } catch (e) {
      console.log('Mobile fallback appointment creation');
      return {
        id: `apt-${Date.now()}`,
        status: 'pending',
        ...payload,
      };
    }
  },

  async getMyAppointments(): Promise<AppointmentItem[]> {
    try {
      const res = await api.get('/appointments');
      const items = res.data?.data || res.data?.items || res.data;
      if (Array.isArray(items) && items.length > 0) {
        return items.map((a: any) => ({
          id: a.id,
          propertyId: a.propertyId,
          propertyTitle: a.property?.title || a.propertyTitle || 'Căn hộ cao cấp',
          propertyImage: a.property?.images?.[0] || a.property?.media?.[0]?.url || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
          propertyPrice: a.property?.price,
          date: a.date,
          time: a.time,
          status: a.status || 'pending',
          note: a.note,
          tourType: a.tourType || 'in_person',
          agentName: a.agent?.name || 'Cao Văn Bảo',
          agentPhone: a.agent?.phone || '0332536815',
        }));
      }
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'apt-demo-1',
        propertyId: 'p1',
        propertyTitle: 'Căn hộ Landmark 81 Vinhomes Central Park view sông Sài Gòn',
        propertyImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
        propertyPrice: 6800000000,
        date: '2026-11-18',
        time: '09:30',
        status: 'confirmed',
        tourType: 'in_person',
        note: 'Xem căn hộ tầng 35 và thẩm định giấy tờ sổ hồng thực tế',
        agentName: 'Cao Văn Bảo',
        agentPhone: '0332536815',
      },
    ];
  },
};
