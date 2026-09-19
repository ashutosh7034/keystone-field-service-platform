import React, { useState } from 'react';
import { Attachment } from '../../types';
import { workOrdersApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Camera, Plus, Image as ImageIcon, Download, FileText } from 'lucide-react';

interface WorkOrderAttachmentsSectionProps {
  attachments?: Attachment[];
  canUpload: boolean;
  onOpenPhotoModal: () => void;
}

export const WorkOrderAttachmentsSection: React.FC<WorkOrderAttachmentsSectionProps> = ({
  attachments = [],
  canUpload,
  onOpenPhotoModal,
}) => {
  const { error, info } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleDownload = async (att: Attachment) => {
    try {
      setDownloadingId(att.id);
      info(`Downloading ${att.originalFileName}...`);
      await workOrdersApi.downloadAttachment(att.id, att.originalFileName);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to download attachment.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <Camera size={18} color="var(--primary)" /> Job Photos & Attachments ({attachments.length})
        </h3>
        {canUpload && (
          <button className="btn btn-outline btn-sm" onClick={onOpenPhotoModal}>
            <Plus size={13} /> Upload Photo
          </button>
        )}
      </div>

      {attachments.length === 0 ? (
        <div
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            padding: '1.25rem 0',
            textAlign: 'center',
          }}
        >
          <Camera size={28} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
          <div>No job documentation or photos uploaded yet.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {attachments.map((att) => {
            const isPdf = att.fileType?.includes('pdf') || att.fileName?.endsWith('.pdf');
            const isDownloading = downloadingId === att.id;

            return (
              <div
                key={att.id}
                onClick={() => handleDownload(att)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  cursor: isDownloading ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isPdf ? (
                  <FileText size={32} color="var(--danger)" style={{ marginBottom: '0.4rem' }} />
                ) : (
                  <ImageIcon size={32} color="var(--primary)" style={{ marginBottom: '0.4rem' }} />
                )}

                <span
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                  title={att.originalFileName}
                >
                  {att.originalFileName}
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                  }}
                >
                  <Download size={11} /> {formatFileSize(att.fileSize)}
                </div>

                {att.caption && (
                  <span
                    style={{
                      fontSize: '0.675rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.35rem',
                      fontStyle: 'italic',
                    }}
                  >
                    "{att.caption}"
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
