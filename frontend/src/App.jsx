import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SubmitGrievancePage from './pages/SubmitGrievancePage';
import TrackGrievancePage from './pages/TrackGrievancePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [trackId, setTrackId] = useState('');
  const { isAuthenticated } = useAuth();

  const handleNavigateToTrack = (code) => {
    setTrackId(code);
    setActivePage('track');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        {activePage === 'home' && (
          <div className="container">
            <HomePage setActivePage={setActivePage} />
          </div>
        )}

        {activePage === 'submit' && (
          <SubmitGrievancePage
            setActivePage={setActivePage}
            setTrackId={handleNavigateToTrack}
          />
        )}

        {activePage === 'track' && (
          <TrackGrievancePage initialCode={trackId} />
        )}

        {activePage === 'admin-login' && (
          <AdminLoginPage setActivePage={setActivePage} />
        )}

        {activePage === 'admin-dashboard' && (
          isAuthenticated ? (
            <AdminDashboardPage />
          ) : (
            <AdminLoginPage setActivePage={setActivePage} />
          )
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
