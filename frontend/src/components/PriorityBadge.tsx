import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityConfig = (p: Priority) => {
    switch (p) {
      case 'LOW':
        return { label: 'Low', color: '#4B5563', dotColor: '#6B7280' };
      case 'MEDIUM':
        return { label: 'Medium', color: '#374151', dotColor: '#6B7280' };
      case 'HIGH':
        return { label: 'High', color: '#B45309', dotColor: '#D97706' };
      case 'EMERGENCY':
        return { label: 'Critical', color: '#B91C1C', dotColor: '#DC2626' };
      default:
        return { label: p, color: '#374151', dotColor: '#6B7280' };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.8rem',
        fontWeight: priority === 'HIGH' || priority === 'EMERGENCY' ? 600 : 500,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          display: 'inline-block',
        }}
      />
      {config.label}
    </span>
  );
};
