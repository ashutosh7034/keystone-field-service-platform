import React, { useState, useEffect } from 'react';
import { reportsApi } from '../api/client';
import { ReportSummary } from '../types';
import { StatCard } from '../components/StatCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { TrendingUp, AlertTriangle, Clock, Wrench, DollarSign, Award, CheckCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const res = await reportsApi.getSummary();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load report summary', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (isLoading) {
    return (
      <div className="page-body">
        <h2 style={{ marginBottom: '1.5rem' }}>Management & SLA Performance Reports</h2>
        <LoadingSkeleton rows={5} height="70px" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>SLA & Operational Performance Report</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Compliance rates, technician labor expenditure, and inventory material usage
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          label="SLA Compliance Rate"
          value={`${data.slaComplianceRate}%`}
          icon={<TrendingUp size={24} />}
          color="#10b981"
          bg="rgba(16, 185, 129, 0.15)"
        />
        <StatCard
          label="Resolved Jobs"
          value={data.completedWorkOrders + data.closedWorkOrders}
          icon={<CheckCircle size={24} />}
          color="#3b82f6"
          bg="rgba(59, 130, 246, 0.15)"
        />
        <StatCard
          label="SLA Breached Jobs"
          value={data.slaBreachedWorkOrders}
          icon={<AlertTriangle size={24} />}
          color="#ef4444"
          bg="rgba(239, 68, 68, 0.15)"
        />
        <StatCard
          label="Total Parts Cost"
          value={`$${data.totalPartsCost.toFixed(2)}`}
          icon={<DollarSign size={24} />}
          color="#f59e0b"
          bg="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          label="Total Labor Hours"
          value={`${(data.totalLabourMinutes / 60).toFixed(1)} hrs`}
          icon={<Clock size={24} />}
          color="#8b5cf6"
          bg="rgba(139, 92, 246, 0.15)"
        />
      </div>

      {/* Leaderboards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Technician Labor Hours */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={18} color="var(--warning)" /> Technician Labor Hours Leaderboard
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aggregated logged time</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.technicianTimeStats.map((tech, i) => (
              <div
                key={tech.technicianId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: i === 0 ? 'var(--warning-bg)' : 'var(--bg-card)',
                      color: i === 0 ? 'var(--warning)' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                    }}
                  >
                    #{i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{tech.technicianName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tech.totalMinutes} total minutes</div>
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>
                  {tech.totalHours} hrs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Consumed Parts */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Wrench size={18} color="var(--primary)" /> Top Consumed Maintenance Parts
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By usage quantity</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topUsedParts.map((part) => (
              <div
                key={part.partId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{part.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {part.sku}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.875rem' }}>
                    {part.totalQuantity} units
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    ${part.totalCost.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
