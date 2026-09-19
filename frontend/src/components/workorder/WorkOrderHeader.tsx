import React, { useState, useEffect } from 'react';
import { WorkOrderDetail, CustomerWorkOrderDetail, WorkOrderStatus } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { PriorityBadge } from '../PriorityBadge';
import {
  UserCheck,
  Play,
  Pause,
  CheckCircle,
  Lock,
  XCircle,
} from 'lucide-react';

interface WorkOrderHeaderProps {
  data: WorkOrderDetail | CustomerWorkOrderDetail;
  fullDetail: WorkOrderDetail | null;
  isCustomer: boolean;
  isManager: boolean;
  isDispatcher: boolean;
  isTechnician: boolean;
  onBack: () => void;
  onOpenAssignModal: () => void;
  onPromptTransition: (status: WorkOrderStatus) => void;
}

export const WorkOrderHeader: React.FC<WorkOrderHeaderProps> = ({
  data,
  isCustomer,
  isManager,
  isDispatcher,
  isTechnician,
  onBack,
  onOpenAssignModal,
  onPromptTransition,
}) => {
  const status = data.status;
  const isTerminal = status === 'CLOSED' || status === 'CANCELLED';

  const [slaTimeText, setSlaTimeText] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      if (!data.slaDueDate) {
        setSlaTimeText('No SLA Defined');
        return;
      }
      if (data.status === 'COMPLETED' || data.status === 'CLOSED') {
        setSlaTimeText('Fulfilled');
        return;
      }
      const now = new Date().getTime();
      const due = new Date(data.slaDueDate).getTime();
      const diffMs = due - now;

      if (diffMs <= 0) {
        const absDiff = Math.abs(diffMs);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        setSlaTimeText(`Breached by ${hours}h ${mins}m`);
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setSlaTimeText(`${hours}h ${mins}m remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [data.slaDueDate, data.status]);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* 1. Breadcrumbs: Work Orders / WO-2026-000007 */}
      <div className="wo-breadcrumbs">
        <button onClick={onBack}>Work Orders</button>
        <span className="separator">/</span>
        <span className="current">{data.workOrderCode}</span>
      </div>

      {/* 2. Main Ticket Header Card */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* Row 1: Code + Status Badge + Priority Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            {data.workOrderCode}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusBadge status={data.status} />
            <PriorityBadge priority={data.priority} />
          </div>
        </div>

        {/* Row 2: Title */}
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            margin: '0.1rem 0',
          }}
        >
          {data.title}
        </h1>

        {/* Row 3: SLA Status Line & Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {/* Left: SLA Line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>SLA:</span>
            <span
              style={{
                fontWeight: 600,
                color:
                  data.slaStatus === 'ON_TRACK'
                    ? 'var(--success)'
                    : data.slaStatus === 'AT_RISK'
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
            >
              {data.slaStatus === 'ON_TRACK'
                ? 'On Track'
                : data.slaStatus === 'AT_RISK'
                ? 'At Risk'
                : 'Breached'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{slaTimeText}</span>
          </div>

          {/* Right: Action Buttons */}
          {!isTerminal && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Reassign Tech */}
              {(isDispatcher || isManager) && (
                <button className="btn btn-secondary btn-sm" onClick={onOpenAssignModal}>
                  <UserCheck size={14} /> {data.assignedTechnicianId ? 'Reassign' : 'Assign'}
                </button>
              )}

              {/* Start Work */}
              {status === 'ASSIGNED' && (isTechnician || isManager) && (
                <button className="btn btn-primary btn-sm" onClick={() => onPromptTransition('IN_PROGRESS')}>
                  <Play size={14} /> Start Work
                </button>
              )}

              {/* Put on Hold & Complete */}
              {status === 'IN_PROGRESS' && (isTechnician || isManager) && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => onPromptTransition('ON_HOLD')}>
                    <Pause size={14} /> Put On Hold
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => onPromptTransition('COMPLETED')}>
                    <CheckCircle size={14} /> Mark Completed
                  </button>
                </>
              )}

              {/* Resume Work */}
              {status === 'ON_HOLD' && (isTechnician || isManager) && (
                <button className="btn btn-primary btn-sm" onClick={() => onPromptTransition('IN_PROGRESS')}>
                  <Play size={14} /> Resume Work
                </button>
              )}

              {/* Manager Sign-off Close */}
              {status === 'COMPLETED' && isManager && (
                <button className="btn btn-primary btn-sm" onClick={() => onPromptTransition('CLOSED')}>
                  <Lock size={14} /> Sign Off & Close
                </button>
              )}

              {/* Cancel Job */}
              {(isDispatcher || isManager || (isCustomer && status === 'NEW')) && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => onPromptTransition('CANCELLED')}
                  style={{ color: 'var(--danger)', borderColor: 'var(--border-medium)' }}
                >
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
