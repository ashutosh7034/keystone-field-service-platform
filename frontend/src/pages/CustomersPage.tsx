import React, { useState, useEffect } from 'react';
import { customersApi, sitesApi } from '../api/client';
import { Customer, Site } from '../types';
import { Modal } from '../components/Modal';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Plus, Search, Building2, MapPin, Phone, Mail } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'SITES'>('CUSTOMERS');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('');
  const [custState, setCustState] = useState('');
  const [custPostalCode, setCustPostalCode] = useState('');

  // Add Site Modal
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [siteCustomerId, setSiteCustomerId] = useState<number | ''>('');
  const [siteName, setSiteName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [siteCity, setSiteCity] = useState('');
  const [siteState, setSiteState] = useState('');
  const [sitePostalCode, setSitePostalCode] = useState('');
  const [siteContactPerson, setSiteContactPerson] = useState('');
  const [siteContactPhone, setSiteContactPhone] = useState('');

  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [custRes, sitesRes] = await Promise.all([
        customersApi.search({ query: searchQuery || undefined, size: 50 }),
        sitesApi.search({ query: searchQuery || undefined, size: 50 }),
      ]);
      setCustomers(custRes.data.content);
      setSites(sitesRes.data.content);
    } catch (err) {
      console.error('Failed to load customers/sites', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      await customersApi.create({
        name: custName,
        email: custEmail,
        phone: custPhone,
        address: custAddress,
        city: custCity,
        state: custState,
        postalCode: custPostalCode,
      });
      setIsCustomerModalOpen(false);
      resetCustomerForm();
      fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteCustomerId) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      await sitesApi.create({
        customerId: Number(siteCustomerId),
        name: siteName,
        address: siteAddress,
        city: siteCity,
        state: siteState,
        postalCode: sitePostalCode,
        contactPerson: siteContactPerson,
        contactPhone: siteContactPhone,
      });
      setIsSiteModalOpen(false);
      resetSiteForm();
      fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create facility site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCustomerForm = () => {
    setCustName('');
    setCustEmail('');
    setCustPhone('');
    setCustAddress('');
    setCustCity('');
    setCustState('');
    setCustPostalCode('');
    setModalError(null);
  };

  const resetSiteForm = () => {
    setSiteCustomerId('');
    setSiteName('');
    setSiteAddress('');
    setSiteCity('');
    setSiteState('');
    setSitePostalCode('');
    setSiteContactPerson('');
    setSiteContactPhone('');
    setModalError(null);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Customers & Facilities Directory</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage commercial accounts, facility complexes, building contacts, and location metadata
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsSiteModalOpen(true)}>
            <Plus size={16} /> Add Facility Site
          </button>
          <button className="btn btn-primary" onClick={() => setIsCustomerModalOpen(true)}>
            <Plus size={16} /> Add Customer Org
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeTab === 'CUSTOMERS' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
            color: activeTab === 'CUSTOMERS' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'CUSTOMERS' ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)',
            fontWeight: activeTab === 'CUSTOMERS' ? 600 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Customer Organizations ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('SITES')}
          style={{
            padding: '0.45rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: activeTab === 'SITES' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
            color: activeTab === 'SITES' ? 'var(--primary)' : 'var(--text-secondary)',
            border: activeTab === 'SITES' ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)',
            fontWeight: activeTab === 'SITES' ? 600 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Facility Sites ({sites.length})
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email, address, or city..."
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

      {/* Tables */}
      {isLoading ? (
        <LoadingSkeleton rows={6} height="55px" />
      ) : activeTab === 'CUSTOMERS' ? (
        customers.length === 0 ? (
          <EmptyState title="No customers found" icon={<Building2 size={48} color="var(--text-muted)" />} />
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Email</th>
                  <th>Phone</th>
                  <th>Headquarters Address</th>
                  <th>Registered Sites</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} color="var(--text-muted)" /> {c.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={13} color="var(--text-muted)" /> {c.phone}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {c.address}, {c.city} {c.state}
                    </td>
                    <td>
                      <span className="badge badge-assigned">{c.sitesCount} Sites</span>
                    </td>
                    <td>
                      <span className="badge badge-completed">{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : sites.length === 0 ? (
        <EmptyState title="No facility sites found" icon={<MapPin size={48} color="var(--text-muted)" />} />
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Customer Organization</th>
                <th>Address & City</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</td>
                  <td>
                    <span className="badge badge-assigned">{s.customerName}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {s.address}, {s.city} {s.state} {s.postalCode}
                  </td>
                  <td>{s.contactPerson || 'N/A'}</td>
                  <td>{s.contactPhone || 'N/A'}</td>
                  <td>
                    <span className="badge badge-completed">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Add Customer Organization"
      >
        {modalError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateCustomer}>
          <div className="form-group">
            <label className="form-label">Organization Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Apex Commercial Towers"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Contact Email *</label>
              <input
                type="email"
                className="form-control"
                placeholder="facilities@apex.com"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1-555-0101"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Headquarters Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="100 Financial Way"
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                placeholder="New York"
                value={custCity}
                onChange={(e) => setCustCity(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                placeholder="NY"
                value={custState}
                onChange={(e) => setCustState(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="10005"
                value={custPostalCode}
                onChange={(e) => setCustPostalCode(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCustomerModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Site Modal */}
      <Modal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        title="Add Facility Site"
      >
        {modalError && (
          <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {modalError}
          </div>
        )}

        <form onSubmit={handleCreateSite}>
          <div className="form-group">
            <label className="form-label">Customer Organization *</label>
            <select
              className="form-control"
              value={siteCustomerId}
              onChange={(e) => setSiteCustomerId(Number(e.target.value))}
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

          <div className="form-group">
            <label className="form-label">Site Name / Building *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Apex Tower North (Headquarters)"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              className="form-control"
              placeholder="100 Financial Way, Tower A"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-control"
                placeholder="New York"
                value={siteCity}
                onChange={(e) => setSiteCity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                className="form-control"
                placeholder="NY"
                value={siteState}
                onChange={(e) => setSiteState(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code *</label>
              <input
                type="text"
                className="form-control"
                placeholder="10005"
                value={sitePostalCode}
                onChange={(e) => setSitePostalCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">On-Site Contact Person</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. David Miller"
                value={siteContactPerson}
                onChange={(e) => setSiteContactPerson(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="+1-555-3001"
                value={siteContactPhone}
                onChange={(e) => setSiteContactPhone(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSiteModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
