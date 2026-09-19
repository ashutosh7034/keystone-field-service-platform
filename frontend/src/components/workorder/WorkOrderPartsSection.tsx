import React from 'react';
import { PartUsage } from '../../types';
import { Wrench, Plus, Package } from 'lucide-react';

interface WorkOrderPartsSectionProps {
  partsUsed?: PartUsage[];
  totalPartsCost?: number;
  canLogParts: boolean;
  onOpenPartModal: () => void;
}

export const WorkOrderPartsSection: React.FC<WorkOrderPartsSectionProps> = ({
  partsUsed = [],
  totalPartsCost = 0,
  canLogParts,
  onOpenPartModal,
}) => {
  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Wrench size={16} style={{ color: 'var(--warning)' }} /> Parts Consumed ({partsUsed.length})
        </h3>
        {canLogParts && (
          <button className="btn btn-primary btn-sm" onClick={onOpenPartModal}>
            <Plus size={13} /> Log Part Consumed
          </button>
        )}
      </div>

      {partsUsed.length === 0 ? (
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            padding: '1.75rem 0',
            textAlign: 'center',
          }}
        >
          <Package size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div>No parts recorded on this work order yet.</div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Part</th>
                <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Unit Cost</th>
                <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Total</th>
                <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {partsUsed.map((p) => {
                const lineTotal = (p.quantity || 0) * (p.unitCostAtUsage || 0);
                const recordedTime = p.createdAt
                  ? new Date(p.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—';

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.75rem 0.85rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.partName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        SKU: {p.partSku} {p.recordedByUserName ? `• Logged by ${p.recordedByUserName}` : ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', fontWeight: 700 }}>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {p.quantity}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                      ${p.unitCostAtUsage.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 800, color: 'var(--warning)' }}>
                      ${lineTotal.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {recordedTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ padding: '0.85rem 0.85rem', fontWeight: 700, textAlign: 'right' }}>
                  Total Parts Consumed:
                </td>
                <td style={{ padding: '0.85rem 0.85rem', fontWeight: 800, color: 'var(--warning)', fontSize: '0.95rem', textAlign: 'right' }}>
                  ${totalPartsCost.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
