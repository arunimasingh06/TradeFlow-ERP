import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import MonochromaticDashboard from './components/Dashboard/MonochromaticDashboard';
import GlassmorphismAuth from './components/auth/GlassmorphismAuth';
import './App.css';

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? <MonochromaticDashboard /> : <GlassmorphismAuth />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
