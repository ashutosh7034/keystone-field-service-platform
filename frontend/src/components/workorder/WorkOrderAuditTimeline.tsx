import React from 'react';
import { StatusHistory } from '../../types';
import { StatusBadge } from '../StatusBadge';
import { History } from 'lucide-react';

interface WorkOrderAuditTimelineProps {
  statusHistory?: StatusHistory[];
}

export const WorkOrderAuditTimeline: React.FC<WorkOrderAuditTimelineProps> = ({ statusHistory = [] }) => {
  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={16} style={{ color: 'var(--primary)' }} /> Status & Audit History
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {statusHistory.length} Event(s) Recorded
        </span>
      </div>

      {statusHistory.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
          No status transitions recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '0.25rem' }}>
          {statusHistory.map((h, i) => (
            <div key={h.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  marginTop: '0.35rem',
                  flexShrink: 0,
                  boxShadow: '0 0 8px var(--primary-glow)',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <StatusBadge status={h.toStatus} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {h.changedByUserName || 'System Event'}
                    </span>
                    {h.changedByUserRole && (
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        ({h.changedByUserRole.replace('ROLE_', '')})
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(h.changedAt).toLocaleString()}
                  </span>
                </div>
                {h.note && (
                  <div
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.3rem',
                      lineHeight: 1.45,
                      padding: '0.35rem 0.6rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {h.note}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
