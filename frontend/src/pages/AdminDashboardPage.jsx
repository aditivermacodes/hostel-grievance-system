import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Search, Filter, RefreshCw, Eye, CheckCircle, Clock, AlertTriangle,
  XCircle, Send, CheckCircle2, Upload, X, ChevronLeft, ChevronRight,
  ExternalLink, Calendar, MapPin, Tag, Mail, User, AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { adminUser } = useAuth();

  // Data states
  const [complaints, setComplaints] = useState([]);
  const [pageInfo, setPageInfo] = useState({ pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  // Lookups
  const [hostels, setHostels] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    hostelId: '',
    categoryId: '',
    status: '',
    locationType: '',
    from: '',
    to: '',
  });

  // Selected complaint for drawer/modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status Change Dialog
  const [statusDialog, setStatusDialog] = useState({ open: false, newStatus: 'IN_PROGRESS', note: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Completion Dialog (with mandatory photograph)
  const [completionDialog, setCompletionDialog] = useState({ open: false, remarks: '', photoFile: null, photoPreview: null, error: '' });
  const [completing, setCompleting] = useState(false);
  const completionFileInputRef = useRef(null);

  // Notification resend state
  const [resending, setResending] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Fetch lookups once
  useEffect(() => {
    async function loadLookups() {
      try {
        const [hList, cList] = await Promise.all([api.get('/hostels'), api.get('/categories')]);
        setHostels(hList || []);
        setCategories(cList || []);
      } catch (err) {
        console.error('Failed to load filter lookups:', err);
      }
    }
    loadLookups();
  }, []);

  // Fetch complaints
  const fetchComplaints = async (page = 0) => {
    setLoading(true);
    setActionMessage('');
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('size', pageInfo.pageSize);
      params.append('sortBy', 'submittedAt');
      params.append('direction', 'desc');

      if (filters.search) params.append('search', filters.search);
      if (filters.hostelId) params.append('hostelId', filters.hostelId);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.status) params.append('status', filters.status);
      if (filters.locationType) params.append('locationType', filters.locationType);
      if (filters.from) params.append('from', new Date(filters.from).toISOString());
      if (filters.to) params.append('to', new Date(filters.to).toISOString());

      const res = await api.get(`/admin/complaints?${params.toString()}`);
      setComplaints(res.content || []);
      setPageInfo({
        pageNumber: res.pageNumber,
        pageSize: res.pageSize,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
      });
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(0);
  }, [filters.hostelId, filters.categoryId, filters.status, filters.locationType]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints(0);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      hostelId: '',
      categoryId: '',
      status: '',
      locationType: '',
      from: '',
      to: '',
    });
  };

  const openDetail = async (id) => {
    setLoadingDetail(true);
    setSelectedComplaint(null);
    setActionMessage('');
    try {
      const data = await api.get(`/admin/complaints/${id}`);
      setSelectedComplaint(data);
    } catch (err) {
      alert('Failed to load complaint details: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    setActionMessage('');
    try {
      const updated = await api.patch(`/admin/complaints/${selectedComplaint.id}/status`, {
        status: statusDialog.newStatus,
        note: statusDialog.note,
      });
      setSelectedComplaint(updated);
      setStatusDialog({ open: false, newStatus: 'IN_PROGRESS', note: '' });
      setActionMessage(`Status successfully updated to ${updated.status}.`);
      fetchComplaints(pageInfo.pageNumber);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCompletionPhotoSelect = (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setCompletionDialog((prev) => ({ ...prev, error: 'Only JPEG, PNG, and WebP images are allowed.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCompletionDialog((prev) => ({ ...prev, error: 'Resolution photo exceeds 5MB limit.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCompletionDialog((prev) => ({
        ...prev,
        photoFile: file,
        photoPreview: e.target.result,
        error: '',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCompleteComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    if (!completionDialog.photoFile) {
      setCompletionDialog((prev) => ({
        ...prev,
        error: 'A resolution photograph is mandatory. Completion is blocked without proof.',
      }));
      return;
    }

    if (!completionDialog.remarks.trim()) {
      setCompletionDialog((prev) => ({ ...prev, error: 'Resolution remarks are required.' }));
      return;
    }

    setCompleting(true);
    setCompletionDialog((prev) => ({ ...prev, error: '' }));

    try {
      const formData = new FormData();
      formData.append('remarks', completionDialog.remarks.trim());
      formData.append('photo', completionDialog.photoFile);

      const updated = await api.postMultipart(`/admin/complaints/${selectedComplaint.id}/complete`, formData);
      setSelectedComplaint(updated);
      setCompletionDialog({ open: false, remarks: '', photoFile: null, photoPreview: null, error: '' });
      setActionMessage('Complaint successfully completed with verified resolution photo.');
      fetchComplaints(pageInfo.pageNumber);
    } catch (err) {
      setCompletionDialog((prev) => ({ ...prev, error: err.message || 'Failed to complete grievance.' }));
    } finally {
      setCompleting(false);
    }
  };

  const handleResendNotification = async (id) => {
    setResending(true);
    setActionMessage('');
    try {
      const updated = await api.post(`/admin/complaints/${id}/resend-notification`, {});
      setSelectedComplaint(updated);
      setActionMessage('Notification dispatch re-attempted. Check notification log below.');
    } catch (err) {
      alert('Failed to resend notification: ' + err.message);
    } finally {
      setResending(false);
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

  return (
    <div className="container" style={{ maxWidth: '1280px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Administrator Management Portal</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            Logged in as <strong>{adminUser?.fullName || adminUser?.username}</strong> &bull; Centralized grievances across all hostels
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fetchComplaints(pageInfo.pageNumber)}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {actionMessage && (
        <div style={{
          background: 'var(--success-50)',
          color: 'var(--success-700)',
          border: '1px solid #a7f3d0',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <input
                type="text"
                name="search"
                className="form-control"
                placeholder="Search by Complaint ID, student name, room, description..."
                value={filters.search}
                onChange={handleFilterChange}
                style={{ height: '42px', fontSize: '0.9rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" style={{ height: '42px', padding: '0 1.25rem' }}>
              <Search size={16} />
              Search
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={resetFilters}
              style={{ height: '42px' }}
            >
              Reset
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              name="hostelId"
              className="form-control"
              value={filters.hostelId}
              onChange={handleFilterChange}
              style={{ flex: '1 1 180px', height: '40px', fontSize: '0.85rem' }}
            >
              <option value="">All Hostels</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <select
              name="categoryId"
              className="form-control"
              value={filters.categoryId}
              onChange={handleFilterChange}
              style={{ flex: '1 1 180px', height: '40px', fontSize: '0.85rem' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
              style={{ flex: '1 1 160px', height: '40px', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              name="locationType"
              className="form-control"
              value={filters.locationType}
              onChange={handleFilterChange}
              style={{ flex: '1 1 160px', height: '40px', fontSize: '0.85rem' }}
            >
              <option value="">All Locations</option>
              <option value="ROOM">Room</option>
              <option value="COMMON_AREA">Common Area</option>
            </select>
          </div>
        </form>
      </div>

      {/* Complaints Data Table */}
      <div className="table-responsive" style={{ background: 'white', marginBottom: '1.5rem' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Student Name</th>
              <th>Hostel & Location</th>
              <th>Category</th>
              <th>Status</th>
              <th>Submitted</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                  Loading complaints...
                </td>
              </tr>
            ) : complaints.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
                  No grievances found matching the selected criteria.
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(c.id)}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-600)' }}>
                    {c.complaintCode}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{c.studentEmail}</div>
                  </td>
                  <td>
                    <div>{c.hostelName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {c.locationDetail} ({c.locationType === 'ROOM' ? 'Room' : 'Common Area'})
                    </div>
                  </td>
                  <td>{c.categoryName}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    {formatDate(c.submittedAt)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetail(c.id);
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
          Showing {complaints.length} of {pageInfo.totalElements} grievances (Page {pageInfo.pageNumber + 1} of {Math.max(1, pageInfo.totalPages)})
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pageInfo.pageNumber === 0 || loading}
            onClick={() => fetchComplaints(pageInfo.pageNumber - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <button
            className="btn btn-secondary btn-sm"
            disabled={pageInfo.pageNumber >= pageInfo.totalPages - 1 || loading}
            onClick={() => fetchComplaints(pageInfo.pageNumber + 1)}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Complaint Detail Drawer / Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '760px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>GRIEVANCE DETAILS</div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-900)' }}>{selectedComplaint.complaintCode}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <StatusBadge status={selectedComplaint.status} />
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  Submitted: {formatDate(selectedComplaint.submittedAt)}
                </span>
              </div>

              {/* Student & Location Details */}
              <div className="grid grid-cols-2" style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>STUDENT CONTACT</div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                    {selectedComplaint.studentName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-600)' }}>
                    <a href={`mailto:${selectedComplaint.studentEmail}`}>{selectedComplaint.studentEmail}</a>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>LOCATION & HOSTEL</div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                    {selectedComplaint.hostelName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    {selectedComplaint.locationDetail} ({selectedComplaint.locationType})
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)' }}>CATEGORY & DESCRIPTION</div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-800)', marginTop: '0.2rem' }}>
                    {selectedComplaint.categoryName}
                  </div>
                  <div style={{ color: 'var(--slate-700)', marginTop: '0.35rem', whiteSpace: 'pre-wrap' }}>
                    {selectedComplaint.description}
                  </div>
                </div>

                {selectedComplaint.photoUrl && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '0.35rem' }}>
                      STUDENT SUBMITTED PHOTO
                    </div>
                    <a href={selectedComplaint.photoUrl} target="_blank" rel="noreferrer">
                      <img
                        src={selectedComplaint.photoUrl}
                        alt="Submitted issue"
                        style={{ maxHeight: '180px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--slate-300)' }}
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Completion Section if COMPLETED */}
              {selectedComplaint.status === 'COMPLETED' && (
                <div style={{ background: 'var(--success-50)', border: '1px solid #a7f3d0', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--success-700)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} />
                    Verified Grievance Resolution
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    <strong>Remarks:</strong> {selectedComplaint.completionRemarks}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.75rem' }}>
                    Completed by: <strong>{selectedComplaint.completedByAdminName}</strong> on {formatDate(selectedComplaint.completedAt)}
                  </div>
                  {selectedComplaint.completionPhotoUrl && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-700)', marginBottom: '0.25rem' }}>
                        MANDATORY COMPLETION PHOTOGRAPH
                      </div>
                      <a href={selectedComplaint.completionPhotoUrl} target="_blank" rel="noreferrer">
                        <img
                          src={selectedComplaint.completionPhotoUrl}
                          alt="Resolution proof"
                          style={{ maxHeight: '200px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--success-600)' }}
                        />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons (if NOT COMPLETED) */}
              {selectedComplaint.status !== 'COMPLETED' && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                  {selectedComplaint.status === 'SUBMITTED' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setStatusDialog({ open: true, newStatus: 'IN_PROGRESS', note: '' })}
                    >
                      <Clock size={15} />
                      Set In Progress
                    </button>
                  )}

                  {selectedComplaint.status !== 'REJECTED' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger-700)', borderColor: '#fca5a5' }}
                      onClick={() => setStatusDialog({ open: true, newStatus: 'REJECTED', note: '' })}
                    >
                      <XCircle size={15} />
                      Reject / Invalid
                    </button>
                  )}

                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => setCompletionDialog({ open: true, remarks: '', photoFile: null, photoPreview: null, error: '' })}
                  >
                    <CheckCircle size={15} />
                    Complete Grievance (Mandatory Photo)
                  </button>
                </div>
              )}

              {/* Status Timeline History */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Status History Audit Trail</h3>
                <div className="timeline">
                  {selectedComplaint.statusTimeline?.map((h, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot" />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <StatusBadge status={h.newStatus} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          by <strong>{h.changedBy || 'System'}</strong> on {formatDate(h.changedAt)}
                        </span>
                      </div>
                      {h.note && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                          {h.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Audit Log */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>Notification Logs</h3>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleResendNotification(selectedComplaint.id)}
                    disabled={resending}
                  >
                    <Send size={14} />
                    {resending ? 'Dispatching...' : 'Resend Email'}
                  </button>
                </div>

                <div className="table-responsive" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  <table className="table" style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Recipient</th>
                        <th>Attempted</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedComplaint.notificationLogs?.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center' }}>No notification logs recorded.</td></tr>
                      ) : (
                        selectedComplaint.notificationLogs?.map((l) => (
                          <tr key={l.id}>
                            <td>{l.type}</td>
                            <td>
                              <span style={{
                                color: l.status === 'SENT' ? 'var(--success-700)' : 'var(--danger-700)',
                                fontWeight: 700
                              }}>
                                {l.status}
                              </span>
                            </td>
                            <td>{l.recipientEmail}</td>
                            <td>{formatDate(l.attemptedAt)}</td>
                            <td style={{ color: 'var(--danger-600)' }}>{l.errorMessage || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedComplaint(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Dialog */}
      {statusDialog.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Update Status</h3>
              <button
                type="button"
                onClick={() => setStatusDialog({ open: false, newStatus: 'IN_PROGRESS', note: '' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  className="form-control"
                  value={statusDialog.newStatus}
                  onChange={(e) => setStatusDialog((prev) => ({ ...prev, newStatus: e.target.value }))}
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REJECTED">Rejected / Invalid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Reason / Note</label>
                <textarea
                  className="form-control"
                  placeholder="Provide context for this status update (e.g. Technician assigned, duplicate ticket, invalid location)..."
                  value={statusDialog.note}
                  onChange={(e) => setStatusDialog((prev) => ({ ...prev, note: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStatusDialog({ open: false, newStatus: 'IN_PROGRESS', note: '' })}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
              >
                {updatingStatus ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Completion Dialog (MANDATORY PHOTO ENFORCED) */}
      {completionDialog.open && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <form onSubmit={handleCompleteComplaint}>
              <div className="modal-header">
                <div>
                  <h3 style={{ color: 'var(--success-700)' }}>Complete Grievance</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    Hard Rule: Mandatory resolution photograph required to complete
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompletionDialog({ open: false, remarks: '', photoFile: null, photoPreview: null, error: '' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {completionDialog.error && (
                  <div style={{
                    background: 'var(--danger-50)',
                    color: 'var(--danger-700)',
                    border: '1px solid #fecaca',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{completionDialog.error}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Resolution Remarks <span className="required">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Describe the action taken (e.g. Replaced leaking valve, repaired switchboard, fixed window pane)..."
                    value={completionDialog.remarks}
                    onChange={(e) => setCompletionDialog((prev) => ({ ...prev, remarks: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Resolution Photograph <span className="required">* (Mandatory)</span>
                  </label>
                  <div className="form-hint" style={{ marginBottom: '0.5rem' }}>
                    Backend strictly enforces that a resolution photo must be attached before completion.
                  </div>

                  {completionDialog.photoPreview ? (
                    <div style={{ position: 'relative', display: 'inline-block', border: '2px solid var(--success-600)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <img
                        src={completionDialog.photoPreview}
                        alt="Completion preview"
                        style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCompletionDialog((prev) => ({ ...prev, photoFile: null, photoPreview: null }));
                          if (completionFileInputRef.current) completionFileInputRef.current.value = '';
                        }}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="file-dropzone"
                      style={{ borderStyle: 'solid', borderColor: 'var(--success-600)' }}
                      onClick={() => completionFileInputRef.current?.click()}
                    >
                      <Upload size={28} style={{ color: 'var(--success-600)', margin: '0 auto 0.5rem auto', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                        Upload Resolution Photograph
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        JPEG, PNG, WebP up to 5MB
                      </div>
                    </div>
                  )}

                  <input
                    ref={completionFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => handleCompletionPhotoSelect(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCompletionDialog({ open: false, remarks: '', photoFile: null, photoPreview: null, error: '' })}
                  disabled={completing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={completing}
                >
                  {completing ? 'Completing...' : 'Mark Grievance COMPLETED'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
