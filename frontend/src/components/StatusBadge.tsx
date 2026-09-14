import React from 'react';
import { WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: WorkOrderStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const formatLabel = (st: WorkOrderStatus) => {
    switch (st) {
      case 'NEW': return 'New Request';
      case 'ASSIGNED': return 'Assigned';
      case 'IN_PROGRESS': return 'In Progress';
      case 'ON_HOLD': return 'On Hold';
      case 'COMPLETED': return 'Completed';
      case 'CLOSED': return 'Closed';
      case 'CANCELLED': return 'Cancelled';
      default: return st;
    }
  };

  const className = `badge badge-${status.toLowerCase()}`;

  return <span className={className}>{formatLabel(status)}</span>;
};
