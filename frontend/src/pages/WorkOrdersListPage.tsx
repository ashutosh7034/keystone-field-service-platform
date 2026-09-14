import React, { useState, useEffect } from 'react';
import { workOrdersApi, customersApi, sitesApi, authApi } from '../api/client';
import { WorkOrderSummary, WorkOrderStatus, Priority, SlaStatus, Customer, Site, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye
} from 'lucide-react';

interface WorkOrdersListPageProps {
  onNavigateToWorkOrder: (id: number) => void;
}

export const WorkOrdersListPage: React.FC<WorkOrdersListPageProps> = ({ onNavigateToWorkOrder }) => {
  const [workOrders, setWorkOrders] = useState<WorkOrderSummary[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | ''>('');
  const [selectedSlaStatus, setSelectedSlaStatus] = useState<SlaStatus | ''>('');

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newCustomerId, setNewCustomerId] = useState<number | ''>('');
  const [newSiteId, setNewSiteId] = useState<number | ''>('');
  const [newTechnicianId, setNewTechnicianId] = useState<number | ''>('');
  const [newInternalNotes, setNewInternalNotes] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchWorkOrders = async () => {
    try {
      setIsLoading(true);
      const res = await workOrdersApi.search({
        query: searchQuery || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
        slaStatus: selectedSlaStatus || undefined,
        page: currentPage,
        size: 10,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      });
      setWorkOrders(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to load work orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [currentPage, selectedStatus, selectedPriority, selectedSlaStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
      fetchWorkOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCreateModal = async () => {
    try {
      const [custRes, techRes] = await Promise.all([
        customersApi.getActive(),
        authApi.getTechnicians(),
      ]);
      setCustomers(custRes.data);
      setTechnicians(techRes.data);
      setIsCreateModalOpen(true);
    } catch (err) {
      console.error('Failed to load customers/technicians', err);
    }
  };

  const handleCustomerChange = async (customerId: number) => {
    setNewCustomerId(customerId);
    setNewSiteId('');
    try {
      const res = await sitesApi.getForCustomer(customerId);
      setSites(res.data);
    } catch (err) {
      console.error('Failed to load sites for customer', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerId || !newSiteId) {
      setCreateError('Please select both a Customer and a Site.');
      return;
    }
    setCreateError(null);
    setIsSubmitting(true);
    try {
      const res = await workOrdersApi.create({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        customerId: Number(newCustomerId),
        siteId: Number(newSiteId),
        assignedTechnicianId: newTechnicianId ? Number(newTechnicianId) : undefined,
        internalNotes: newInternalNotes || undefined,
      });
      setIsCreateModalOpen(false);
      resetCreateForm();
      fetchWorkOrders();
      onNavigateToWorkOrder(res.data.id);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create work order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCreateForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewPriority('MEDIUM');
    setNewCustomerId('');
    setNewSiteId('');
    setNewTechnicianId('');
    setNewInternalNotes('');
    setCreateError(null);
  };

  const statusFilterTabs: Array<{ label: string; value: WorkOrderStatus | '' }> = [
    { label: 'All', value: '' },
    { label: 'New', value: 'NEW' },
    { label: 'Assigned', value: 'ASSIGNED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'On Hold', value: 'ON_HOLD' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Closed', value: 'CLOSED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Work Order Management</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Dispatch, track, and manage all facilities maintenance tickets
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> New Work Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem',
          overflowX: 'auto',
        }}
      >
        {statusFilterTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setSelectedStatus(tab.value);
              setCurrentPage(0);
            }}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: selectedStatus === tab.value ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedStatus === tab.value ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by WO Code, Title, Customer, or Site..."
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
          onChange={(e) => {
            setSelectedPriority(e.target.value as Priority | '');
            setCurrentPage(0);
          }}
        >
          <option value="">All Priorities</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          className="form-control"
          style={{ width: '160px' }}
          value={selectedSlaStatus}
          onChange={(e) => {
            setSelectedSlaStatus(e.target.value as SlaStatus | '');
            setCurrentPage(0);
          }}
        >
          <option value="">All SLA Statuses</option>
          <option value="ON_TRACK">On Track</option>
          <option value="AT_RISK">At Risk</option>
          <option value="BREACHED">Breached</option>
        </select>
      </div>

      {/* Table & Content */}
      {isLoading ? (
        <LoadingSkeleton rows={6} height="52px" />
      ) : workOrders.length === 0 ? (
        <EmptyState
          title="No work orders found"
          description="Try modifying your search filter criteria or create a new work order."
          actionText="Create Work Order"
          onAction={openCreateModal}
          icon={<ClipboardList size={48} color="var(--text-muted)" />}
        />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>WO Code</th>
                  <th>Title & Facility</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Technician</th>
                  <th>SLA Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workOrders.map((wo) => (
                  <tr
                    key={wo.id}
                    onClick={() => onNavigateToWorkOrder(wo.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {wo.workOrderCode}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{wo.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {wo.siteName} • <span style={{ color: 'var(--text-muted)' }}>{wo.customerName}</span>
                      </div>
                    </td>
                    <td><PriorityBadge priority={wo.priority} /></td>
                    <td><StatusBadge status={wo.status} /></td>
                    <td>
                      {wo.assignedTechnicianName ? (
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{wo.assignedTechnicianName}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <SlaBadge status={wo.slaStatus} dueDate={wo.slaDueDate} showTimer />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToWorkOrder(wo.id);
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              Showing {workOrders.length} of {totalElements} work orders
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontWeight: 600, padding: '0 0.5rem' }}>
                Page {currentPage + 1} of {Math.max(1, totalPages)}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Work Order"
      >
        {createError && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority Level *</label>
              <select
                className="form-control"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                required
              >
                <option value="EMERGENCY">EMERGENCY (4-Hour SLA)</option>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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
