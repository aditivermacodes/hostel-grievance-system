import React from 'react';
import {
  PlusCircle, Search, Wrench, Zap, Hammer, Sparkles, HelpCircle,
  CheckCircle2, ShieldCheck, Clock, Compass, Send, Camera, Lock,
  ArrowRight, Droplets, Building2, LifeBuoy, Building, MapPin, Mail, Layers
} from 'lucide-react';

export default function HomePage({ setActivePage, onSelectCategory }) {
  const handleCategoryClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    } else {
      setActivePage('submit');
    }
  };

  const categories = [
    {
      id: 1,
      title: 'Plumbing & Water Supply',
      icon: Droplets,
      color: '#0284c7',
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
      sla: 'Rapid Response (< 4h)',
      desc: 'Taps, pipelines, geysers, flush tanks, washroom drainage, leakage prevention.',
      buttonText: 'Report Plumbing Issue',
    },
    {
      id: 2,
      title: 'Electrical & Power Systems',
      icon: Zap,
      color: '#d97706',
      bgColor: '#fffbeb',
      borderColor: '#fde68a',
      sla: 'Rapid Response (< 4h)',
      desc: 'Tube lights, ceiling fans, regulators, MCB trips, study desk sockets, wiring.',
      buttonText: 'Report Electrical Issue',
    },
    {
      id: 3,
      title: 'Civil, Locks & Carpentry',
      icon: Hammer,
      color: '#475569',
      bgColor: '#f8fafc',
      borderColor: '#cbd5e1',
      sla: 'Standard Turnaround (24–48h)',
      desc: 'Doors, mortise locks, window panes, study tables, chairs, bunks, almirahs.',
      buttonText: 'Report Carpentry Issue',
    },
    {
      id: 4,
      title: 'Sanitation & Hygiene',
      icon: Sparkles,
      color: '#059669',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
      sla: 'Daily Scheduled Service',
      desc: 'Corridor cleanliness, washroom sanitization, pest control, waste disposal.',
      buttonText: 'Report Sanitation Issue',
    },
    {
      id: 5,
      title: 'Cadet Common Amenities',
      icon: Building2,
      color: '#4f46e5',
      bgColor: '#eef2ff',
      borderColor: '#c7d2fe',
      sla: 'Campus Infrastructure',
      desc: 'Mess hall, gymnasium, recreation lounge, library, muster parade deck.',
      buttonText: 'Report Facility Issue',
    },
    {
      id: 5,
      title: 'Duty Officer & Urgent Inquiries',
      icon: LifeBuoy,
      color: '#e11d48',
      bgColor: '#fff1f2',
      borderColor: '#fecdd3',
      sla: 'Immediate Duty Escalation',
      desc: 'Water cooler outages, structural hazards, urgent caretaker assistance.',
      buttonText: 'Report Urgent Issue',
    },
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Room Identification',
      icon: Compass,
      desc: 'Select Old Hostel or New Hostel, floor, wing (Port, Central, Starboard), and room number. Zero login required.',
    },
    {
      step: '02',
      title: 'Automated Dispatch',
      icon: Send,
      desc: 'Instant ticket generated with a unique tracking code. Automated email dispatch sent to cadet and duty team.',
    },
    {
      step: '03',
      title: 'Field Inspection & Repair',
      icon: Wrench,
      desc: 'Assigned technicians arrive at the specified room. Real-time status moves from Submitted to In Progress.',
    },
    {
      step: '04',
      title: 'Verified Photo Closure',
      icon: Camera,
      desc: 'Strict mandatory photograph uploaded by maintenance before closing. Cadet personal details remain redacted.',
    },
  ];

  const serviceGuarantees = [
    {
      icon: Clock,
      title: 'Zero Login Friction',
      desc: 'File any repair in under 60 seconds with your room code and student email. No passwords needed.',
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      icon: CheckCircle2,
      title: 'Mandatory Photo Proof',
      desc: 'Maintenance cannot close any ticket without uploading high-resolution photographic proof of resolution.',
      color: '#059669',
      bg: '#ecfdf5',
    },
    {
      icon: Mail,
      title: 'Automated Mail Updates',
      desc: 'Receive immediate confirmation with direct status tracking links delivered directly to your inbox.',
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
    {
      icon: ShieldCheck,
      title: 'Cadet Privacy Shield',
      desc: 'Public tracking logs display resolution pictures while fully redacting personal contact details.',
      color: '#d97706',
      bg: '#fffbeb',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        color: 'white',
        padding: '4.5rem 1.5rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '3rem',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40%',
          right: '-20%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ textAlign: 'center', maxWidth: '880px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '0.4rem 1.1rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <ShieldCheck size={16} />
            IMU-NMC Official Cadet Maintenance Portal
          </div>

          <h1 style={{ color: 'white', fontSize: '2.6rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            IMU-NMC Hostel Maintenance &amp; Repair
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
            Centralized facility management for Old Hostel (OH) and New Hostel (NH). Rapid room repairs, common area servicing, real-time ticket tracking, and verified photographic proof of resolution.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{
                background: '#ffffff',
                color: '#1d4ed8',
                fontSize: '1.05rem',
                fontWeight: 700,
                padding: '0.875rem 2rem',
                border: 'none',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
              }}
              onClick={() => setActivePage('submit')}
            >
              <PlusCircle size={20} />
              Submit a Grievance
            </button>
            <button
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 600,
                padding: '0.875rem 2rem',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                backdropFilter: 'blur(8px)'
              }}
              onClick={() => setActivePage('track')}
            >
              <Search size={20} />
              Track by Complaint ID
            </button>
          </div>
        </div>
      </section>

      {/* 4 Service Guarantees */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {serviceGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="feature-pill-card">
                <div style={{
                  background: item.bg,
                  color: item.color,
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--slate-900)' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.45 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Campus Residential Quarters Standard Showcase */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        marginBottom: '4rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.25rem auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem'
          }}>
            <Compass size={16} />
            Campus Quarters Architecture
          </div>
          <h2 style={{ color: '#ffffff', fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            IMU-NMC Maritime Room Standard
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Both residential blocks follow a standardized naval orientation system. Our room code decoder prevents dispatch delays and routes technicians straight to your doorstep.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Old Hostel Block */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Building size={20} color="#38bdf8" />
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', margin: 0 }}>Old Hostel (OH)</h3>
              </div>
              <span style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Code: OH
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>4 Levels / Floors</strong>
                A (Ground), B (1st), C (2nd), D (3rd)
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>3 Wings</strong>
                Port (P), Central (C), Starboard (S)
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>Capacity</strong>
                12 Rooms per wing (144 rooms)
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>Sample Standard</strong>
                <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>OH-BP-07</span>
              </div>
            </div>
          </div>

          {/* New Hostel Block */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Building size={20} color="#34d399" />
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', margin: 0 }}>New Hostel (NH)</h3>
              </div>
              <span style={{
                background: 'rgba(52, 211, 153, 0.2)',
                color: '#34d399',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Code: NH
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>4 Levels / Floors</strong>
                A (Ground), B (1st), C (2nd), D (3rd)
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>3 Wings</strong>
                Port (P), Central (C), Starboard (S)
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>Capacity</strong>
                12 Rooms per wing (144 rooms)
              </div>
              <div>
                <strong style={{ color: '#ffffff', display: 'block' }}>Sample Standard</strong>
                <span style={{ color: '#34d399', fontFamily: 'monospace', fontWeight: 700 }}>NH-BP-06</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decoder Formula Bar */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px dashed rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={20} color="#38bdf8" />
            <div style={{ fontSize: '0.9rem' }}>
              <strong style={{ color: '#ffffff' }}>Naval Room Code Blueprint: </strong>
              <span style={{ color: '#94a3b8' }}>[Hostel]-[Floor][Wing]-[Room]</span>
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#f8fafc'
          }}>
            NH-BP-06 = New Hostel • 1st Floor (B) • Port Wing (P) • Room 06
          </div>
        </div>
      </section>

      {/* Maintenance Categories (Balanced 6-Card Grid) */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--primary-600)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem'
          }}>
            <Wrench size={16} />
            Maintenance Divisions
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Comprehensive Cadet Maintenance Coverage
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
            Select any division below to instantly open the grievance form with your category pre-configured.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {categories.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="category-card"
                onClick={() => handleCategoryClick(c.id)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{
                      background: c.bgColor,
                      color: c.color,
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${c.borderColor}`
                    }}>
                      <Icon size={24} />
                    </div>
                    <span style={{
                      background: c.bgColor,
                      color: c.color,
                      border: `1px solid ${c.borderColor}`,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '9999px',
                      fontSize: '0.725rem',
                      fontWeight: 700
                    }}>
                      {c.sla}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                    {c.title}
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {c.desc}
                  </p>
                </div>

                <div className="category-card-action">
                  <span>{c.buttonText}</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Step Cadet Maintenance Protocol */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--primary-600)',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem'
          }}>
            <Layers size={16} />
            Cadet Standard Operating Procedure
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            How the Resolution Protocol Works
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '1rem' }}>
            Transparent end-to-end management from defect notification to photographic proof of completion.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="step-card">
                <span className="step-number">{step.step}</span>
                <div style={{
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency & Duty Desk Contact Strip */}
      <section style={{
        background: '#ffffff',
        border: '1px solid var(--slate-200)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <MapPin size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>IMU-NMC Cadet Caretaker &amp; Duty Desk</h3>
          </div>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', margin: 0 }}>
            Ground Floor Administrative Wing, Old Hostel &bull; Duty Desk Hours: 08:00 – 20:00 Daily &bull; Emergency water/electrical faults attended 24/7
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActivePage('track')}
          >
            <Search size={16} />
            Check Live Status
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActivePage('submit')}
          >
            <PlusCircle size={16} />
            File Repair Request
          </button>
        </div>
      </section>
    </div>
  );
}

