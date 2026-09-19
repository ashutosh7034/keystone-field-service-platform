import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  bg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
}) => {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
            {label}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {value}
          </div>
        </div>
        {icon && (
          <div style={{ color: '#6B7280' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};
