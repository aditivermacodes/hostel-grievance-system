import React from 'react';

export default function StatusBadge({ status }) {
  const normalized = (status || 'SUBMITTED').toUpperCase();

  const labels = {
    SUBMITTED: 'Submitted',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
  };

  const label = labels[normalized] || normalized;
  const className = `badge badge-${normalized.toLowerCase()}`;

  return (
    <span className={className}>
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: 'currentColor'
      }} />
      {label}
    </span>
  );
}
