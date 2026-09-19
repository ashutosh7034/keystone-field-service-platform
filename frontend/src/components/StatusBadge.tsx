import React from 'react';
import { WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (st: WorkOrderStatus) => {
    switch (st) {
      case 'NEW':
        return { label: 'New Request', color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' };
      case 'ASSIGNED':
        return { label: 'Assigned', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' };
      case 'ON_HOLD':
        return { label: 'On Hold', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' };
      case 'COMPLETED':
        return { label: 'Completed', color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' };
      case 'CLOSED':
        return { label: 'Closed', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' };
      default:
        return { label: st, color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.15rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: '0.75rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
        }}
      />
      {config.label}
    </span>
  );
};
