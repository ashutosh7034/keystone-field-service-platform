import React, { useState, useEffect } from 'react';
import { partsApi } from '../api/client';
import { Part } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Plus, Search, Wrench, AlertTriangle, Edit } from 'lucide-react';

export const PartsInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Add/Edit Part Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPartId, setEditingPartId] = useState<number | null>(null);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('HVAC');
  const [unitCost, setUnitCost] = useState<number>(50.0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(1);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isManager = user?.role === 'ROLE_MANAGER';

  const fetchParts = async () => {
    try {
      setIsLoading(true);
      const res = await partsApi.search({
        query: searchQuery || undefined,
        category: selectedCategory || undefined,
        size: 50,
      });
      setParts(res.data.content);
    } catch (err) {
      console.error('Failed to load parts', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(fetchParts, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCreateModal = () => {
    setEditingPartId(null);
    setSku('');
    setName('');
    setDescription('');
    setCategory('HVAC');
    setUnitCost(50.0);
    setStockQuantity(10);
    setLeadTimeDays(1);
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Part) => {
    setEditingPartId(p.id);
    setSku(p.sku);
    setName(p.name);
    setDescription(p.description || '');
    setCategory(p.category);
    setUnitCost(p.unitCost);
    setStockQuantity(p.stockQuantity);
    setLeadTimeDays(p.leadTimeDays);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSavePart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (editingPartId) {
        await partsApi.update(editingPartId, {
          sku,
          name,
          description,
          category,
          unitCost,
          stockQuantity,
          leadTimeDays,
        });
        toast.success(`Part ${sku} updated successfully.`);
      } else {
        await partsApi.create({
          sku,
          name,
          description,
          category,
          unitCost,
          stockQuantity,
          leadTimeDays,
        });
        toast.success(`Part ${sku} added to inventory.`);
      }
      setIsModalOpen(false);
      fetchParts();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to save part record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Parts & Materials Inventory</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Track maintenance equipment, spare parts, unit pricing, and stock levels
          </p>
        </div>

        {isManager && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Add Inventory Part
          </button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by SKU, Part Name, or Category..."
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
          style={{ width: '180px' }}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="HVAC">HVAC</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
        </select>
      </div>

      {/* Parts Table */}
      {isLoading ? (
        <LoadingSkeleton rows={6} height="52px" />
      ) : parts.length === 0 ? (
        <EmptyState
          title="No inventory parts found"
          description="Try modifying your search criteria or add new spare parts."
          icon={<Wrench size={48} color="var(--text-muted)" />}
        />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Part Name & Category</th>
                <th>Unit Cost</th>
                <th>Stock Quantity</th>
                <th>Lead Time</th>
                <th>Status</th>
                {isManager && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {p.sku}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Category: {p.category}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${p.unitCost.toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: p.stockQuantity <= 5 ? 'var(--danger)' : 'var(--text-primary)',
                        }}
                      >
                        {p.stockQuantity} units
                      </span>
                      {p.stockQuantity <= 5 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{p.leadTimeDays} days</td>
                  <td>
                    {p.stockQuantity === 0 ? (
                      <span className="badge badge-cancelled">Out of Stock</span>
                    ) : p.stockQuantity <= 5 ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-completed">In Stock</span>
                    )}
                  </td>
                  {isManager && (
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(p)}>
                        <Edit size={13} /> Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Part Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPartId ? 'Edit Inventory Part' : 'Add New Inventory Part'}
      >
        {modalError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleSavePart}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">SKU / Code *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. HVAC-COMP-5T"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="HVAC">HVAC</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="PLUMBING">Plumbing</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Part Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 5-Ton Scroll Compressor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              placeholder="Technical specifications, compatible units..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Unit Cost ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Qty *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lead Time (Days) *</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingPartId ? 'Save Changes' : 'Create Part'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
