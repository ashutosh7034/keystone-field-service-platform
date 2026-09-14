import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Sun, Moon, LogOut, User, Menu } from 'lucide-react';
import { NotificationDrawer } from './NotificationDrawer';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigateToWorkOrder?: (workOrderId: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigateToWorkOrder }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ROLE_MANAGER': return 'Manager';
      case 'ROLE_DISPATCHER': return 'Dispatcher';
      case 'ROLE_TECHNICIAN': return 'Technician';
      case 'ROLE_CUSTOMER': return 'Customer';
      default: return role;
    }
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ROLE_MANAGER': return { background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'ROLE_DISPATCHER': return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'ROLE_TECHNICIAN': return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'ROLE_CUSTOMER': return { background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' };
      default: return {};
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {onToggleSidebar && (
          <button className="btn-icon" onClick={onToggleSidebar} aria-label="Toggle menu" style={{ display: 'none' }}>
            <Menu size={18} />
          </button>
        )}
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Meridian Facilities Management Operating Platform
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        {/* Theme Toggle */}
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications Bell */}
        <button
          className="btn-icon"
          onClick={() => setIsNotifOpen((prev) => !prev)}
          style={{ position: 'relative' }}
          aria-label="View notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.35rem',
                minWidth: '18px',
                textAlign: 'center',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
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

        {/* User Info & Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.fullName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  padding: '0.05rem 0.4rem',
                  borderRadius: 'var(--radius-full)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  ...getRoleBadgeStyle(user?.role),
                }}
              >
                {getRoleLabel(user?.role)}
              </span>
            </div>
          </div>

          <button
            className="btn-icon"
            onClick={logout}
            title="Logout"
            style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
