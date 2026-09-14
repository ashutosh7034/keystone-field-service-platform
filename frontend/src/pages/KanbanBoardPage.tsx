import React, { useState, useEffect } from 'react';
import { workOrdersApi } from '../api/client';
import { WorkOrderSummary, WorkOrderStatus, Priority } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Search, Play, Pause, CheckCircle, Lock, Eye, Building2, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface KanbanBoardPageProps {
  onNavigateToWorkOrder: (id: number) => void;
}

export const KanbanBoardPage: React.FC<KanbanBoardPageProps> = ({ onNavigateToWorkOrder }) => {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [showTerminalColumns, setShowTerminalColumns] = useState<boolean>(true);

  const isManager = user?.role === 'ROLE_MANAGER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN';

  const fetchBoardData = async () => {
    try {
      setIsLoading(true);
      const res = await workOrdersApi.search({
        query: searchQuery || undefined,
        priority: selectedPriority || undefined,
        size: 100, // Load active tickets for board
        sortBy: 'priority',
        sortDirection: 'desc',
      });
      setWorkOrders(res.data.content);
    } catch (err) {
      console.error('Failed to load kanban data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [selectedPriority]);

  useEffect(() => {
    const timer = setTimeout(fetchBoardData, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleQuickTransition = async (workOrderId: number, targetStatus: WorkOrderStatus) => {
    try {
      await workOrdersApi.transitionStatus(workOrderId, { targetStatus });
      fetchBoardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transition rejected by server.');
    }
  };

  const columns: Array<{ status: WorkOrderStatus; title: string; color: string }> = [
    { status: 'NEW', title: 'New Requests', color: '#94a3b8' },
    { status: 'ASSIGNED', title: 'Assigned', color: '#3b82f6' },
    { status: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b' },
    { status: 'ON_HOLD', title: 'On Hold', color: '#a855f7' },
    { status: 'COMPLETED', title: 'Completed', color: '#10b981' },
    ...(showTerminalColumns
      ? [
          { status: 'CLOSED' as WorkOrderStatus, title: 'Closed (Signed Off)', color: '#64748b' },
          { status: 'CANCELLED' as WorkOrderStatus, title: 'Cancelled', color: '#ef4444' },
        ]
      : []),
  ];

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Work Order Kanban Board</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Visual pipeline of field service operations across all facilities
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showTerminalColumns}
              onChange={(e) => setShowTerminalColumns(e.target.checked)}
            />
            Show Closed & Cancelled
          </label>
        </div>
      </div>

      {/* Search & Priority Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search board by code, title, customer..."
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

        <select
          className="form-control"
          style={{ width: '160px' }}
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as Priority | '')}
        >
          <option value="">All Priorities</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Kanban Columns */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="200px" />
      ) : (
        <div className="kanban-board">
          {columns.map((col) => {
            const columnOrders = workOrders.filter((wo) => wo.status === col.status);
            return (
              <div key={col.status} className="kanban-column">
                <div
                  className="kanban-column-header"
                  style={{ borderTop: `3px solid ${col.color}` }}
                >
                  <span>{col.title}</span>
                  <span
                    style={{
                      background: 'var(--bg-surface)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {columnOrders.length}
                  </span>
                </div>

                <div className="kanban-cards-container">
                  {columnOrders.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No work orders
                    </div>
                  ) : (
                    columnOrders.map((wo) => (
                      <div
                        key={wo.id}
                        className="kanban-card"
                        onClick={() => onNavigateToWorkOrder(wo.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {wo.workOrderCode}
                          </span>
                          <PriorityBadge priority={wo.priority} />
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.4rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                          {wo.title}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem' }}>
                          <Building2 size={13} color="var(--text-muted)" />
                          <span>{wo.siteName}</span>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
                          <Wrench size={13} color="var(--text-muted)" />
                          <span>{wo.assignedTechnicianName || 'Unassigned'}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                          <SlaBadge status={wo.slaStatus} dueDate={wo.slaDueDate} />

                          {/* Quick Lifecycle Action Triggers */}
                          <div style={{ display: 'flex', gap: '0.3rem' }} onClick={(e) => e.stopPropagation()}>
                            {wo.status === 'ASSIGNED' && (isTechnician || isManager) && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                                title="Start Work"
                                onClick={() => handleQuickTransition(wo.id, 'IN_PROGRESS')}
                              >
                                <Play size={11} />
                              </button>
                            )}
                            {wo.status === 'IN_PROGRESS' && (isTechnician || isManager) && (
                              <>
                                <button
                                  className="btn btn-warning btn-sm"
                                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                                  title="Hold"
                                  onClick={() => handleQuickTransition(wo.id, 'ON_HOLD')}
                                >
                                  <Pause size={11} />
                                </button>
                                <button
                                  className="btn btn-success btn-sm"
                                  style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                                  title="Complete"
                                  onClick={() => handleQuickTransition(wo.id, 'COMPLETED')}
                                >
                                  <CheckCircle size={11} />
                                </button>
                              </>
                            )}
                            {wo.status === 'ON_HOLD' && (isTechnician || isManager) && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                                title="Resume"
                                onClick={() => handleQuickTransition(wo.id, 'IN_PROGRESS')}
                              >
                                <Play size={11} />
                              </button>
                            )}
                            {wo.status === 'COMPLETED' && isManager && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                                title="Sign-off & Close"
                                onClick={() => handleQuickTransition(wo.id, 'CLOSED')}
                              >
                                <Lock size={11} />
                              </button>
                            )}
                            <button
                              className="btn btn-icon btn-sm"
                              style={{ width: '26px', height: '26px' }}
                              title="View Details"
                              onClick={() => onNavigateToWorkOrder(wo.id)}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
