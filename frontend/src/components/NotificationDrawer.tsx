import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Clock, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { NotificationType } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkOrder?: (workOrderId: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectWorkOrder,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'SLA_BREACH':
        return <AlertCircle size={16} color="var(--danger)" />;
      case 'SLA_AT_RISK':
        return <AlertTriangle size={16} color="var(--warning)" />;
      case 'ASSIGNMENT':
        return <CheckCircle size={16} color="var(--primary)" />;
      default:
        return <Clock size={16} color="var(--info)" />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(var(--header-height) + 8px)',
        right: '1.5rem',
        width: '380px',
        maxHeight: '480px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <Bell size={16} color="var(--primary)" />
          Notifications
          {unreadCount > 0 && (
            <span style={{ background: 'var(--danger)', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) markAsRead(n.id);
                if (n.workOrderId && onSelectWorkOrder) {
                  onSelectWorkOrder(n.workOrderId);
                  onClose();
                }
              }}
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.08)',
                border: n.read ? '1px solid transparent' : '1px solid var(--border-subtle)',
                marginBottom: '0.4rem',
                cursor: n.workOrderId ? 'pointer' : 'default',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ marginTop: '0.15rem' }}>{renderTypeIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: n.read ? 600 : 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
