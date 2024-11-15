import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { AppContent } from './components/AppContent';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
          <Toaster position="top-right" />
        </AuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;