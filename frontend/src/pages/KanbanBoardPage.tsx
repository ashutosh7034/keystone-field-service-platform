import React, { useState, useEffect, useRef } from 'react';
import { workOrdersApi, customersApi, sitesApi, authApi } from '../api/client';
import { WorkOrderSummary, WorkOrderStatus, Priority, Customer, Site, User } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  Search,
  Plus,
  RotateCcw,
  User as UserIcon,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  Lock,
  Eye,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface KanbanBoardPageProps {
  onNavigateToWorkOrder: (id: number) => void;
}

interface ColumnDef {
  status: WorkOrderStatus;
  title: string;
  dotColor: string;
}

export const KanbanBoardPage: React.FC<KanbanBoardPageProps> = ({ onNavigateToWorkOrder }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [workOrders, setWorkOrders] = useState<WorkOrderSummary[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | ''>('');
  const [selectedSiteId, setSelectedSiteId] = useState<number | ''>('');
  const [showTerminalColumns, setShowTerminalColumns] = useState<boolean>(false);

  // Drag and drop state
  const [draggedOrderId, setDraggedOrderId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<WorkOrderStatus | null>(null);

  // Active dropdown card ID
  const [activeMenuCardId, setActiveMenuCardId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Create Work Order Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newCustomerId, setNewCustomerId] = useState<number | ''>('');
  const [newSiteId, setNewSiteId] = useState<number | ''>('');
  const [newTechnicianId, setNewTechnicianId] = useState<number | ''>('');
  const [newInternalNotes, setNewInternalNotes] = useState('');
  const [modalSites, setModalSites] = useState<Site[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManager = user?.role === 'ROLE_MANAGER';
  const isDispatcher = user?.role === 'ROLE_DISPATCHER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN';
  const canCreate = isManager || isDispatcher;

  // Fetch filter reference options on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [techRes, siteRes, custRes] = await Promise.all([
          authApi.getTechnicians(),
          sitesApi.search({ size: 100 }),
          customersApi.getActive(),
        ]);
        setTechnicians(techRes.data);
        setSites(siteRes.data.content);
        setCustomers(custRes.data);
      } catch (err) {
        console.error('Failed to load board metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch work orders with filters
  const fetchBoardData = async () => {
    try {
      setIsLoading(true);
      const res = await workOrdersApi.search({
        query: searchQuery || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
        size: 150,
        sortBy: 'priority',
        sortDirection: 'desc',
      });

      let orders = res.data.content;

      // Filter by technician if selected
      if (selectedTechnicianId) {
        orders = orders.filter((o) => o.assignedTechnicianId === selectedTechnicianId);
      }
      // Filter by site if selected
      if (selectedSiteId) {
        orders = orders.filter((o) => o.siteId === selectedSiteId);
      }

      setWorkOrders(orders);
    } catch (err) {
      console.error('Failed to load kanban data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [selectedStatus, selectedPriority, selectedTechnicianId, selectedSiteId]);

  useEffect(() => {
    const timer = setTimeout(fetchBoardData, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuCardId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleQuickTransition = async (workOrderId: number, targetStatus: WorkOrderStatus) => {
    setActiveMenuCardId(null);
    try {
      await workOrdersApi.transitionStatus(workOrderId, { targetStatus });
      toast.success(`Moved to ${targetStatus.replace('_', ' ')}.`);
      fetchBoardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Status transition was not permitted.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedOrderId(id);
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: WorkOrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (status: WorkOrderStatus) => {
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: WorkOrderStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const idStr = e.dataTransfer.getData('text/plain');
    const orderId = Number(idStr);
    if (!orderId || isNaN(orderId)) return;

    const currentOrder = workOrders.find((w) => w.id === orderId);
    if (currentOrder && currentOrder.status !== targetStatus) {
      handleQuickTransition(orderId, targetStatus);
    }
    setDraggedOrderId(null);
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedStatus ||
    selectedPriority ||
    selectedTechnicianId ||
    selectedSiteId ||
    showTerminalColumns
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedTechnicianId('');
    setSelectedSiteId('');
    setShowTerminalColumns(false);
  };

  // Create Work Order modal handlers
  const openCreateModal = () => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('MEDIUM');
    setNewCustomerId('');
    setNewSiteId('');
    setNewTechnicianId('');
    setNewInternalNotes('');
    setModalSites([]);
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleCustomerChange = async (customerId: number) => {
    setNewCustomerId(customerId);
    setNewSiteId('');
    try {
      const res = await sitesApi.getForCustomer(customerId);
      setModalSites(res.data);
    } catch (err) {
      console.error('Failed to load customer sites', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newSiteId) {
      setCreateError('Please select both a customer and facility site.');
      return;
    }
    setCreateError(null);
    setIsSubmitting(true);
    try {
      await workOrdersApi.create({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        customerId: Number(newCustomerId),
        siteId: Number(newSiteId),
        assignedTechnicianId: newTechnicianId ? Number(newTechnicianId) : undefined,
        internalNotes: newInternalNotes || undefined,
      });
      toast.success('Work order created successfully.');
      setIsCreateModalOpen(false);
      fetchBoardData();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create work order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Column definitions with restrained semantic dots
  const columns: ColumnDef[] = [
    { status: 'NEW', title: 'New Requests', dotColor: '#94A3B8' },
    { status: 'ASSIGNED', title: 'Assigned', dotColor: '#2563EB' },
    { status: 'IN_PROGRESS', title: 'In Progress', dotColor: '#D97706' },
    { status: 'ON_HOLD', title: 'On Hold', dotColor: '#64748B' },
    { status: 'COMPLETED', title: 'Completed', dotColor: '#16A34A' },
    ...(showTerminalColumns
      ? [
          { status: 'CLOSED' as WorkOrderStatus, title: 'Closed', dotColor: '#475569' },
          { status: 'CANCELLED' as WorkOrderStatus, title: 'Cancelled', dotColor: '#DC2626' },
        ]
      : []),
  ];

  // Helper for priority display
  const renderPriorityBadge = (priority: Priority) => {
    const config: Record<Priority, { label: string; bg: string; color: string; border: string }> = {
      EMERGENCY: { label: 'CRITICAL', bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' },
      HIGH: { label: 'HIGH', bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
      MEDIUM: { label: 'MEDIUM', bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
      LOW: { label: 'LOW', bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0' },
    };
    const c = config[priority] || config.MEDIUM;
    return (
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          padding: '0.1rem 0.35rem',
          borderRadius: '3px',
          backgroundColor: c.bg,
          color: c.color,
          border: `1px solid ${c.border}`,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {c.label}
      </span>
    );
  };

  // Helper for SLA display
  const renderSlaIndicator = (wo: WorkOrderSummary) => {
    const isOverdue = wo.slaStatus === 'BREACHED';
    const isAtRisk = wo.slaStatus === 'AT_RISK';
    const dotColor = isOverdue ? '#DC2626' : isAtRisk ? '#D97706' : '#16A34A';
    const label = isOverdue ? 'Breached' : isAtRisk ? 'At Risk' : 'On Track';

    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
        <span style={{ color: '#4B5563', fontWeight: 500 }}>
          SLA {label}
        </span>
      </div>
    );
  };

  return (
    <div className="page-body">
      {/* 1. Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
            Work Order Board
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#667085', margin: '0.15rem 0 0 0' }}>
            Track and manage active field-service work.
          </p>
        </div>

        {canCreate && (
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            <Plus size={15} /> New Work Order
          </button>
        )}
      </div>

      {/* 2. Board Toolbar & Filters */}
      <div className="board-toolbar">
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search work orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
          <Search
            size={14}
            color="#98A2B3"
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        {/* Status Filter */}
        <select
          className="form-control"
          style={{ width: '135px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as WorkOrderStatus | '')}
        >
          <option value="">Status: All</option>
          <option value="NEW">New Requests</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {/* Priority Filter */}
        <select
          className="form-control"
          style={{ width: '130px' }}
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as Priority | '')}
        >
          <option value="">Priority: All</option>
          <option value="EMERGENCY">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Technician Filter */}
        <select
          className="form-control"
          style={{ width: '150px' }}
          value={selectedTechnicianId}
          onChange={(e) => setSelectedTechnicianId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Technician: All</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.fullName}
            </option>
          ))}
        </select>

        {/* Site Filter */}
        <select
          className="form-control"
          style={{ width: '160px' }}
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Site: All</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Include Closed & Cancelled Checkbox */}
        <label className="board-toolbar-checkbox">
          <input
            type="checkbox"
            checked={showTerminalColumns}
            onChange={(e) => setShowTerminalColumns(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Include closed/cancelled</span>
        </label>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={clearFilters}
            style={{ height: '36px', padding: '0 0.65rem' }}
            title="Reset all filters"
          >
            <RotateCcw size={13} /> Clear
          </button>
        )}
      </div>

      {/* 3. Kanban Board Workspace */}
      {isLoading ? (
        <LoadingSkeleton rows={4} height="240px" />
      ) : (
        <div className="kanban-board-wrapper">
          <div className="kanban-board">
            {columns.map((col) => {
              const columnOrders = workOrders.filter((wo) => wo.status === col.status);
              const isOver = dragOverColumn === col.status;

              return (
                <div
                  key={col.status}
                  className={`kanban-column ${isOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDragLeave={() => handleDragLeave(col.status)}
                  onDrop={(e) => handleDrop(e, col.status)}
                >
                  {/* Column Header */}
                  <div className="kanban-column-header">
                    <div className="kanban-column-header-title">
                      <span
                        className="kanban-status-dot"
                        style={{ backgroundColor: col.dotColor }}
                      />
                      <span>{col.title.toUpperCase()}</span>
                    </div>
                    <span className="kanban-column-count">{columnOrders.length}</span>
                  </div>

                  {/* Cards Container */}
                  <div className="kanban-cards-container">
                    {columnOrders.length === 0 ? (
                      <div
                        style={{
                          padding: '2rem 1rem',
                          textAlign: 'center',
                          color: '#98A2B3',
                          fontSize: '0.8rem',
                        }}
                      >
                        No work orders
                      </div>
                    ) : (
                      columnOrders.map((wo) => {
                        const isDragging = draggedOrderId === wo.id;
                        const isMenuOpen = activeMenuCardId === wo.id;

                        return (
                          <div
                            key={wo.id}
                            className={`kanban-card ${isDragging ? 'is-dragging' : ''}`}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, wo.id)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onNavigateToWorkOrder(wo.id)}
                          >
                            {/* Top: Code & Priority */}
                            <div className="kanban-card-top">
                              <span
                                className="kanban-card-code"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToWorkOrder(wo.id);
                                }}
                              >
                                {wo.workOrderCode}
                              </span>
                              {renderPriorityBadge(wo.priority)}
                            </div>

                            {/* Title (High contrast readable text) */}
                            <div className="kanban-card-title">
                              {wo.title}
                            </div>

                            {/* Customer & Site */}
                            <div className="kanban-card-site">
                              <span style={{ fontWeight: 500, color: '#4B5563' }}>{wo.siteName}</span>
                              {wo.customerName && (
                                <span style={{ color: '#98A2B3' }}> &bull; {wo.customerName}</span>
                              )}
                            </div>

                            {/* Technician */}
                            <div className="kanban-card-tech">
                              <UserIcon size={12} style={{ color: '#98A2B3', flexShrink: 0 }} />
                              <span style={{ color: wo.assignedTechnicianName ? '#1F2937' : '#98A2B3' }}>
                                {wo.assignedTechnicianName || 'Unassigned'}
                              </span>
                            </div>

                            {/* Footer: SLA & Context Actions */}
                            <div className="kanban-card-footer">
                              {renderSlaIndicator(wo)}

                              {/* Single Restrained Context Menu Button */}
                              <div
                                style={{ position: 'relative' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  className="kanban-card-menu-btn"
                                  title="Actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuCardId(isMenuOpen ? null : wo.id);
                                  }}
                                >
                                  <MoreHorizontal size={14} />
                                </button>

                                {/* Dropdown Menu */}
                                {isMenuOpen && (
                                  <div
                                    ref={menuRef}
                                    style={{
                                      position: 'absolute',
                                      right: 0,
                                      bottom: '100%',
                                      marginBottom: '4px',
                                      backgroundColor: '#FFFFFF',
                                      border: '1px solid #D9DEE5',
                                      borderRadius: '5px',
                                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                                      zIndex: 100,
                                      minWidth: '150px',
                                      padding: '0.3rem 0',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => onNavigateToWorkOrder(wo.id)}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        width: '100%',
                                        padding: '0.4rem 0.75rem',
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: '0.78rem',
                                        color: '#1F2937',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <Eye size={13} color="#64748B" /> View Details
                                    </button>

                                    {/* Action items based on state and role */}
                                    {wo.status === 'ASSIGNED' && (isTechnician || isManager) && (
                                      <button
                                        type="button"
                                        onClick={() => handleQuickTransition(wo.id, 'IN_PROGRESS')}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          width: '100%',
                                          padding: '0.4rem 0.75rem',
                                          border: 'none',
                                          background: 'transparent',
                                          fontSize: '0.78rem',
                                          color: '#1F2937',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <Play size={13} color="#2563EB" /> Start Work
                                      </button>
                                    )}

                                    {wo.status === 'IN_PROGRESS' && (isTechnician || isManager) && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickTransition(wo.id, 'ON_HOLD')}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            width: '100%',
                                            padding: '0.4rem 0.75rem',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '0.78rem',
                                            color: '#1F2937',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Pause size={13} color="#D97706" /> Put On Hold
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickTransition(wo.id, 'COMPLETED')}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            width: '100%',
                                            padding: '0.4rem 0.75rem',
                                            border: 'none',
                                            background: 'transparent',
                                            fontSize: '0.78rem',
                                            color: '#1F2937',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <CheckCircle size={13} color="#16A34A" /> Complete
                                        </button>
                                      </>
                                    )}

                                    {wo.status === 'ON_HOLD' && (isTechnician || isManager) && (
                                      <button
                                        type="button"
                                        onClick={() => handleQuickTransition(wo.id, 'IN_PROGRESS')}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          width: '100%',
                                          padding: '0.4rem 0.75rem',
                                          border: 'none',
                                          background: 'transparent',
                                          fontSize: '0.78rem',
                                          color: '#1F2937',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <Play size={13} color="#2563EB" /> Resume Work
                                      </button>
                                    )}

                                    {wo.status === 'COMPLETED' && isManager && (
                                      <button
                                        type="button"
                                        onClick={() => handleQuickTransition(wo.id, 'CLOSED')}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          width: '100%',
                                          padding: '0.4rem 0.75rem',
                                          border: 'none',
                                          background: 'transparent',
                                          fontSize: '0.78rem',
                                          color: '#1F2937',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <Lock size={13} color="#64748B" /> Sign-off & Close
                                      </button>
                                    )}

                                    {(wo.status === 'NEW' || wo.status === 'ASSIGNED') && (isManager || isDispatcher) && (
                                      <button
                                        type="button"
                                        onClick={() => handleQuickTransition(wo.id, 'CANCELLED')}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          width: '100%',
                                          padding: '0.4rem 0.75rem',
                                          border: 'none',
                                          background: 'transparent',
                                          fontSize: '0.78rem',
                                          color: '#DC2626',
                                          textAlign: 'left',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <XCircle size={13} color="#DC2626" /> Cancel Job
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Create Work Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Work Order"
      >
        {createError && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '4px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}
          >
            {createError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Emergency Chiller Compressor Replacement"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              placeholder="Detailed description of the issue and maintenance requirements..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Customer Organization *</label>
              <select
                className="form-control"
                value={newCustomerId}
                onChange={(e) => handleCustomerChange(Number(e.target.value))}
                required
              >
                <option value="">Select Customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Facility Site *</label>
              <select
                className="form-control"
                value={newSiteId}
                onChange={(e) => setNewSiteId(Number(e.target.value))}
                disabled={!newCustomerId}
                required
              >
                <option value="">Select Site...</option>
                {modalSites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Priority Level *</label>
              <select
                className="form-control"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                required
              >
                <option value="EMERGENCY">CRITICAL (4-Hour SLA)</option>
                <option value="HIGH">HIGH (12-Hour SLA)</option>
                <option value="MEDIUM">MEDIUM (24-Hour SLA)</option>
                <option value="LOW">LOW (48-Hour SLA)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Technician (Optional)</label>
              <select
                className="form-control"
                value={newTechnicianId}
                onChange={(e) => setNewTechnicianId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Leave Unassigned (NEW)</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Internal Operations Notes (Hidden from customer)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Safety gear required, roof access code: 4421"
              value={newInternalNotes}
              onChange={(e) => setNewInternalNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
