import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Anchor, Shield, FileText, Search, LogIn, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { isAuthenticated, adminUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <div
            className="brand"
            style={{ cursor: 'pointer' }}
            onClick={() => handleNav('home')}
          >
            <div className="brand-icon" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0284c7)', color: '#ffffff' }}>
              <Anchor size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'var(--slate-900)' }}>
                IMU-NMC Hostel Maintenance & Repair
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                Indian Maritime University &bull; Cadet Portal
              </div>
            </div>
          </div>

          <nav className="nav-links desktop-nav" style={{ display: 'flex' }}>
            <button
              className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', font: 'inherit' }}
              onClick={() => handleNav('home')}
            >
              Home
            </button>
            <button
              className={`nav-link ${activePage === 'submit' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', font: 'inherit' }}
              onClick={() => handleNav('submit')}
            >
              <FileText size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Submit Grievance
            </button>
            <button
              className={`nav-link ${activePage === 'track' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', font: 'inherit' }}
              onClick={() => handleNav('track')}
            >
              <Search size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Track Grievance
            </button>

            {isAuthenticated ? (
              <>
                <button
                  className={`nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', font: 'inherit' }}
                  onClick={() => handleNav('admin-dashboard')}
                >
                  Admin Dashboard
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                    {adminUser?.username || 'Admin'}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      logout();
                      handleNav('home');
                    }}
                    title="Sign out"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                className={`btn btn-secondary btn-sm ${activePage === 'admin-login' ? 'active' : ''}`}
                onClick={() => handleNav('admin-login')}
                style={{ marginLeft: '0.5rem' }}
              >
                <LogIn size={15} />
                Admin Portal
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
