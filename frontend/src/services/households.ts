import api from './index';
import { Household } from '../types';

export const householdService = {
  createHousehold: async (name: string): Promise<Household> => {
    const response = await api.post('/households/', { name });
    return response.data;
  },

  getHousehold: async (id: string): Promise<Household> => {
    const response = await api.get(`/households/${id}`);
    return response.data;
  },

  updateHousehold: async (id: string, name: string): Promise<Household> => {
    const response = await api.put(`/households/${id}`, { name });
    return response.data;
  },

  generateInvite: async (householdId: string): Promise<{ invite_code: string; invite_url: string }> => {
    const response = await api.post(`/households/${householdId}/invites`);
    return response.data;
  },

  joinHousehold: async (inviteCode: string): Promise<Household> => {
    const response = await api.post('/households/join', { invite_code: inviteCode });
    return response.data;
  },
};