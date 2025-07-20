import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { choreService } from '../services/chores';
import { householdService } from '../services/households';
import { Household, User } from '../types';

export const CreateChore: React.FC = () => {
  const navigate = useNavigate();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    isRecurring: false,
    recurrenceInterval: 'weekly' as 'daily' | 'weekly' | 'bi-weekly',
    assignedUserIds: [] as string[],
  });

  useEffect(() => {
    loadHousehold();
  }, []);

  const loadHousehold = async () => {
    try {
      // Get the first household (user should have one)
      const chores = await choreService.getChores(true);
      if (chores.length > 0) {
        const householdData = await householdService.getHousehold(chores[0].householdId);
        setHousehold(householdData);
      }
    } catch (error) {
      console.error('Error loading household:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await choreService.createChore({
        ...formData,
        dueDate: formData.dueDate,
      });
      navigate('/chores');
    } catch (error) {
      console.error('Error creating chore:', error);
      alert('Error creating chore. Please try again.');
    }
  };

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter(id => id !== userId)
        : [...prev.assignedUserIds, userId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!household) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-600">You need to join a household first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Chore</h1>
        <button
          onClick={() => navigate('/chores')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
              Due Date *
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">This is a recurring chore</span>
            </label>
          </div>

          {formData.isRecurring && (
            <div>
              <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700">
                Recurrence Interval
              </label>
              <select
                id="recurrenceInterval"
                value={formData.recurrenceInterval}
                onChange={(e) => setFormData({ ...formData, recurrenceInterval: e.target.value as 'daily' | 'weekly' | 'bi-weekly' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Members
            </label>
            <div className="space-y-2">
              {household.members?.map((member) => (
                <label key={member.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.assignedUserIds.includes(member.id)}
                    onChange={() => handleUserToggle(member.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {member.displayName || member.email}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/chores')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Chore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};