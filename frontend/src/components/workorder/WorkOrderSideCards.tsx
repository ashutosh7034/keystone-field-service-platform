import React, { useState, useEffect } from 'react';
import { WorkOrderDetail, CustomerWorkOrderDetail } from '../../types';
import { Clock, UserCheck, Calendar, Phone } from 'lucide-react';
import { SlaBadge } from '../SlaBadge';

interface WorkOrderSideCardsProps {
  data: WorkOrderDetail | CustomerWorkOrderDetail;
  fullDetail: WorkOrderDetail | null;
  canReassign: boolean;
  onOpenAssignModal: () => void;
}

export const WorkOrderSideCards: React.FC<WorkOrderSideCardsProps> = ({
  data,
  fullDetail,
  canReassign,
  onOpenAssignModal,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // Live countdown calculation
  useEffect(() => {
    const calculateTime = () => {
      if (!data.slaDueDate) {
        setTimeLeft('No SLA Defined');
        return;
      }

      if (data.status === 'COMPLETED' || data.status === 'CLOSED') {
        setTimeLeft('SLA Fulfilled');
        return;
      }

      const now = new Date().getTime();
      const due = new Date(data.slaDueDate).getTime();
      const diffMs = due - now;

      if (diffMs <= 0) {
        const absDiff = Math.abs(diffMs);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const mins = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`Breached by ${hours}h ${mins}m`);
        setIsUrgent(true);
      } else {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${mins}m remaining`);
        setIsUrgent(hours < 4);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000);
    return () => clearInterval(interval);
  }, [data.slaDueDate, data.status]);

  const assignedTechName = fullDetail
    ? fullDetail.assignedTechnicianName
    : (data as CustomerWorkOrderDetail).assignedTechnicianName;

  const targetDateStr = data.slaDueDate
    ? new Date(data.slaDueDate).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Not Specified';

  const createdDateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Not Recorded';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. SLA Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0.85rem' }}>
          <h3 className="card-title" style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} style={{ color: 'var(--text-secondary)' }} /> SLA Status
          </h3>
          <SlaBadge status={data.slaStatus} dueDate={data.slaDueDate} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Target SLA:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{targetDateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>
            <span
              style={{
                fontWeight: 600,
                color: isUrgent ? 'var(--danger)' : 'var(--success)',
              }}
            >
              {timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Assignment Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0.85rem' }}>
          <h3 className="card-title" style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={15} style={{ color: 'var(--text-secondary)' }} /> Assignment
          </h3>
          {canReassign && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={onOpenAssignModal}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              {assignedTechName ? 'Reassign' : 'Assign'}
            </button>
          )}
        </div>

        {assignedTechName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.875rem',
                flexShrink: 0,
              }}
            >
              {assignedTechName.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {assignedTechName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Commercial Field Specialist
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                <Phone size={12} /> +1-555-2003
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Unassigned (Queued in Dispatch backlog)
          </div>
        )}
      </div>

      {/* 3. Schedule Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0.85rem' }}>
          <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} /> Schedule
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Created:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{createdDateStr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>SLA Target:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{targetDateStr}</span>
          </div>
          {fullDetail && fullDetail.totalLabourMinutes !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Labor Logged:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                {Math.floor(fullDetail.totalLabourMinutes / 60)}h {fullDetail.totalLabourMinutes % 60}m
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
