import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { householdService } from '../services/households';
import { choreService } from '../services/chores';
import { Household, Chore } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [myChores, setMyChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    loadDashboard();
  }, [currentUser, navigate]);

  const loadDashboard = async () => {
    try {
      const chores = await choreService.getMyChores();
      setMyChores(chores);
      
      // Try to get household info for the first chore (if any)
      if (chores.length > 0) {
        const householdData = await householdService.getHousehold(chores[0].householdId);
        setHousehold(householdData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHousehold = () => {
    navigate('/household/create');
  };

  const handleJoinHousehold = () => {
    navigate('/household/join');
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
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Chorrus!</h1>
          <p className="text-gray-600 mb-8">
            You need to join or create a household to get started.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleCreateHousehold}
              className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Household
            </button>
            <button
              onClick={handleJoinHousehold}
              className="px-6 py-3 bg-secondary-600 text-white rounded-md hover:bg-secondary-700"
            >
              Join Household
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingChores = myChores.filter(chore => 
    chore.assignments?.some(assignment => assignment.status === 'pending')
  );

  const completedChores = myChores.filter(chore => 
    chore.assignments?.every(assignment => assignment.status === 'completed')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to {household.name}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Pending Chores</h2>
              <button
                onClick={() => navigate('/chores')}
                className="text-primary-600 hover:text-primary-500 text-sm"
              >
                View All
              </button>
            </div>
            
            {pendingChores.length === 0 ? (
              <p className="text-gray-500">No pending chores. Great job!</p>
            ) : (
              <div className="space-y-4">
                {pendingChores.map(chore => (
                  <div key={chore.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{chore.title}</h3>
                        <p className="text-sm text-gray-600">{chore.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Due: {new Date(chore.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/chores/${chore.id}`)}
                        className="text-primary-600 hover:text-primary-500 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/chores/create')}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add New Chore
              </button>
              <button
                onClick={() => navigate('/household')}
                className="w-full px-4 py-2 bg-secondary-600 text-white rounded-md hover:bg-secondary-700"
              >
                Manage Household
              </button>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Household Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Chores:</span>
                <span className="font-medium">{myChores.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-orange-600">{pendingChores.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{completedChores.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};