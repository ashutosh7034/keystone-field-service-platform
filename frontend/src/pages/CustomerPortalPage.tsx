import React, { useState, useEffect } from 'react';
import { workOrdersApi, sitesApi } from '../api/client';
import { WorkOrderSummary, Site, Priority, WorkOrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Plus, Search, Building2, MapPin, ClipboardList, Eye, Wrench } from 'lucide-react';

interface CustomerPortalPageProps {
  onNavigateToWorkOrder: (id: number) => void;
}

export const CustomerPortalPage: React.FC<CustomerPortalPageProps> = ({ onNavigateToWorkOrder }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState<WorkOrderSummary[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | ''>('');

  // Create Request Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqPriority, setReqPriority] = useState<Priority>('MEDIUM');
  const [reqSiteId, setReqSiteId] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCustomerData = async () => {
    if (!user?.customerId) return;
    try {
      setIsLoading(true);
      const [reqRes, sitesRes] = await Promise.all([
        workOrdersApi.getCustomerRequests({
          query: searchQuery || undefined,
          status: selectedStatus || undefined,
          size: 50,
        }),
        sitesApi.getForCustomer(user.customerId),
      ]);
      setRequests(reqRes.data.content);
      setSites(sitesRes.data);
    } catch (err) {
      console.error('Failed to load customer requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(fetchCustomerData, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqSiteId) {
      setModalError('Please select a facility site.');
      return;
    }
    setModalError(null);
    setIsSubmitting(true);
    try {
      const res = await workOrdersApi.createCustomerRequest({
        title: reqTitle,
        description: reqDescription,
        priority: reqPriority,
        siteId: Number(reqSiteId),
      });
      toast.success(`Service request ${res.data.workOrderCode} submitted successfully!`);
      setIsModalOpen(false);
      setReqTitle('');
      setReqDescription('');
      setReqPriority('MEDIUM');
      setReqSiteId('');
      fetchCustomerData();
      onNavigateToWorkOrder(res.data.id);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to submit service request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      {/* Customer Header Banner */}
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
              color: '#93C5FD',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '0.35rem',
            }}
          >
            <Building2 size={14} color="#93C5FD" /> CLIENT SERVICE PORTAL
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
            {user?.fullName}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#CBD5E1', margin: 0 }}>
            Raise, track, and monitor facilities maintenance across your organization's sites
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Raise Service Request
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search my requests by ticket code or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search
            size={16}
            color="#667085"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        <select
          className="form-control"
          style={{ width: '200px' }}
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as WorkOrderStatus | '')}
        >
          <option value="">All Statuses</option>
          <option value="NEW">New Request</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Requests Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} height="52px" />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No service requests found"
          description="You currently have no active or matching maintenance requests."
          icon={<ClipboardList size={48} color="#667085" />}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Ticket Code</th>
                <th>Subject & Issue</th>
                <th>Facility Site</th>
                <th>Assigned Tech</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th>Target SLA</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => onNavigateToWorkOrder(req.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {req.workOrderCode}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>{req.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#475467', marginTop: '0.15rem' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: '#1F2937' }}>
                      <MapPin size={13} color="#475467" />
                      {req.siteName}
                    </div>
                  </td>
                  <td>
                    {req.assignedTechnicianName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#1F2937' }}>
                        <Wrench size={13} color="#D97706" />
                        <span>{req.assignedTechnicianName}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#475467', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        Pending Dispatch
                      </span>
                    )}
                  </td>
                  <td><PriorityBadge priority={req.priority} /></td>
                  <td><StatusBadge status={req.status} /></td>
                  <td><SlaBadge status={req.slaStatus} dueDate={req.slaDueDate} showTimer /></td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToWorkOrder(req.id);
                      }}
                    >
                      <Eye size={13} /> View Progress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Raise Service Request Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Raise Facilities Maintenance Request"
      >
        {modalError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateRequest}>
          <div className="form-group">
            <label className="form-label">Select Facility Location *</label>
            <select
              className="form-control"
              value={reqSiteId}
              onChange={(e) => setReqSiteId(Number(e.target.value))}
              required
            >
              <option value="">Select your site...</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.address}, {s.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Title / Subject *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 3rd Floor HVAC unit blowing warm air"
              value={reqTitle}
              onChange={(e) => setReqTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-control"
              placeholder="Please describe the maintenance problem, exact room/area, and any symptoms..."
              value={reqDescription}
              onChange={(e) => setReqDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Urgency / Priority *</label>
            <select
              className="form-control"
              value={reqPriority}
              onChange={(e) => setReqPriority(e.target.value as Priority)}
              required
            >
              <option value="LOW">LOW - Routine non-disruptive maintenance (48h)</option>
              <option value="MEDIUM">MEDIUM - Standard maintenance request (24h)</option>
              <option value="HIGH">HIGH - Urgent disruption to office operations (12h)</option>
              <option value="EMERGENCY">EMERGENCY - Critical flood, power outage, or safety hazard (4h)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Service Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
