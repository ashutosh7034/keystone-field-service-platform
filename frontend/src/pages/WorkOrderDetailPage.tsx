import React, { useState, useEffect, useCallback } from 'react';
import { workOrdersApi, partsApi, authApi } from '../../src/api/client';
import {
  WorkOrderDetail,
  CustomerWorkOrderDetail,
  WorkOrderStatus,
  Part,
  User,
} from '../../src/types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { WorkOrderHeader } from '../components/workorder/WorkOrderHeader';
import { WorkOrderInfoCard } from '../components/workorder/WorkOrderInfoCard';
import { WorkOrderSideCards } from '../components/workorder/WorkOrderSideCards';
import { WorkOrderAuditTimeline } from '../components/workorder/WorkOrderAuditTimeline';
import { WorkOrderPartsSection } from '../components/workorder/WorkOrderPartsSection';
import { WorkOrderTimeLogsSection } from '../components/workorder/WorkOrderTimeLogsSection';
import { WorkOrderAttachmentsSection } from '../components/workorder/WorkOrderAttachmentsSection';
import {
  TransitionModal,
  AssignModal,
  LogPartModal,
  LogTimeModal,
  UploadPhotoModal,
} from '../components/workorder/WorkOrderActionModals';
import { ArrowLeft } from 'lucide-react';

interface WorkOrderDetailPageProps {
  workOrderId: number;
  onBack: () => void;
}

