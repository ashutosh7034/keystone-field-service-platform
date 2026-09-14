import React, { useState, useEffect } from 'react';
import { workOrdersApi, partsApi, authApi } from '../api/client';
import { WorkOrderDetail, CustomerWorkOrderDetail, WorkOrderStatus, Part, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SlaBadge } from '../components/SlaBadge';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
  ArrowLeft,
  Wrench,
  Clock,
  UserCheck,
  Building2,
  History,
  Plus,
  Play,
  Pause,
  CheckCircle,
  Lock,
  XCircle,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

interface WorkOrderDetailPageProps {
  workOrderId: number;
  onBack: () => void;
}

export const WorkOrderDetailPage: React.FC<WorkOrderDetailPageProps> = ({
  workOrderId,
  onBack,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<WorkOrderDetail | CustomerWorkOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<WorkOrderStatus | null>(null);
  const [transitionNote, setTransitionNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | ''>('');
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [partError, setPartError] = useState<string | null>(null);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [loggedMinutes, setLoggedMinutes] = useState<number>(60);
  const [timeNote, setTimeNote] = useState('');

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Technicians for assignment
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [assignedTechId, setAssignedTechId] = useState<number | ''>('');
  const [assignNote, setAssignNote] = useState('');

  const isCustomer = user?.role === 'ROLE_CUSTOMER';
  const isManager = user?.role === 'ROLE_MANAGER';
  const isDispatcher = user?.role === 'ROLE_DISPATCHER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN';

  const fullDetail = !isCustomer ? (data as WorkOrderDetail) : null;

  const loadDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await workOrdersApi.getById(workOrderId);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load work order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [workOrderId]);

  // Open Transition Modal
  const promptTransition = (status: WorkOrderStatus) => {
    setTargetStatus(status);
    setTransitionNote('');
    setCancellationReason('');
    setIsTransitionModalOpen(true);
  };

  const executeTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus) return;
    setIsSubmitting(true);
    try {
      await workOrdersApi.transitionStatus(workOrderId, {
        targetStatus,
        note: transitionNote || undefined,
        cancellationReason: cancellationReason || undefined,
      });
      setIsTransitionModalOpen(false);
      loadDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Transition rejected by server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Assign Modal
  const openAssignModal = async () => {
    try {
      const res = await authApi.getTechnicians();
      setTechnicians(res.data);
      setAssignedTechId(fullDetail?.assignedTechnicianId || '');
      setAssignNote('');
      setIsAssignModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch technicians', err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTechId) return;
    setIsSubmitting(true);
    try {
      await workOrdersApi.assign(workOrderId, {
        technicianId: Number(assignedTechId),
        note: assignNote || undefined,
      });
      setIsAssignModalOpen(false);
      loadDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Assignment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Log Part Modal
  const openPartModal = async () => {
    try {
      setPartError(null);
      const res = await partsApi.getActive();
      setAvailableParts(res.data);
      setSelectedPartId('');
      setPartQuantity(1);
      setIsPartModalOpen(true);
    } catch (err) {
      console.error('Failed to load active parts', err);
    }
  };

  const handleLogPartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQuantity <= 0) return;
    setIsSubmitting(true);
    setPartError(null);
    try {
      await workOrdersApi.logPart(workOrderId, {
        partId: Number(selectedPartId),
        quantity: partQuantity,
      });
      setIsPartModalOpen(false);
      loadDetails();
    } catch (err: any) {
      setPartError(err.response?.data?.message || 'Failed to log part.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Log Time
  const handleLogTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedMinutes <= 0) return;
    setIsSubmitting(true);
    try {
      await workOrdersApi.logTime(workOrderId, {
        minutes: loggedMinutes,
        note: timeNote || undefined,
      });
      setIsTimeModalOpen(false);
      setTimeNote('');
      setLoggedMinutes(60);
      loadDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log time.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload Photo
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', photoFile);
    if (photoCaption) {
      formData.append('caption', photoCaption);
    }
    try {
      await workOrdersApi.uploadAttachment(workOrderId, formData);
      setIsPhotoModalOpen(false);
      setPhotoFile(null);
      setPhotoCaption('');
      loadDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-body">
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <LoadingSkeleton rows={6} height="70px" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-body">
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
      </div>
    );
  }

  const status = data.status;
  const isTerminal = status === 'CLOSED' || status === 'CANCELLED';

  return (
    <div className="page-body">
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Back to List
        </button>

        {/* Dynamic State Machine Action Buttons */}
        {!isTerminal && (
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Assign / Reassign Button */}
            {(isDispatcher || isManager) && (
              <button className="btn btn-secondary btn-sm" onClick={openAssignModal}>
                <UserCheck size={14} /> {status === 'NEW' ? 'Assign Technician' : 'Reassign Tech'}
              </button>
            )}

            {/* Start Work */}
            {status === 'ASSIGNED' && (isTechnician || isManager) && (
              <button className="btn btn-primary btn-sm" onClick={() => promptTransition('IN_PROGRESS')}>
                <Play size={14} /> Start Work
              </button>
            )}

            {/* Put on Hold & Complete */}
            {status === 'IN_PROGRESS' && (isTechnician || isManager) && (
              <>
                <button className="btn btn-warning btn-sm" onClick={() => promptTransition('ON_HOLD')}>
                  <Pause size={14} /> Put On Hold
                </button>
                <button className="btn btn-success btn-sm" onClick={() => promptTransition('COMPLETED')}>
                  <CheckCircle size={14} /> Mark Completed
                </button>
              </>
            )}

            {/* Resume Work */}
            {status === 'ON_HOLD' && (isTechnician || isManager) && (
              <button className="btn btn-primary btn-sm" onClick={() => promptTransition('IN_PROGRESS')}>
                <Play size={14} /> Resume Work
              </button>
            )}

            {/* Manager Sign-off Close */}
            {status === 'COMPLETED' && isManager && (
              <button className="btn btn-primary btn-sm" onClick={() => promptTransition('CLOSED')}>
                <Lock size={14} /> Sign Off & Close Work Order
              </button>
            )}

            {/* Cancel Work Order */}
            {(isDispatcher || isManager || (isCustomer && status === 'NEW')) && (
              <button className="btn btn-outline btn-sm" onClick={() => promptTransition('CANCELLED')} style={{ color: 'var(--danger)' }}>
                <XCircle size={14} /> Cancel Job
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header Info Card */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                {data.workOrderCode}
              </span>
              <StatusBadge status={data.status} />
              <PriorityBadge priority={data.priority} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.title}</h2>
          </div>

          <div style={{ textAlign: 'right' }}>
            <SlaBadge status={data.slaStatus} dueDate={data.slaDueDate} showTimer />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Target SLA: {new Date(data.slaDueDate).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0.75rem 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          {data.description}
        </div>

        {/* Location & Ownership grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Building2 size={14} /> Facility Site
            </div>
            <div style={{ fontWeight: 700 }}>{data.siteName}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{data.siteAddress}, {data.siteCity}</div>
          </div>

          {fullDetail && (
            <>
              <div>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                  <Building2 size={14} /> Customer Organization
                </div>
                <div style={{ fontWeight: 700 }}>{fullDetail.customerName}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                  <Wrench size={14} /> Assigned Technician
                </div>
                <div style={{ fontWeight: 700, color: fullDetail.assignedTechnicianName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {fullDetail.assignedTechnicianName || 'Unassigned'}
                </div>
                {fullDetail.assignedTechnicianPhone && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{fullDetail.assignedTechnicianPhone}</div>
                )}
              </div>
            </>
          )}

          <div>
            <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
              <Clock size={14} /> Created At
            </div>
            <div style={{ fontWeight: 600 }}>{new Date(data.createdAt).toLocaleString()}</div>
          </div>
        </div>

        {/* Internal Operational Notes (Staff only) */}
        {fullDetail && fullDetail.internalNotes && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              🔒 Internal Operational Instructions
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{fullDetail.internalNotes}</div>
          </div>
        )}
      </div>

      {/* Main Detail Grid: Timeline & Execution Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: fullDetail ? '1.2fr 1fr' : '1fr', gap: '1.5rem' }}>
        {/* Left Column: Immutable Lifecycle Audit Timeline */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <History size={18} color="var(--primary)" /> Status & Audit Timeline
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Immutable Ledger</span>
          </div>

          <div className="timeline">
            {data.statusHistory && data.statusHistory.map((h, i) => (
              <div key={h.id || i} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <StatusBadge status={h.toStatus} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {h.changedByUserName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                  </div>
                  {h.note && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{h.note}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Staff Only): Parts Used, Time Logs, Attachments */}
        {fullDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Parts Used Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Wrench size={18} color="var(--warning)" /> Parts Logged ({fullDetail.partsUsed?.length || 0})
                </h3>
                {!isTerminal && (isTechnician || isManager) && (
                  <button className="btn btn-primary btn-sm" onClick={openPartModal}>
                    <Plus size={13} /> Log Part
                  </button>
                )}
              </div>

              {fullDetail.partsUsed?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.75rem 0' }}>
                  No parts recorded on this job yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {fullDetail.partsUsed.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.partName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SKU: {p.partSku} • Qty: {p.quantity} @ ${p.unitCostAtUsage.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.9rem' }}>
                        ${p.totalCost.toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>Total Parts Cost:</span>
                    <span style={{ color: 'var(--warning)' }}>${fullDetail.totalPartsCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Time Logs Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Clock size={18} color="var(--info)" /> Labor Time Logs
                </h3>
                {!isTerminal && (isTechnician || isManager) && (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsTimeModalOpen(true)}>
                    <Plus size={13} /> Log Time
                  </button>
                )}
              </div>

              {fullDetail.timeLogs?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.75rem 0' }}>
                  No labor time recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {fullDetail.timeLogs.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.technicianName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.note || 'General maintenance'}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--info)', fontSize: '0.85rem' }}>
                        {t.minutes} mins ({(t.minutes / 60).toFixed(1)} hrs)
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>Total Labor Duration:</span>
                    <span style={{ color: 'var(--info)' }}>
                      {fullDetail.totalLabourMinutes} mins ({(fullDetail.totalLabourMinutes / 60).toFixed(1)} hrs)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Job Photos / Attachments */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Camera size={18} color="var(--primary)" /> Job Photos & Attachments
                </h3>
                {!isTerminal && (isTechnician || isManager) && (
                  <button className="btn btn-outline btn-sm" onClick={() => setIsPhotoModalOpen(true)}>
                    <Plus size={13} /> Upload Photo
                  </button>
                )}
              </div>

              {fullDetail.attachments?.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.75rem 0' }}>
                  No job photos uploaded yet.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {fullDetail.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        textAlign: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <ImageIcon size={28} color="var(--primary)" style={{ marginBottom: '0.35rem' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {att.originalFileName}
                      </span>
                      {att.caption && (
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {att.caption}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transition Confirmation Modal */}
      <Modal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        title={`Confirm Transition: ${targetStatus}`}
      >
        <form onSubmit={executeTransition}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Are you sure you want to transition work order <strong>{data.workOrderCode}</strong> from{' '}
            <StatusBadge status={data.status} /> to{' '}
            {targetStatus && <StatusBadge status={targetStatus} />}?
          </p>

          <div className="form-group">
            <label className="form-label">Audit Transition Note (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Completed pressure testing, all clear"
              value={transitionNote}
              onChange={(e) => setTransitionNote(e.target.value)}
            />
          </div>

          {targetStatus === 'CANCELLED' && (
            <div className="form-group">
              <label className="form-label">Cancellation Reason *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. False alarm / Resolved internally"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTransitionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Confirm Transition'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Technician Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Field Technician"
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Technician *</label>
            <select
              className="form-control"
              value={assignedTechId}
              onChange={(e) => setAssignedTechId(Number(e.target.value))}
              required
            >
              <option value="">Select Technician...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assignment Instructions (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Meet with facility engineer David Miller on site"
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Part Modal (Transactional Pessimistic Lock) */}
      <Modal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        title="Log Part Consumption (Inventory)"
      >
        {partError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {partError}
          </div>
        )}

        <form onSubmit={handleLogPartSubmit}>
          <div className="form-group">
            <label className="form-label">Select Part from Inventory *</label>
            <select
              className="form-control"
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(Number(e.target.value))}
              required
            >
              <option value="">Select Part...</option>
              {availableParts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) - In Stock: {p.stockQuantity} - ${p.unitCost.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Consumed *</label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={partQuantity}
              onChange={(e) => setPartQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPartModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Logging...' : 'Log & Decrement Stock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Time Modal */}
      <Modal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        title="Log Technician Labor Time"
      >
        <form onSubmit={handleLogTimeSubmit}>
          <div className="form-group">
            <label className="form-label">Labor Duration (Minutes) *</label>
            <input
              type="number"
              className="form-control"
              min="1"
              step="15"
              value={loggedMinutes}
              onChange={(e) => setLoggedMinutes(Number(e.target.value))}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              = {(loggedMinutes / 60).toFixed(2)} Hours
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Work Summary / Note (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Diagnosed condenser motor and cleaned coils"
              value={timeNote}
              onChange={(e) => setTimeNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTimeModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Log Time'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Job Photo Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Upload Job Photo / Attachment"
      >
        <form onSubmit={handlePhotoUpload}>
          <div className="form-group">
            <label className="form-label">Select Photo File (JPEG, PNG, WEBP, PDF) *</label>
            <input
              type="file"
              className="form-control"
              accept="image/*,application/pdf"
              onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Caption / Description (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Before repair - burnt capacitor on unit 2"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPhotoModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !photoFile}>
              {isSubmitting ? 'Uploading...' : 'Upload Attachment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
