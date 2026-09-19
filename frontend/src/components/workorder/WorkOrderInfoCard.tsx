import React from 'react';
import { WorkOrderDetail, CustomerWorkOrderDetail } from '../../types';
import { Building2, MapPin, Wrench, ShieldAlert, FileText } from 'lucide-react';

interface WorkOrderInfoCardProps {
  data: WorkOrderDetail | CustomerWorkOrderDetail;
  fullDetail: WorkOrderDetail | null;
}

export const WorkOrderInfoCard: React.FC<WorkOrderInfoCardProps> = ({ data, fullDetail }) => {
  const assignedTechName = fullDetail
    ? fullDetail.assignedTechnicianName
    : (data as CustomerWorkOrderDetail).assignedTechnicianName;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Description Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--primary)' }} /> Description
          </h3>
        </div>
        <div
          style={{
            fontSize: '0.925rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}
        >
          {data.description || 'No description provided.'}
        </div>

        {/* Internal Operational Instructions Callout */}
        {fullDetail && fullDetail.internalNotes && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div
              style={{
                fontSize: '0.725rem',
                fontWeight: 800,
                color: 'var(--warning)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldAlert size={14} /> Internal Operational Instructions
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {fullDetail.internalNotes}
            </div>
          </div>
        )}
      </div>

      {/* Work Order Information Card */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <h3 className="card-title" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} style={{ color: 'var(--primary)' }} /> Work Order Information
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Customer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer
            </span>
            <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {fullDetail ? fullDetail.customerName : 'Assigned Organization'}
            </span>
          </div>

          {/* Facility */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Facility
            </span>
            <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {data.siteName}
            </span>
          </div>

          {/* Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Location
            </span>
            <span style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              {data.siteAddress ? `${data.siteAddress}, ${data.siteCity || ''}` : 'Address not specified'}
            </span>
          </div>

          {/* Technician */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Technician
            </span>
            <span style={{ fontSize: '0.925rem', fontWeight: 700, color: assignedTechName ? 'var(--text-primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Wrench size={13} style={{ color: assignedTechName ? 'var(--warning)' : 'var(--text-muted)', flexShrink: 0 }} />
              {assignedTechName || 'Unassigned'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
