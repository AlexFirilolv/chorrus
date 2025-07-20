import api from './index';
import { Chore, ChoreAssignment } from '../types';

export const choreService = {
  createChore: async (choreData: {
    title: string;
    description?: string;
    dueDate: string;
    isRecurring?: boolean;
    recurrenceInterval?: 'daily' | 'weekly' | 'bi-weekly';
    assignedUserIds?: string[];
  }): Promise<Chore> => {
    const response = await api.post('/chores/', {
      title: choreData.title,
      description: choreData.description,
      due_date: choreData.dueDate,
      is_recurring: choreData.isRecurring || false,
      recurrence_interval: choreData.recurrenceInterval,
      assigned_user_ids: choreData.assignedUserIds,
    });
    return response.data;
  },

  getChores: async (includeCompleted = false): Promise<Chore[]> => {
    const response = await api.get('/chores/', {
      params: { include_completed: includeCompleted },
    });
    return response.data;
  },

  getMyChores: async (includeCompleted = false): Promise<Chore[]> => {
    const response = await api.get('/chores/my-chores', {
      params: { include_completed: includeCompleted },
    });
    return response.data;
  },

  getChore: async (id: string): Promise<Chore> => {
    const response = await api.get(`/chores/${id}`);
    return response.data;
  },

  updateChore: async (id: string, choreData: Partial<Chore>): Promise<Chore> => {
    const response = await api.put(`/chores/${id}`, {
      title: choreData.title,
      description: choreData.description,
      due_date: choreData.dueDate,
      is_recurring: choreData.isRecurring,
      recurrence_interval: choreData.recurrenceInterval,
    });
    return response.data;
  },

  deleteChore: async (id: string): Promise<void> => {
    await api.delete(`/chores/${id}`);
  },

  markChoreComplete: async (id: string): Promise<ChoreAssignment> => {
    const response = await api.post(`/chores/${id}/complete`);
    return response.data;
  },
};