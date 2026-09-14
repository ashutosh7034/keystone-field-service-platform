import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Wrench, Building } from 'lucide-react';

export const DemoLoginBar: React.FC = () => {
  const { switchDemoUser, user, isLoading } = useAuth();

  const demoAccounts = [
    { email: 'manager@keystone.demo', label: 'Manager (Eleanor)', role: 'ROLE_MANAGER', icon: <ShieldCheck size={14} />, color: '#8b5cf6' },
    { email: 'dispatcher@keystone.demo', label: 'Dispatcher (David)', role: 'ROLE_DISPATCHER', icon: <UserCheck size={14} />, color: '#3b82f6' },
    { email: 'technician1@keystone.demo', label: 'Tech 1 - HVAC (Alex)', role: 'ROLE_TECHNICIAN', icon: <Wrench size={14} />, color: '#f59e0b' },
    { email: 'technician2@keystone.demo', label: 'Tech 2 - Elec (Sarah)', role: 'ROLE_TECHNICIAN', icon: <Wrench size={14} />, color: '#10b981' },
    { email: 'customer1@keystone.demo', label: 'Customer 1 (Apex)', role: 'ROLE_CUSTOMER', icon: <Building size={14} />, color: '#ec4899' },
    { email: 'customer2@keystone.demo', label: 'Customer 2 (Metro)', role: 'ROLE_CUSTOMER', icon: <Building size={14} />, color: '#06b6d4' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #111827 0%, #1e293b 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '0.45rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        overflowX: 'auto',
        fontSize: '0.8rem',
        zIndex: 50,
      }}
    >
      <span style={{ fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        ⚡ QUICK DEMO SWITCHER:
      </span>
      <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'nowrap' }}>
        {demoAccounts.map((acc) => {
          const isActive = user?.email === acc.email;
          return (
            <button
              key={acc.email}
              onClick={() => switchDemoUser(acc.email)}
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: isActive ? acc.color : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? `1px solid ${acc.color}` : '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {acc.icon}
              {acc.label}
              {isActive && ' (Active)'}
            </button>
          );
        })}
      </div>
    </div>
  );
};
