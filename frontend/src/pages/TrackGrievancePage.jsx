import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Search, AlertCircle, CheckCircle, Clock, MapPin, Tag, FileText, Calendar, Camera, ShieldCheck } from 'lucide-react';

export default function TrackGrievancePage({ initialCode = '' }) {
  const [complaintCode, setComplaintCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState(null);

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (codeToSearch) => {
    const code = (codeToSearch || complaintCode).trim().toUpperCase();
    if (!code) {
      setError('Please enter a valid Complaint ID.');
      return;
    }

    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const data = await api.get(`/complaints/track/${encodeURIComponent(code)}`);
      setComplaint(data);
    } catch (err) {
      if (err.status === 404) {
        setError(`No grievance record found with Complaint ID "${code}". Please double check your code or check the confirmation email.`);
      } else {
        setError(err.message || 'Unable to retrieve grievance status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  const decodeMaritimeLocation = (code) => {
    if (!code) return null;
    const match = code.match(/^(NH|OH)-([A-D])([PCS])-(\d{1,2})$/i);
    if (!match) return null;
    const [_, hCode, fCode, wCode, rNum] = match;
    const hostelMap = { NH: 'New Hostel', OH: 'Old Hostel' };
    const floorMap = { A: 'Ground Floor', B: '1st Floor', C: '2nd Floor', D: '3rd Floor' };
    const wingMap = { P: 'Port Wing', C: 'Central Wing', S: 'Starboard Wing' };
    return `${hostelMap[hCode.toUpperCase()]} • ${floorMap[fCode.toUpperCase()]} (${fCode.toUpperCase()}) • ${wingMap[wCode.toUpperCase()]} (${wCode.toUpperCase()}) • Room ${rNum}`;
  };

  return (
    <div className="container" style={{ maxWidth: '820px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Track Grievance Status</h1>
        <p style={{ color: 'var(--slate-600)' }}>
          Enter your IMU-NMC Complaint ID below to check live repair progress, assigned updates, and resolution proof.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{
            display: 'flex',
            maxWidth: '560px',
            margin: '1.5rem auto 0 auto',
            gap: '0.5rem',
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="e.g. HGS-2026-001001"
            value={complaintCode}
            onChange={(e) => setComplaintCode(e.target.value.toUpperCase())}
            style={{ fontWeight: 600, letterSpacing: '0.05em', textAlign: 'center', textTransform: 'uppercase' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ padding: '0 1.75rem' }}
          >
            <Search size={18} />
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-50)',
          color: 'var(--danger-700)',
          border: '1px solid #fecaca',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={24} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {complaint && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--slate-200)',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Complaint Identifier
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                {complaint.complaintCode}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Submitted on {formatDate(complaint.submittedAt)}
              </div>
            </div>
            <div>
              <StatusBadge status={complaint.status} />
            </div>
          </div>

          {/* Stepper Progress */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
            margin: '2rem 1rem 2.5rem 1rem'
          }}>
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              right: '20px',
              height: '3px',
              background: 'var(--slate-200)',
              zIndex: 1
            }} />
            
            {['SUBMITTED', 'IN_PROGRESS', 'COMPLETED'].map((step, idx) => {
              const currentStatus = complaint.status;
              let isPassed = false;
              if (currentStatus === 'COMPLETED') isPassed = true;
              else if (currentStatus === 'IN_PROGRESS' && (step === 'SUBMITTED' || step === 'IN_PROGRESS')) isPassed = true;
              else if (currentStatus === 'SUBMITTED' && step === 'SUBMITTED') isPassed = true;

              return (
                <div key={step} style={{ position: 'relative', zIndex: 2, textAlign: 'center', minWidth: '80px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isPassed ? 'var(--primary-600)' : '#ffffff',
                    border: isPassed ? '2px solid var(--primary-600)' : '2px solid var(--slate-300)',
                    color: isPassed ? '#ffffff' : 'var(--slate-400)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.5rem auto',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isPassed ? 'var(--slate-900)' : 'var(--slate-400)' }}>
                    {step === 'SUBMITTED' ? 'Submitted' : step === 'IN_PROGRESS' ? 'In Progress' : 'Resolved'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grievance Details Grid */}
          <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem', background: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>HOSTEL & LOCATION</div>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                {complaint.hostelName} &bull; <span style={{ fontFamily: 'monospace', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px' }}>{complaint.locationDetail}</span> ({complaint.locationType === 'ROOM' ? 'Cadet Room' : 'Common Area'})
              </div>
              {decodeMaritimeLocation(complaint.locationDetail) && (
                <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: 600, marginTop: '0.3rem' }}>
                  {decodeMaritimeLocation(complaint.locationDetail)}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>CATEGORY</div>
              <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.25rem' }}>
                {complaint.categoryName}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>DESCRIPTION</div>
              <div style={{ color: 'var(--slate-700)', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                {complaint.description}
              </div>
            </div>

            {complaint.photoUrl && (
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  SUBMITTED PHOTOGRAPH
                </div>
                <img
                  src={complaint.photoUrl}
                  alt="Submitted grievance proof"
                  style={{ maxHeight: '220px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-300)', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          {/* Resolution Card (if COMPLETED) */}
          {complaint.status === 'COMPLETED' && (
            <div style={{
              background: 'var(--success-50)',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-700)', fontWeight: 700, marginBottom: '0.75rem' }}>
                <CheckCircle size={20} />
                Resolution Verified & Completed
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--success-700)', fontWeight: 600 }}>ADMIN RESOLUTION REMARKS</div>
                <div style={{ fontWeight: 500, color: 'var(--slate-800)', marginTop: '0.25rem' }}>
                  {complaint.completionRemarks}
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Resolved on <strong>{formatDate(complaint.completedAt)}</strong>
              </div>

              {complaint.completionPhotoUrl && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success-700)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    MANDATORY RESOLUTION PHOTOGRAPH
                  </div>
                  <a href={complaint.completionPhotoUrl} target="_blank" rel="noreferrer">
                    <img
                      src={complaint.completionPhotoUrl}
                      alt="Verified completion photo"
                      style={{ maxHeight: '240px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--success-600)', objectFit: 'cover' }}
                    />
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.35rem' }}>
                    Click photo to open full resolution
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit Timeline */}
          {complaint.statusTimeline && complaint.statusTimeline.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Status History Timeline</h3>
              <div className="timeline">
                {complaint.statusTimeline.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <StatusBadge status={item.newStatus} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {formatDate(item.changedAt)}
                      </span>
                    </div>
                    {item.note && (
                      <div style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                        {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Footnote */}
          <div style={{
            borderTop: '1px solid var(--slate-200)',
            paddingTop: '1rem',
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--slate-500)'
          }}>
            <ShieldCheck size={16} />
            <span>Privacy Guard: Student name and email are protected and never displayed on public tracking lookups.</span>
          </div>
        </div>
      )}
    </div>
  );
}
