export interface User {
  id: string;
  email: string;
  displayName?: string;
  householdId?: string;
  createdAt: string;
}

export interface Household {
  id: string;
  name: string;
  adminId: string;
  inviteCode: string;
  createdAt: string;
  members?: User[];
}

export interface Chore {
  id: string;
  householdId: string;
  createdById: string;
  title: string;
  description?: string;
  dueDate: string;
  isRecurring: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'bi-weekly';
  createdAt: string;
  assignments?: ChoreAssignment[];
}

export interface ChoreAssignment {
  id: string;
  choreId: string;
  userId: string;
  status: 'pending' | 'completed';
  completedAt?: string;
  createdAt: string;
  user?: User;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}