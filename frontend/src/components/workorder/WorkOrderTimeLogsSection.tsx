import React from 'react';
import { TimeLog } from '../../types';
import { Clock, Plus } from 'lucide-react';

interface WorkOrderTimeLogsSectionProps {
  timeLogs?: TimeLog[];
  totalLabourMinutes?: number;
  canLogTime: boolean;
  onOpenTimeModal: () => void;
}

export const WorkOrderTimeLogsSection: React.FC<WorkOrderTimeLogsSectionProps> = ({
  timeLogs = [],
  totalLabourMinutes = 0,
  canLogTime,
  onOpenTimeModal,
}) => {
  const totalHours = (totalLabourMinutes / 60).toFixed(1);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Clock size={18} color="var(--info)" /> Labor Time Logs ({timeLogs.length})
        </h3>
        {canLogTime && (
          <button className="btn btn-outline btn-sm" onClick={onOpenTimeModal}>
            <Plus size={13} /> Log Hours
          </button>
        )}
      </div>

      {timeLogs.length === 0 ? (
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            padding: '1.25rem 0',
            textAlign: 'center',
          }}
        >
          <Clock size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div>No labor hours recorded on this job yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {timeLogs.map((tl) => (
            <div
              key={tl.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{tl.technicianName}</div>
                {tl.note && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {tl.note}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {new Date(tl.loggedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--info-bg)',
                    color: 'var(--info)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {tl.minutes} min ({ (tl.minutes / 60).toFixed(1) }h)
                </span>
              </div>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.65rem',
              borderTop: '1px solid var(--border-subtle)',
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            <span>Total Logged Time:</span>
            <span style={{ color: 'var(--info)', fontSize: '1rem', fontWeight: 800 }}>
              {totalLabourMinutes} min ({totalHours} hrs)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
