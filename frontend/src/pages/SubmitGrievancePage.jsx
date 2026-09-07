import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import ConfirmationModal from '../components/ConfirmationModal';
import { Upload, X, AlertCircle, CheckCircle2, ShieldAlert, Image } from 'lucide-react';

export default function SubmitGrievancePage({ setActivePage, setTrackId }) {
  const DEFAULT_HOSTELS = [
    { id: 1, name: 'Hostel A (Ganga Block)' },
    { id: 2, name: 'Hostel B (Yamuna Block)' },
  ];

  const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Plumbing', description: 'Water leaks, taps, flush, drainage' },
    { id: 2, name: 'Electrical', description: 'Lighting, fans, sockets, wiring' },
    { id: 3, name: 'Civil / Carpentry', description: 'Doors, windows, locks, study tables, beds' },
    { id: 4, name: 'Cleaning / Hygiene', description: 'Washroom sanitation, corridor hygiene' },
    { id: 5, name: 'Other', description: 'Other maintenance requests' },
  ];

  const [hostels, setHostels] = useState(DEFAULT_HOSTELS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loadingLookups, setLoadingLookups] = useState(false);

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    hostelId: 1,
    locationType: 'ROOM',
    locationDetail: '',
    categoryId: 1,
    description: '',
  });

  const [touched, setTouched] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [hostelsRes, categoriesRes] = await Promise.all([
          api.get('/hostels'),
          api.get('/categories'),
        ]);
        setHostels(hostelsRes || []);
        setCategories(categoriesRes || []);
        if (hostelsRes?.length > 0) {
          setFormData((prev) => ({ ...prev, hostelId: hostelsRes[0].id }));
        }
        if (categoriesRes?.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: categoriesRes[0].id }));
        }
      } catch (err) {
        setErrorBanner('Failed to load hostels and categories. Please check connectivity.');
      } finally {
        setLoadingLookups(false);
      }
    }

    loadLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhotoSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const errors = {
    studentName: !formData.studentName.trim() ? 'Student name is required' : null,
    studentEmail: !formData.studentEmail.trim()
      ? 'Email is required'
      : !isEmailValid(formData.studentEmail)
      ? 'Please enter a valid email address'
      : null,
    hostelId: !formData.hostelId ? 'Please select a hostel' : null,
    locationDetail: !formData.locationDetail.trim() ? 'Location detail is required' : null,
    categoryId: !formData.categoryId ? 'Please select a category' : null,
    description: !formData.description.trim() ? 'Grievance description is required' : null,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      studentName: true,
      studentEmail: true,
      hostelId: true,
      locationDetail: true,
      categoryId: true,
      description: true,
    });

    const hasError = Object.values(errors).some((err) => err !== null);
    if (hasError) {
      setErrorBanner('Please fill in all required fields correctly.');
      return;
    }

    setSubmitting(true);
    setErrorBanner('');

    try {
      const data = new FormData();
      data.append('studentName', formData.studentName.trim());
      data.append('studentEmail', formData.studentEmail.trim());
      data.append('hostelId', formData.hostelId);
      data.append('locationType', formData.locationType);
      data.append('locationDetail', formData.locationDetail.trim());
      data.append('categoryId', formData.categoryId);
      data.append('description', formData.description.trim());

      if (photoFile) {
        data.append('photo', photoFile);
      }

      const response = await api.postMultipart('/complaints', data);
      setSubmittedComplaint(response);
    } catch (err) {
      setErrorBanner(err.message || 'Failed to submit grievance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackFromModal = (code) => {
    setTrackId(code);
    setActivePage('track');
  };

  return (
    <div className="container" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Submit a Grievance</h1>
        <p style={{ color: 'var(--slate-600)' }}>
          Please provide accurate details regarding the maintenance issue. Your email will be used strictly to send status updates and the verified completion report.
        </p>
      </div>

      {errorBanner && (
        <div style={{
          background: 'var(--danger-50)',
          color: 'var(--danger-700)',
          border: '1px solid #fecaca',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{errorBanner}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" noValidate>
        {/* Section 1: Student Contact */}
        <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>1. Student / Cadet Information</h2>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="studentName">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="studentName"
                name="studentName"
                type="text"
                className="form-control"
                placeholder="e.g. Amit Kumar"
                value={formData.studentName}
                onChange={handleChange}
                onBlur={() => handleBlur('studentName')}
                required
              />
              {touched.studentName && errors.studentName && (
                <div className="form-error">{errors.studentName}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentEmail">
                Email Address <span className="required">*</span>
              </label>
              <input
                id="studentEmail"
                name="studentEmail"
                type="email"
                className="form-control"
                placeholder="e.g. amit.cadet@hostel.edu"
                value={formData.studentEmail}
                onChange={handleChange}
                onBlur={() => handleBlur('studentEmail')}
                required
              />
              {touched.studentEmail && errors.studentEmail && (
                <div className="form-error">{errors.studentEmail}</div>
              )}
              <div className="form-hint">Used strictly for Complaint ID receipt and resolution updates.</div>
            </div>
          </div>
        </div>

        {/* Section 2: Location Information */}
        <div style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>2. Grievance Location</h2>
          
          <div className="form-group">
            <label className="form-label" htmlFor="hostelId">
              Hostel / Block <span className="required">*</span>
            </label>
            <select
              id="hostelId"
              name="hostelId"
              className="form-control"
              value={formData.hostelId}
              onChange={handleChange}
              onBlur={() => handleBlur('hostelId')}
              disabled={loadingLookups}
              required
            >
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">
                Location Type <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="locationType"
                    value="ROOM"
                    checked={formData.locationType === 'ROOM'}
                    onChange={handleChange}
                  />
                  <span>Individual Room</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="locationType"
                    value="COMMON_AREA"
                    checked={formData.locationType === 'COMMON_AREA'}
                    onChange={handleChange}
                  />
                  <span>Common Area</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="locationDetail">
                {formData.locationType === 'ROOM' ? 'Room Number' : 'Common Area Specification'} <span className="required">*</span>
              </label>
              <input
                id="locationDetail"
                name="locationDetail"
                type="text"
                className="form-control"
                placeholder={formData.locationType === 'ROOM' ? 'e.g. Room 204-B' : 'e.g. 2nd Floor Washroom, Mess Hall'}
                value={formData.locationDetail}
                onChange={handleChange}
                onBlur={() => handleBlur('locationDetail')}
                required
              />
              {touched.locationDetail && errors.locationDetail && (
                <div className="form-error">{errors.locationDetail}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Grievance Details */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>3. Grievance Description & Attachment</h2>

          <div className="form-group">
            <label className="form-label" htmlFor="categoryId">
              Category <span className="required">*</span>
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="form-control"
              value={formData.categoryId}
              onChange={handleChange}
              onBlur={() => handleBlur('categoryId')}
              disabled={loadingLookups}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.description ? `— ${c.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Problem Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              placeholder="Describe the maintenance grievance clearly (e.g. when it started, urgency, specific fixture affected)..."
              value={formData.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              required
            />
            {touched.description && errors.description && (
              <div className="form-error">{errors.description}</div>
            )}
          </div>

          {/* Photograph Upload */}
          <div className="form-group">
            <label className="form-label">
              Attachment Photograph (Optional)
            </label>
            
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block', border: '1px solid var(--slate-300)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <img
                  src={photoPreview}
                  alt="Upload preview"
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                className="file-dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} style={{ color: 'var(--slate-400)', margin: '0 auto 0.5rem auto', display: 'block' }} />
                <div style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                  Click to browse or drag and drop a photo
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                  Supports JPEG, PNG, WebP up to 5MB
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => handlePhotoSelect(e.target.files[0])}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setActivePage('home')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Register Grievance'}
          </button>
        </div>
      </form>

      {submittedComplaint && (
        <ConfirmationModal
          complaint={submittedComplaint}
          onClose={() => {
            setSubmittedComplaint(null);
            setActivePage('home');
          }}
          onTrack={handleTrackFromModal}
        />
      )}
    </div>
  );
}
