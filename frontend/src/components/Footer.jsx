import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>IMU-NMC Hostel Maintenance & Repair</strong> &mdash; Indian Maritime University
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
            Permanent records retention &bull; Cadet grievance redressal portal
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          Strict privacy protection: Grievance tracking exposes zero cadet personal identifiers.
        </div>
      </div>
    </footer>
  );
}
