import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>Hostel Grievance System (HGS)</strong> &mdash; Production Maintenance & Redressal
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
            Permanent records retention &bull; Privacy-first grievance management
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          Strict privacy protection: Grievance tracking exposes zero student identifiers.
        </div>
      </div>
    </footer>
  );
}
