import React, { useState, useEffect } from 'react';
import { workOrdersApi } from '../api/client';
import { WorkOrderSummary, WorkOrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Wrench,
  Play,
  Pause,
  CheckCircle,
  ArrowRight,
  Search,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface TechnicianMobileViewProps {
  onNavigateToWorkOrder: (id: number) => void;
}

export const TechnicianMobileView: React.FC<TechnicianMobileViewProps> = ({ onNavigateToWorkOrder }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState<WorkOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'IN_PROGRESS' | 'ASSIGNED' | 'ON_HOLD' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMyJobs = async () => {
    try {
      setIsLoading(true);
      const statusParam = activeTab === 'ALL' ? undefined : (activeTab as WorkOrderStatus);
      const res = await workOrdersApi.getTechnicianJobs({
        status: statusParam,
        query: searchQuery || undefined,
        size: 50,
      });
      setJobs(res.data.content);
    } catch (err) {
      console.error('Failed to load technician jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(fetchMyJobs, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleQuickTransition = async (id: number, targetStatus: WorkOrderStatus) => {
    try {
      await workOrdersApi.transitionStatus(id, { targetStatus });
      toast.success(`Job updated to ${targetStatus.replace('_', ' ')}.`);
      fetchMyJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Transition rejected.');
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: '1000px' }}>
      {/* Technician Welcome Header */}
      <div
        className="dark-hero-banner"
        style={{
          backgroundColor: '#0F1B2D',
          border: '1px solid #1E293B',
          borderRadius: '6px',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FDE68A',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '0.35rem',
            }}
          >
            <Wrench size={14} color="#FDE68A" /> FIELD OPERATIONS VIEW
          </div>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 0.35rem 0',
              letterSpacing: '-0.01em',
            }}
          >
            Welcome back, {user?.fullName}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#CBD5E1', margin: 0 }}>
            You have {jobs.filter((j) => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED').length} active job(s) in queue
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        {[
          { id: 'ALL', label: 'All My Jobs' },
          { id: 'ASSIGNED', label: 'Assigned (New)' },
          { id: 'IN_PROGRESS', label: 'Active Working' },
          { id: 'ON_HOLD', label: 'On Hold' },
          { id: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === tab.id ? 'var(--primary-subtle)' : 'var(--bg-surface)',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              border: activeTab === tab.id ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Filter my jobs by code, location, or issue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '2.5rem' }}
        />
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="120px" />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs assigned in this category"
          description="Great job! You have no pending tasks in this filter view."
          icon={<CheckCircle size={48} color="var(--success)" />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="card"
              onClick={() => onNavigateToWorkOrder(job.id)}
              style={{
                cursor: 'pointer',
                borderLeft: job.priority === 'EMERGENCY' ? '4px solid var(--danger)' : '4px solid var(--primary)',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                    {job.workOrderCode}
                  </span>
                  <PriorityBadge priority={job.priority} />
                </div>
                <StatusBadge status={job.status} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {job.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                <Building2 size={14} color="var(--text-muted)" />
                <span>{job.siteName} ({job.siteCity}) • {job.customerName}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
                <SlaBadge status={job.slaStatus} dueDate={job.slaDueDate} showTimer />

                {/* Direct Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                  {job.status === 'ASSIGNED' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleQuickTransition(job.id, 'IN_PROGRESS')}
                    >
                      <Play size={13} /> Start Work
                    </button>
                  )}
                  {job.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleQuickTransition(job.id, 'ON_HOLD')}
                      >
                        <Pause size={13} /> Hold
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleQuickTransition(job.id, 'COMPLETED')}
                      >
                        <CheckCircle size={13} /> Complete
                      </button>
                    </>
                  )}
                  {job.status === 'ON_HOLD' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleQuickTransition(job.id, 'IN_PROGRESS')}
                    >
                      <Play size={13} /> Resume
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => onNavigateToWorkOrder(job.id)}>
                    Open Job <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
