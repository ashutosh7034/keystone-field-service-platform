import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Wrench, Building, ChevronUp, ChevronDown, Check } from 'lucide-react';

export const DemoLoginBar: React.FC = () => {
  const { switchDemoUser, user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Hidden in production and normal UI; only accessible if ?showDemo=true is present in DEV
  const isEnabled = Boolean(import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('showDemo=true'));
  if (!isEnabled) {
    return null;
  }

  const demoAccounts = [
    { email: 'manager@keystone.demo', label: 'Eleanor Vance', roleTitle: 'Operations Director', role: 'ROLE_MANAGER', icon: <ShieldCheck size={14} /> },
    { email: 'dispatcher@keystone.demo', label: 'David Ross', roleTitle: 'Head Dispatcher', role: 'ROLE_DISPATCHER', icon: <UserCheck size={14} /> },
    { email: 'technician1@keystone.demo', label: 'Alex Rivera', roleTitle: 'Lead HVAC Tech', role: 'ROLE_TECHNICIAN', icon: <Wrench size={14} /> },
    { email: 'technician2@keystone.demo', label: 'Sarah Chen', roleTitle: 'Master Electrician', role: 'ROLE_TECHNICIAN', icon: <Wrench size={14} /> },
    { email: 'customer1@keystone.demo', label: 'Apex Global', roleTitle: 'Facility Customer', role: 'ROLE_CUSTOMER', icon: <Building size={14} /> },
    { email: 'customer2@keystone.demo', label: 'Metro Properties', roleTitle: 'Facility Customer', role: 'ROLE_CUSTOMER', icon: <Building size={14} /> },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* Popover Menu */}
      {isOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #D9DEE5',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '0.75rem',
            marginBottom: '0.5rem',
            width: '280px',
            maxHeight: '340px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem',
              paddingBottom: '0.4rem',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', letterSpacing: '0.04em' }}>
              DEV MODE: DEMO ACCOUNTS
            </span>
            <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Click to switch</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {demoAccounts.map((acc) => {
              const isActive = user?.email === acc.email;
              return (
                <button
                  key={acc.email}
                  onClick={() => {
                    switchDemoUser(acc.email);
                    setIsOpen(false);
                  }}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid transparent',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#1D4ED8' : '#374151',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: isActive ? '#2563EB' : '#6B7280' }}>{acc.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: isActive ? 600 : 500 }}>
                        {acc.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>{acc.roleTitle}</div>
                    </div>
                  </div>
                  {isActive && <Check size={14} color="#2563EB" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.65rem',
          borderRadius: '4px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D9DEE5',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#4B5563',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F9FAFB';
          e.currentTarget.style.borderColor = '#9CA3AF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderColor = '#D9DEE5';
        }}
      >
        <span style={{ color: '#2563EB' }}>⚡</span>
        <span>Demo Account</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>
    </div>
  );
};