export const WorkOrderDetailPage: React.FC<WorkOrderDetailPageProps> = ({
  workOrderId,
  onBack,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [data, setData] = useState<WorkOrderDetail | CustomerWorkOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<WorkOrderStatus | null>(null);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [availableParts, setAvailableParts] = useState<Part[]>([]);

  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCustomer = user?.role === 'ROLE_CUSTOMER';
  const isManager = user?.role === 'ROLE_MANAGER';
  const isDispatcher = user?.role === 'ROLE_DISPATCHER';
  const isTechnician = user?.role === 'ROLE_TECHNICIAN';

  const fullDetail = !isCustomer ? (data as WorkOrderDetail) : null;
  const isTerminal = data ? data.status === 'CLOSED' || data.status === 'CANCELLED' : false;

  const loadDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const res = await workOrdersApi.getById(workOrderId);
      setData(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load work order details.';
      setFetchError(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId, error]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // Open Transition Modal
  const handlePromptTransition = (status: WorkOrderStatus) => {
    setTargetStatus(status);
    setIsTransitionModalOpen(true);
  };

  const handleExecuteTransition = async (note: string, cancellationReason: string) => {
    if (!targetStatus) return;
    setIsSubmitting(true);
    try {
      await workOrdersApi.transitionStatus(workOrderId, {
        targetStatus,
        note: note || undefined,
        cancellationReason: cancellationReason || undefined,
      });
      success(`Work order status updated to ${targetStatus}`);
      setIsTransitionModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      error(err.response?.data?.message || 'Status transition rejected by server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Assign Modal
  const handleOpenAssignModal = async () => {
    try {
      const res = await authApi.getTechnicians();
      setTechnicians(res.data);
      setIsAssignModalOpen(true);
    } catch (err) {
      error('Failed to load technician roster.');
    }
  };

  const handleAssignSubmit = async (techId: number, note: string) => {
    setIsSubmitting(true);
    try {
      await workOrdersApi.assign(workOrderId, {
        technicianId: techId,
        note: note || undefined,
      });
      success('Technician assigned successfully.');
      setIsAssignModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      error(err.response?.data?.message || 'Technician assignment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Log Part Modal
  const handleOpenPartModal = async () => {
    try {
      const res = await partsApi.getActive();
      setAvailableParts(res.data);
      setIsPartModalOpen(true);
    } catch (err) {
      error('Failed to load parts catalog.');
    }
  };

  const handleLogPartSubmit = async (partId: number, quantity: number) => {
    setIsSubmitting(true);
    try {
      await workOrdersApi.logPart(workOrderId, { partId, quantity });
      success('Part consumption logged and deducted from warehouse stock.');
      setIsPartModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to record part usage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Log Time Modal
  const handleLogTimeSubmit = async (minutes: number, note: string) => {
    setIsSubmitting(true);
    try {
      await workOrdersApi.logTime(workOrderId, {
        minutes,
        note: note || undefined,
      });
      success(`Logged ${minutes} minutes of field labor.`);
      setIsTimeModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to log labor hours.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upload Photo
  const handlePhotoUploadSubmit = async (file: File, caption: string) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }
    try {
      await workOrdersApi.uploadAttachment(workOrderId, formData);
      success('Job attachment uploaded successfully.');
      setIsPhotoModalOpen(false);
      await loadDetails();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload photo.');
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

  if (fetchError || !data) {
    return (
      <div className="page-body">
        <button className="btn btn-secondary btn-sm" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Work Order Unavailable
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {fetchError || 'Unable to display the requested work order.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Work Order Header with Metadata & Action Buttons */}
      <WorkOrderHeader
        data={data}
        fullDetail={fullDetail}
        isCustomer={isCustomer}
        isManager={isManager}
        isDispatcher={isDispatcher}
        isTechnician={isTechnician}
        onBack={onBack}
        onOpenAssignModal={handleOpenAssignModal}
        onPromptTransition={handlePromptTransition}
      />

      {/* 2-Column Split: Left (Description, Info, Audit History) & Right (SLA, Assignment, Schedule) */}
      <div className="wo-detail-grid">
        {/* Left Column (Primary Information) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <WorkOrderInfoCard data={data} fullDetail={fullDetail} />
          <WorkOrderAuditTimeline statusHistory={data.statusHistory} />
        </div>

        {/* Right Column (Sidebar Summary Cards) */}
        <div>
          <WorkOrderSideCards
            data={data}
            fullDetail={fullDetail}
            canReassign={!isTerminal && (isDispatcher || isManager)}
            onOpenAssignModal={handleOpenAssignModal}
          />
        </div>
      </div>

      {/* Bottom Full-Width Section: Parts Consumed, Labor Hours, Attachments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        {fullDetail && (
          <>
            {/* Parts Consumed */}
            <WorkOrderPartsSection
              partsUsed={fullDetail.partsUsed}
              totalPartsCost={fullDetail.totalPartsCost}
              canLogParts={!isTerminal && (isTechnician || isManager)}
              onOpenPartModal={handleOpenPartModal}
            />

            {/* Labor Hours */}
            <WorkOrderTimeLogsSection
              timeLogs={fullDetail.timeLogs}
              totalLabourMinutes={fullDetail.totalLabourMinutes}
              canLogTime={!isTerminal && (isTechnician || isManager)}
              onOpenTimeModal={() => setIsTimeModalOpen(true)}
            />
          </>
        )}

        {/* Attachments Section (Visible to both staff and customer) */}
        <WorkOrderAttachmentsSection
          attachments={fullDetail ? fullDetail.attachments : (data as CustomerWorkOrderDetail).attachments}
          canUpload={!isTerminal && (isTechnician || isManager)}
          onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
        />
      </div>

      {/* Action Modals */}
      <TransitionModal
        isOpen={isTransitionModalOpen}
        targetStatus={targetStatus}
        onClose={() => setIsTransitionModalOpen(false)}
        onSubmit={handleExecuteTransition}
        isSubmitting={isSubmitting}
      />

      <AssignModal
        isOpen={isAssignModalOpen}
        technicians={technicians}
        currentTechId={fullDetail?.assignedTechnicianId}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        isSubmitting={isSubmitting}
      />

      <LogPartModal
        isOpen={isPartModalOpen}
        availableParts={availableParts}
        onClose={() => setIsPartModalOpen(false)}
        onSubmit={handleLogPartSubmit}
        isSubmitting={isSubmitting}
      />

      <LogTimeModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        onSubmit={handleLogTimeSubmit}
        isSubmitting={isSubmitting}
      />

      <UploadPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSubmit={handlePhotoUploadSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
