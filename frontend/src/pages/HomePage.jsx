import React from 'react';
import { PlusCircle, Search, Wrench, Zap, Hammer, Sparkles, HelpCircle, CheckCircle, ShieldCheck, Clock } from 'lucide-react';

export default function HomePage({ setActivePage }) {
  const categories = [
    { title: 'Plumbing', icon: Wrench, desc: 'Taps, leakages, pipeline clogs, flush tanks, washrooms' },
    { title: 'Electrical', icon: Zap, desc: 'Lights, fans, switchboards, wiring, geysers, sockets' },
    { title: 'Civil / Carpentry', icon: Hammer, desc: 'Doors, window glass, latches, study tables, beds, almirahs' },
    { title: 'Cleaning & Hygiene', icon: Sparkles, desc: 'Sanitation, corridors, washroom disinfection, waste' },
    { title: 'Other Requests', icon: HelpCircle, desc: 'General hostel infrastructure and miscellaneous queries' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '4.5rem 0',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '3rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <ShieldCheck size={16} />
            Official Hostel Redressal Portal
          </div>
          <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            Hostel Grievance & Maintenance System
          </h1>
          <p style={{ color: '#e0e7ff', fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Report maintenance issues swiftly without any login. Track real-time progress using your unique Complaint ID and receive photo-verified resolution updates.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{
                background: '#ffffff',
                color: '#1d4ed8',
                fontSize: '1.05rem',
                fontWeight: 700,
                padding: '0.875rem 1.75rem',
                border: 'none'
              }}
              onClick={() => setActivePage('submit')}
            >
              <PlusCircle size={20} />
              Submit a Grievance
            </button>
            <button
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 600,
                padding: '0.875rem 1.75rem',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(4px)'
              }}
              onClick={() => setActivePage('track')}
            >
              <Search size={20} />
              Track by Complaint ID
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="grid grid-cols-3">
          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--primary-50)', color: 'var(--primary-600)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Login Required</h3>
              <p style={{ fontSize: '0.9rem' }}>Students and cadets can file a request immediately with just your name and contact email for alerts.</p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--success-50)', color: 'var(--success-600)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Mandatory Photo Verification</h3>
              <p style={{ fontSize: '0.9rem' }}>Grievances cannot be closed without an administrator uploading an authenticated resolution photograph.</p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'var(--warning-50)', color: 'var(--warning-700)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Student Privacy Protected</h3>
              <p style={{ fontSize: '0.9rem' }}>Public tracking reveals issue progress and remarks, but zero personal contact details are leaked to other students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Categories */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Maintenance Categories Covered</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem' }}>We service both individual student rooms and common block areas.</p>
        
        <div className="grid grid-cols-3">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="card" style={{ transition: 'transform 0.15s', cursor: 'pointer' }} onClick={() => setActivePage('submit')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: 'var(--slate-100)', color: 'var(--primary-600)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>{c.title}</h3>
                </div>
                <p style={{ fontSize: '0.85rem' }}>{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
