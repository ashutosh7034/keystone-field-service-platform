import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, LogOut, Menu, Search } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigateToWorkOrder?: (workOrderId: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigateToWorkOrder }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'ROLE_MANAGER': return 'Operations Director';
      case 'ROLE_DISPATCHER': return 'Head Dispatcher';
      case 'ROLE_TECHNICIAN': return 'Field Technician';
      case 'ROLE_CUSTOMER': return 'Facility Manager';
      default: return role || 'Staff';
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {onToggleSidebar && (
          <button className="btn-icon" onClick={onToggleSidebar} aria-label="Toggle menu" style={{ display: 'none' }}>
            <Menu size={16} />
          </button>
        )}
        <div className="navbar-brand-title">
          Meridian Facilities Management
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="navbar-search">
        <Search size={14} style={{ color: '#667085', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search work orders, customers, technicians..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', position: 'relative' }}>
        {/* Notifications Bell */}
        <button
          className="btn-icon"
          onClick={() => setIsNotifOpen((prev) => !prev)}
          style={{ position: 'relative' }}
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#DC2626',
                color: '#FFFFFF',
                borderRadius: '9999px',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.05rem 0.3rem',
                minWidth: '16px',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Drawer Dropdown */}
        <NotificationDrawer
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          onSelectWorkOrder={onNavigateToWorkOrder}
        />

        {/* User Info Block */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid var(--border-medium)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.fullName || 'Eleanor Vance'}
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {getRoleTitle(user?.role)}
            </span>
          </div>

          <button
            className="btn-icon"
            onClick={logout}
            title="Sign Out"
            style={{ color: '#475467' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
