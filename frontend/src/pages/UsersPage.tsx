import React, { useState, useEffect } from 'react';
import { authApi, customersApi } from '../api/client';
import { User, Role, Customer } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Plus, Mail } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('ROLE_TECHNICIAN');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [uRes, cRes] = await Promise.all([
        authApi.getAllUsers(),
        customersApi.getActive(),
      ]);
      setUsers(uRes.data);
      setCustomers(cRes.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      await authApi.register({
        email,
        password,
        fullName,
        phone,
        role,
        customerId: role === 'ROLE_CUSTOMER' && customerId ? Number(customerId) : undefined,
      });
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setRole('ROLE_TECHNICIAN');
    setCustomerId('');
    setModalError(null);
  };

  const formatRole = (r: Role) => {
    switch (r) {
      case 'ROLE_MANAGER': return 'Manager / Admin';
      case 'ROLE_DISPATCHER': return 'Dispatcher';
      case 'ROLE_TECHNICIAN': return 'Field Technician';
      case 'ROLE_CUSTOMER': return 'Customer Representative';
    }
  };

  return (
    <div className="page-body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Staff & User Administration</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage platform access credentials and role security permissions
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add User Account
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} height="52px" />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role & Permissions</th>
                <th>Phone</th>
                <th>Organization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.fullName}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} color="var(--text-muted)" /> {u.email}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-assigned">{formatRole(u.role)}</span>
                  </td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    {u.customerId ? (
                      <span style={{ fontSize: '0.85rem' }}>Customer Account #{u.customerId}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Meridian Internal</span>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-completed">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New User Account"
      >
        {modalError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alex Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="tech@keystone.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">System Role *</label>
              <select
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                required
              >
                <option value="ROLE_TECHNICIAN">Field Technician</option>
                <option value="ROLE_DISPATCHER">Dispatcher</option>
                <option value="ROLE_MANAGER">Manager / Admin</option>
                <option value="ROLE_CUSTOMER">Customer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1-555-0100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {role === 'ROLE_CUSTOMER' && (
            <div className="form-group">
              <label className="form-label">Associated Customer Organization *</label>
              <select
                className="form-control"
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
