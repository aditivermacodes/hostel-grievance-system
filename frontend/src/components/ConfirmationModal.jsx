import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react';

export default function ConfirmationModal({ complaint, onClose, onTrack }) {
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(complaint.complaintCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          background: 'var(--success-50)',
          color: 'var(--success-600)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <CheckCircle2 size={36} />
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Grievance Registered!</h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          Your maintenance request has been submitted to the hostel administration team.
        </p>

        <div style={{
          background: 'var(--primary-50)',
          border: '1.5px dashed var(--primary-600)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Complaint ID
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--primary-900)',
            margin: '0.5rem 0',
            letterSpacing: '0.05em'
          }}>
            {complaint.complaintCode}
          </div>
          {complaint.locationDetail && (
            <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', marginTop: '0.25rem', fontWeight: 600 }}>
              {complaint.hostelName ? `${complaint.hostelName} • ` : ''}{complaint.locationDetail}
            </div>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopy}
            style={{ margin: '0 auto' }}
          >
            {copied ? (
              <>
                <Check size={16} style={{ color: 'var(--success-600)' }} />
                Copied to Clipboard!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy Complaint ID
              </>
            )}
          </button>
        </div>

        <div style={{ textAlign: 'left', background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>Important Notice:</div>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--slate-600)', margin: 0 }}>
            <li>A confirmation receipt has been sent to your email.</li>
            <li>Keep this Complaint ID safe to track progress at any time.</li>
            <li>No account or login is required to check progress.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Done
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onTrack(complaint.complaintCode)}
          >
            Track Status Now
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
