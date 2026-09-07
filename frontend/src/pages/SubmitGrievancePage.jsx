import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api/client';
import ConfirmationModal from '../components/ConfirmationModal';
import { Upload, X, AlertCircle, CheckCircle2, ShieldAlert, Image, Compass, Building, MapPin } from 'lucide-react';

export default function SubmitGrievancePage({ setActivePage, setTrackId, initialCategory }) {
  const DEFAULT_HOSTELS = [
    { id: 1, name: 'Old Hostel', code: 'OH' },
    { id: 2, name: 'New Hostel', code: 'NH' },
  ];

  const FLOORS = [
    { code: 'A', name: 'Ground Floor (A)' },
    { code: 'B', name: '1st Floor (B)' },
    { code: 'C', name: '2nd Floor (C)' },
    { code: 'D', name: '3rd Floor (D)' },
  ];

  const WINGS = [
    { code: 'P', name: 'Port Wing (P)' },
    { code: 'C', name: 'Central Wing (C)' },
    { code: 'S', name: 'Starboard Wing (S)' },
  ];

  const ROOM_NUMBERS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  const COMMON_PRESETS = [
    'Mess Hall',
    'Cadet Gym',
    'Recreation / TV Room',
    'Muster Ground / Parade Deck',
    'Corridor Washroom / Lavatory',
    'Library & Study Hall',
    'Warden / Caretaker Office',
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

  // Maritime room selection states
  const [selectedFloor, setSelectedFloor] = useState('B');
  const [selectedWing, setSelectedWing] = useState('P');
  const [selectedRoom, setSelectedRoom] = useState('06');

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    hostelId: 2,
    locationType: 'ROOM',
    locationDetail: 'NH-BP-06',
    categoryId: initialCategory || 1,
    description: '',
  });

  useEffect(() => {
    if (initialCategory) {
      setFormData((prev) => ({ ...prev, categoryId: initialCategory }));
    }
  }, [initialCategory]);

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

  // Automatically sync computed room code when locationType is ROOM
  useEffect(() => {
    if (formData.locationType === 'ROOM') {
      const currentHostel = hostels.find((h) => String(h.id) === String(formData.hostelId));
      const code = currentHostel?.code || (Number(formData.hostelId) === 2 ? 'NH' : 'OH');
      setFormData((prev) => ({
        ...prev,
        locationDetail: `${code}-${selectedFloor}${selectedWing}-${selectedRoom}`,
      }));
    }
  }, [formData.hostelId, formData.locationType, selectedFloor, selectedWing, selectedRoom, hostels]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Compass size={20} style={{ color: 'var(--primary-600)' }} />
            <h2 style={{ fontSize: '1.15rem', margin: 0 }}>2. Grievance Location & Wing Assignment</h2>
          </div>
          
          <div className="grid grid-cols-2" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="hostelId">
                Hostel Building <span className="required">*</span>
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
                    {h.name} ({h.code || (Number(h.id) === 2 ? 'NH' : 'OH')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Location Type <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: formData.locationType === 'ROOM' ? 600 : 400 }}>
                  <input
                    type="radio"
                    name="locationType"
                    value="ROOM"
                    checked={formData.locationType === 'ROOM'}
                    onChange={handleChange}
                  />
                  <span>Cadet Room</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: formData.locationType === 'COMMON_AREA' ? 600 : 400 }}>
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
          </div>

          {formData.locationType === 'ROOM' ? (
            /* Maritime Room Code Selector */
            <div style={{
              background: 'linear-gradient(145deg, #f8fafc 0%, #eff6ff 100%)',
              border: '1.5px solid #bfdbfe',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginTop: '0.5rem'
            }}>
              {/* Live Room Code Preview Banner */}
              <div style={{
                background: '#1e3a8a',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93c5fd', fontWeight: 700 }}>
                    Selected Room Code
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'monospace' }}>
                    {formData.locationDetail}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Location Breakdown</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e0e7ff' }}>
                    {(hostels.find(h => String(h.id) === String(formData.hostelId))?.name || (Number(formData.hostelId) === 2 ? 'New Hostel' : 'Old Hostel'))} &bull; {FLOORS.find(f => f.code === selectedFloor)?.name.split(' ')[0]} Floor ({selectedFloor}) &bull; {WINGS.find(w => w.code === selectedWing)?.name.split(' ')[0]} Wing ({selectedWing}) &bull; Room {selectedRoom}
                  </div>
                </div>
              </div>

              {/* Selectors Grid: Floor, Wing, Room */}
              <div className="grid grid-cols-3" style={{ gap: '1rem', marginBottom: '1rem' }}>
                {/* 1. Floor Selector (A - D) */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    1. Floor (A &ndash; D)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {FLOORS.map((fl) => (
                      <button
                        type="button"
                        key={fl.code}
                        onClick={() => setSelectedFloor(fl.code)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: 'left',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedFloor === fl.code ? '2px solid #1d4ed8' : '1px solid var(--slate-300)',
                          background: selectedFloor === fl.code ? '#dbeafe' : '#ffffff',
                          color: selectedFloor === fl.code ? '#1e40af' : 'var(--slate-700)',
                          fontWeight: selectedFloor === fl.code ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {fl.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Wing Selector (Port, Central, Starboard) */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    2. Wing (P, C, S)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {WINGS.map((w) => (
                      <button
                        type="button"
                        key={w.code}
                        onClick={() => setSelectedWing(w.code)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          textAlign: 'left',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedWing === w.code ? '2px solid #1d4ed8' : '1px solid var(--slate-300)',
                          background: selectedWing === w.code ? '#dbeafe' : '#ffffff',
                          color: selectedWing === w.code ? '#1e40af' : 'var(--slate-700)',
                          fontWeight: selectedWing === w.code ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {w.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Room Selector (01 - 12) */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    3. Room (01 &ndash; 12)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                    {ROOM_NUMBERS.map((rNum) => (
                      <button
                        type="button"
                        key={rNum}
                        onClick={() => setSelectedRoom(rNum)}
                        style={{
                          padding: '0.45rem 0.2rem',
                          textAlign: 'center',
                          fontSize: '0.85rem',
                          fontFamily: 'monospace',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedRoom === rNum ? '2px solid #1d4ed8' : '1px solid var(--slate-300)',
                          background: selectedRoom === rNum ? '#dbeafe' : '#ffffff',
                          color: selectedRoom === rNum ? '#1e40af' : 'var(--slate-700)',
                          fontWeight: selectedRoom === rNum ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {rNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Notice: Standard format <strong>[Hostel]-[Floor][Wing]-[Room]</strong> (e.g. NH-BP-06 = New Hostel, 1st floor, Port wing, room 06).</span>
              </div>
            </div>
          ) : (
            /* Common Area Selector */
            <div style={{
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Quick Presets (Click to choose)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {COMMON_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, locationDetail: preset }));
                      setTouched((prev) => ({ ...prev, locationDetail: true }));
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.82rem',
                      borderRadius: '9999px',
                      border: formData.locationDetail === preset ? '1.5px solid var(--primary-600)' : '1px solid var(--slate-300)',
                      background: formData.locationDetail === preset ? 'var(--primary-50)' : '#ffffff',
                      color: formData.locationDetail === preset ? 'var(--primary-700)' : 'var(--slate-700)',
                      fontWeight: formData.locationDetail === preset ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="locationDetail">
                  Specific Common Area Location / Details <span className="required">*</span>
                </label>
                <input
                  id="locationDetail"
                  name="locationDetail"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mess Hall - Starboard Entry, Ground Floor Washroom"
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
          )}
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
