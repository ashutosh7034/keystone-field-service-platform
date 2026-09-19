import React, { useState } from 'react';
import { Modal } from '../Modal';
import { WorkOrderStatus, Part, User } from '../../types';

interface TransitionModalProps {
  isOpen: boolean;
  targetStatus: WorkOrderStatus | null;
  onClose: () => void;
  onSubmit: (note: string, cancellationReason: string) => Promise<void>;
  isSubmitting: boolean;
}

export const TransitionModal: React.FC<TransitionModalProps> = ({
  isOpen,
  targetStatus,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [note, setNote] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(note, cancellationReason);
    setNote('');
    setCancellationReason('');
  };

  const getTitle = () => {
    switch (targetStatus) {
      case 'IN_PROGRESS': return 'Start Field Work';
      case 'ON_HOLD': return 'Place Work Order On Hold';
      case 'COMPLETED': return 'Mark Job as Completed';
      case 'CLOSED': return 'Management Sign-off & Close Work Order';
      case 'CANCELLED': return 'Cancel Work Order';
      default: return 'Confirm Lifecycle Status Transition';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit}>
        {targetStatus === 'CANCELLED' ? (
          <div className="form-group">
            <label className="form-label">Cancellation Reason *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Resolved internally by building security"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              required
            />
          </div>
        ) : null}

        <div className="form-group">
          <label className="form-label">
            {targetStatus === 'ON_HOLD'
              ? 'Reason for Hold *'
              : targetStatus === 'COMPLETED'
              ? 'Completion Notes & Diagnostic Summary *'
              : 'Operational Note'}
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder={
              targetStatus === 'ON_HOLD'
                ? 'e.g. Waiting for specialized replacement valve from distributor'
                : targetStatus === 'COMPLETED'
                ? 'e.g. Replaced capacitor, verified motor amp draw at 14.2A, tested system'
                : 'Optional notes recorded into immutable history log...'
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required={targetStatus === 'ON_HOLD' || targetStatus === 'COMPLETED'}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn ${targetStatus === 'CANCELLED' ? 'btn-outline' : 'btn-primary'}`}
            disabled={isSubmitting}
            style={targetStatus === 'CANCELLED' ? { color: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
          >
            {isSubmitting ? 'Updating...' : `Confirm: Set to ${targetStatus}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface AssignModalProps {
  isOpen: boolean;
  technicians: User[];
  currentTechId?: number;
  onClose: () => void;
  onSubmit: (techId: number, note: string) => Promise<void>;
  isSubmitting: boolean;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  technicians,
  currentTechId,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedTechId, setSelectedTechId] = useState<number | ''>(currentTechId || '');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) return;
    await onSubmit(Number(selectedTechId), note);
    setNote('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Field Technician">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select Certified Technician *</label>
          <select
            className="form-control"
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(Number(e.target.value))}
            required
          >
            <option value="">Choose technician...</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName} ({t.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Dispatch Instructions</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Special access codes, safety gear requirements, or customer instructions..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !selectedTechId}>
            {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface LogPartModalProps {
  isOpen: boolean;
  availableParts: Part[];
  onClose: () => void;
  onSubmit: (partId: number, quantity: number) => Promise<void>;
  isSubmitting: boolean;
}

export const LogPartModal: React.FC<LogPartModalProps> = ({
  isOpen,
  availableParts,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [partId, setPartId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const selectedPart = availableParts.find((p) => p.id === Number(partId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partId) return;
    await onSubmit(Number(partId), quantity);
    setPartId('');
    setQuantity(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Part Consumption (Pessimistic Lock)">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Warehouse Inventory Part *</label>
          <select
            className="form-control"
            value={partId}
            onChange={(e) => setPartId(Number(e.target.value))}
            required
          >
            <option value="">Select part from catalog...</option>
            {availableParts.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.category}] {p.name} ({p.sku}) &bull; Stock: {p.stockQuantity} &bull; ${p.unitCost.toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {selectedPart && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <div><strong>Available Stock:</strong> {selectedPart.stockQuantity} units</div>
            <div><strong>Unit Price:</strong> ${selectedPart.unitCost.toFixed(2)}</div>
            <div>
              <strong>Estimated Cost:</strong> ${(selectedPart.unitCost * quantity).toFixed(2)}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Quantity Consumed *</label>
          <input
            type="number"
            min="1"
            max={selectedPart ? selectedPart.stockQuantity : 999}
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !partId}>
            {isSubmitting ? 'Recording & Locking...' : 'Deduct from Stock'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (minutes: number, note: string) => Promise<void>;
  isSubmitting: boolean;
}

export const LogTimeModal: React.FC<LogTimeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [minutes, setMinutes] = useState<number>(60);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(minutes, note);
    setMinutes(60);
    setNote('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Technician Labor Time">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Minutes Worked *</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            {[30, 60, 90, 120, 180, 240].map((m) => (
              <button
                key={m}
                type="button"
                className={`btn btn-sm ${minutes === m ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMinutes(m)}
              >
                {m >= 60 ? `${m / 60}h` : `${m}m`}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            className="form-control"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Activity Description</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Details of labor performed (e.g. system inspection, vacuuming lines, leak test)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging...' : 'Log Labor Time'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, caption: string) => Promise<void>;
  isSubmitting: boolean;
}

export const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    await onSubmit(file, caption);
    setFile(null);
    setCaption('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Job Photo / Document">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Select File (JPEG, PNG, WEBP, PDF) *</label>
          <input
            type="file"
            className="form-control"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Caption / Description</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Before repair - damaged capacitor wiring"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting || !file}>
            {isSubmitting ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
