import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/client';
import { DashboardSummary, WorkOrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ArrowRight, Eye, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onNavigateToWorkOrder: (id: number) => void;
  onNavigateToView: (view: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToWorkOrder,
  onNavigateToView,
}) => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await dashboardApi.getSummary();
      setData(res.data);
    } catch (err: any) {
      setError('Failed to load dashboard metrics. Please check API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="page-body">
        <div style={{ marginBottom: '1.25rem' }}>
          <h2>Operations Dashboard</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading maintenance queue...</p>
        </div>
        <LoadingSkeleton rows={6} height="60px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-body">
        <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #D9DEE5', borderRadius: '6px' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: '0.5rem' }}>
            {error || 'Unable to load dashboard data.'}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadDashboard}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const inProgressCount =
    (data.statusCounts['IN_PROGRESS'] || 0) +
    (data.statusCounts['ASSIGNED'] || 0) +
    (data.statusCounts['ON_HOLD'] || 0);

  return (
    <div className="page-body">
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Operations Dashboard
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Open work orders and current maintenance activity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToView('kanban')}>
            View Kanban Board
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigateToView('workorders')}>
            All Work Orders <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Operational Summary Panel (Structured, Non-Floating) */}
      <div className="ops-summary-panel">
        {/* Total Work Orders */}
        <div className="ops-summary-item">
          <span className="ops-summary-label">Total Work Orders</span>
          <span className="ops-summary-value">{data.totalWorkOrders}</span>
        </div>

        {/* Active Jobs */}
        <div className="ops-summary-item">
          <span className="ops-summary-label">Active Jobs</span>
          <span className="ops-summary-value">{inProgressCount}</span>
        </div>

        {/* Overdue */}
        <div className="ops-summary-item">
          <span className="ops-summary-label">Overdue</span>
          <span
            className="ops-summary-value"
            style={{ color: data.overdueCount > 0 ? 'var(--danger)' : 'var(--text-primary)' }}
          >
            {data.overdueCount}
          </span>
        </div>

        {/* Approaching SLA */}
        <div className="ops-summary-item">
          <span className="ops-summary-label">Approaching SLA</span>
          <span
            className="ops-summary-value"
            style={{ color: data.atRiskCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}
          >
            {data.atRiskCount}
          </span>
        </div>

        {/* SLA Compliance */}
        <div className="ops-summary-item">
          <span className="ops-summary-label">SLA Compliance</span>
          <span className="ops-summary-value" style={{ color: 'var(--success)' }}>
            {data.slaCompliancePercentage}%
          </span>
        </div>
      </div>

      {/* Primary Section: Work Orders Requiring Attention */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.65rem',
          }}
        >
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Work Orders Requiring Attention
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {data.recentActivity.length} recent activity items
          </span>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>WO Number</th>
                <th>Customer</th>
                <th>Site</th>
                <th>Priority</th>
                <th>Technician</th>
                <th>Status</th>
                <th>SLA</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    No open work orders requiring attention.
                  </td>
                </tr>
              ) : (
                data.recentActivity.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => onNavigateToWorkOrder(wo.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--primary)' }}>
                      {wo.workOrderCode}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {wo.customerName || '—'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {wo.siteName || '—'}
                    </td>
                    <td>
                      <PriorityBadge priority={wo.priority} />
                    </td>
                    <td style={{ color: wo.assignedTechnicianName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {wo.assignedTechnicianName || 'Unassigned'}
                    </td>
                    <td>
                      <StatusBadge status={wo.status} />
                    </td>
                    <td>
                      <SlaBadge status={wo.slaStatus} dueDate={wo.slaDueDate} showTimer />
                    </td>
                    <td style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      {wo.updatedAt ? new Date(wo.updatedAt).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToWorkOrder(wo.id);
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Secondary Operational Section: Technician Workload & Status Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
        {/* Technician Workload Table */}
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">Technician Workload</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {data.technicianWorkloads.length} Field Technicians
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.825rem' }}>
              <thead>
                <tr>
                  <th>Technician</th>
                  <th style={{ textAlign: 'center' }}>Active Jobs</th>
                  <th style={{ textAlign: 'right' }}>Capacity</th>
                </tr>
              </thead>
              <tbody>
                {data.technicianWorkloads.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No active technician assignments.
                    </td>
                  </tr>
                ) : (
                  data.technicianWorkloads.map((tech) => {
                    const capacityLabel =
                      tech.activeJobsCount === 0
                        ? 'Available'
                        : tech.activeJobsCount <= 2
                        ? 'Optimal'
                        : 'At Capacity';

                    const capacityColor =
                      tech.activeJobsCount === 0
                        ? '#15803D'
                        : tech.activeJobsCount <= 2
                        ? '#2563EB'
                        : '#B45309';

                    return (
                      <tr key={tech.technicianId}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tech.technicianName}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          {tech.activeJobsCount}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: capacityColor,
                              backgroundColor: tech.activeJobsCount === 0 ? '#F0FDF4' : tech.activeJobsCount <= 2 ? '#EFF6FF' : '#FFFBEB',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              border: `1px solid ${tech.activeJobsCount === 0 ? '#BBF7D0' : tech.activeJobsCount <= 2 ? '#BFDBFE' : '#FDE68A'}`,
                            }}
                          >
                            {capacityLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Work Orders by Status List */}
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <h3 className="card-title">Work Orders by Status</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lifecycle distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(Object.keys(data.statusCounts) as WorkOrderStatus[]).map((st) => {
              const count = data.statusCounts[st] || 0;
              const pct = data.totalWorkOrders > 0 ? (count / data.totalWorkOrders) * 100 : 0;
              return (
                <div key={st}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <StatusBadge status={st} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>{count}</strong> ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div style={{ height: '4px', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: st === 'CLOSED' ? '#9CA3AF' : st === 'COMPLETED' ? '#16A34A' : st === 'CANCELLED' ? '#DC2626' : '#2563EB',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
