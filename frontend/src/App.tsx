import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Chores } from './pages/Chores';
import { CreateChore } from './pages/CreateChore';
import { CreateHousehold } from './pages/CreateHousehold';
import { JoinHousehold } from './pages/JoinHousehold';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chores"
              element={
                <ProtectedRoute>
                  <Chores />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chores/create"
              element={
                <ProtectedRoute>
                  <CreateChore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/household/create"
              element={
                <ProtectedRoute>
                  <CreateHousehold />
                </ProtectedRoute>
              }
            />
            <Route
              path="/household/join"
              element={
                <ProtectedRoute>
                  <JoinHousehold />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;