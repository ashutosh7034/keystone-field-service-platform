import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  bg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = '#3b82f6',
  bg = 'rgba(59, 130, 246, 0.12)',
}) => {
  return (
    <div
      className="stat-card"
      style={{
        '--stat-color': color,
        '--stat-bg': bg,
      } as React.CSSProperties}
    >
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-icon-wrapper">{icon}</div>
    </div>
  );
};
