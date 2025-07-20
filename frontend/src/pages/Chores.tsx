import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { choreService } from '../services/chores';
import { Chore } from '../types';

export const Chores: React.FC = () => {
  const navigate = useNavigate();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  useEffect(() => {
    loadChores();
  }, [filter]);

  const loadChores = async () => {
    try {
      let data;
      if (filter === 'completed') {
        data = await choreService.getChores(true);
      } else if (filter === 'pending') {
        data = await choreService.getChores(false);
      } else {
        data = await choreService.getChores(true);
      }
      setChores(data);
    } catch (error) {
      console.error('Error loading chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (choreId: string) => {
    try {
      await choreService.markChoreComplete(choreId);
      await loadChores();
    } catch (error) {
      console.error('Error marking chore complete:', error);
    }
  };

  const getFilteredChores = () => {
    if (filter === 'pending') {
      return chores.filter(chore => 
        chore.assignments?.some(assignment => assignment.status === 'pending')
      );
    } else if (filter === 'completed') {
      return chores.filter(chore => 
        chore.assignments?.every(assignment => assignment.status === 'completed')
      );
    }
    return chores;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredChores = getFilteredChores();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Household Chores</h1>
        <button
          onClick={() => navigate('/chores/create')}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Add New Chore
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          {(['all', 'pending', 'completed'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === filterOption
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {filteredChores.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No chores found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChores.map(chore => (
              <div key={chore.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{chore.title}</h3>
                    {chore.description && (
                      <p className="text-sm text-gray-600 mt-1">{chore.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Due: {new Date(chore.dueDate).toLocaleDateString()}</span>
                      {chore.isRecurring && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {chore.recurrenceInterval}
                        </span>
                      )}
                    </div>
                    
                    {chore.assignments && chore.assignments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Assigned to: {chore.assignments.map(a => a.user?.displayName || 'Unknown').join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/chores/${chore.id}`)}
                      className="text-primary-600 hover:text-primary-500 text-sm mr-2"
                    >
                      View
                    </button>
                    
                    {chore.assignments?.some(a => a.status === 'pending') && (
                      <button
                        onClick={() => handleMarkComplete(chore.id)}
                        className="text-green-600 hover:text-green-500 text-sm"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};