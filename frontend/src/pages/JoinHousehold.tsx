import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { householdService } from '../services/households';

export const JoinHousehold: React.FC = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setLoading(true);
    try {
      await householdService.joinHousehold(inviteCode.trim().toUpperCase());
      navigate('/dashboard');
    } catch (error) {
      console.error('Error joining household:', error);
      alert('Invalid invite code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Join Household</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      <div className="max-w-md mx-auto bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
              Invite Code *
            </label>
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="ABC123"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Household'}
          </button>
        </form>
      </div>
    </div>
  );
};