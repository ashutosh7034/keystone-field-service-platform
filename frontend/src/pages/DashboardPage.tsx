import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/client';
import { DashboardSummary, WorkOrderStatus } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  Wrench,
  Building2,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';

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

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await dashboardApi.getSummary();
        setData(res.data);
      } catch (err: any) {
        setError('Failed to load dashboard metrics. Please check API server.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="page-body">
        <h2 style={{ marginBottom: '1.5rem' }}>Operations Dashboard</h2>
        <LoadingSkeleton rows={5} height="80px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-body">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
          {error || 'Unable to load dashboard data.'}
        </div>
      </div>
    );
  }

  const inProgressCount = (data.statusCounts['IN_PROGRESS'] || 0) + (data.statusCounts['ASSIGNED'] || 0) + (data.statusCounts['ON_HOLD'] || 0);

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Operations Dashboard</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time facilities maintenance status across HVAC, Electrical, and Plumbing
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigateToView('kanban')}>
            View Kanban Board
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigateToView('workorders')}>
            All Work Orders <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          label="Total Work Orders"
          value={data.totalWorkOrders}
          icon={<ClipboardList size={24} />}
          color="#3b82f6"
          bg="rgba(59, 130, 246, 0.15)"
        />
        <StatCard
          label="Active Jobs"
          value={inProgressCount}
          icon={<Wrench size={24} />}
          color="#f59e0b"
          bg="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          label="Overdue / Breached"
          value={data.overdueCount}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
          bg="rgba(239, 68, 68, 0.15)"
        />
        <StatCard
          label="Approaching SLA (<2h)"
          value={data.atRiskCount}
          icon={<Clock size={24} />}
          color="#f97316"
          bg="rgba(249, 115, 22, 0.15)"
        />
        <StatCard
          label="SLA Compliance Rate"
          value={`${data.slaCompliancePercentage}%`}
          icon={<TrendingUp size={24} />}
          color="#10b981"
          bg="rgba(16, 185, 129, 0.15)"
        />
      </div>

      {/* Main Grid: Status Breakdown & Technician Workload */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Work Orders by Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} color="var(--primary)" /> Work Orders by Status
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifecycle distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(Object.keys(data.statusCounts) as WorkOrderStatus[]).map((st) => {
              const count = data.statusCounts[st] || 0;
              const pct = data.totalWorkOrders > 0 ? (count / data.totalWorkOrders) * 100 : 0;
              return (
                <div key={st}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <StatusBadge status={st} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      {count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: st === 'CLOSED' ? '#64748b' : st === 'COMPLETED' ? '#10b981' : st === 'CANCELLED' ? '#ef4444' : '#3b82f6',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Active Workload */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Wrench size={18} color="var(--warning)" /> Technician Workload
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned active jobs</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.technicianWorkloads.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>No active technician assignments.</div>
            ) : (
              data.technicianWorkloads.map((tech) => (
                <div
                  key={tech.technicianId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        color: 'var(--warning)',
                        border: '1px solid var(--warning-border)',
                      }}
                    >
                      {tech.technicianName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{tech.technicianName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field Specialist</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--warning-bg)',
                        color: 'var(--warning)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {tech.activeJobsCount} Active
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Site Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Recent Work Order Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="var(--info)" /> Recent Work Orders
            </h3>
            <button className="btn btn-outline btn-sm" onClick={() => onNavigateToView('workorders')}>
              View All
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>SLA</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActivity.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => onNavigateToWorkOrder(wo.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{wo.workOrderCode}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{wo.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{wo.siteName} ({wo.customerName})</div>
                    </td>
                    <td><PriorityBadge priority={wo.priority} /></td>
                    <td><StatusBadge status={wo.status} /></td>
                    <td><SlaBadge status={wo.slaStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Site Work Order Concentrations */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Building2 size={18} color="var(--primary)" /> Top Facility Sites
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By volume</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {data.siteDistribution.slice(0, 6).map((site) => (
              <div
                key={site.siteId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{site.siteName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{site.customerName}</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                  {site.workOrdersCount} Jobs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
