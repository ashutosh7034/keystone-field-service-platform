import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Kanban,
  Building2,
  MapPin,
  Wrench,
  BarChart3,
  Users,
  PlusCircle,
  FileCode2
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user } = useAuth();
  const role = user?.role;

  const isManager = role === 'ROLE_MANAGER';
  const isDispatcher = role === 'ROLE_DISPATCHER';
  const isTechnician = role === 'ROLE_TECHNICIAN';
  const isCustomer = role === 'ROLE_CUSTOMER';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Wrench size={18} />
          </div>
          KEYSTONE
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Manager & Dispatcher Menus */}
        {(isManager || isDispatcher) && (
          <>
            <div className="nav-category">Operations</div>
            <div
              className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </div>
            <div
              className={`nav-link ${currentView === 'workorders' ? 'active' : ''}`}
              onClick={() => onNavigate('workorders')}
            >
              <ClipboardList size={18} />
              Work Orders
            </div>
            <div
              className={`nav-link ${currentView === 'kanban' ? 'active' : ''}`}
              onClick={() => onNavigate('kanban')}
            >
              <Kanban size={18} />
              Kanban Board
            </div>

            <div className="nav-category">Facilities & Entities</div>
            <div
              className={`nav-link ${currentView === 'customers' ? 'active' : ''}`}
              onClick={() => onNavigate('customers')}
            >
              <Building2 size={18} />
              Customers
            </div>
            <div
              className={`nav-link ${currentView === 'sites' ? 'active' : ''}`}
              onClick={() => onNavigate('sites')}
            >
              <MapPin size={18} />
              Sites
            </div>
            <div
              className={`nav-link ${currentView === 'inventory' ? 'active' : ''}`}
              onClick={() => onNavigate('inventory')}
            >
              <Wrench size={18} />
              Parts & Inventory
            </div>

            {isManager && (
              <>
                <div className="nav-category">Analytics & Admin</div>
                <div
                  className={`nav-link ${currentView === 'reports' ? 'active' : ''}`}
                  onClick={() => onNavigate('reports')}
                >
                  <BarChart3 size={18} />
                  SLA & Performance
                </div>
                <div
                  className={`nav-link ${currentView === 'users' ? 'active' : ''}`}
                  onClick={() => onNavigate('users')}
                >
                  <Users size={18} />
                  Staff & Users
                </div>
              </>
            )}
          </>
        )}

        {/* Technician Menu */}
        {isTechnician && (
          <>
            <div className="nav-category">Field Technician Portal</div>
            <div
              className={`nav-link ${currentView === 'technician-jobs' ? 'active' : ''}`}
              onClick={() => onNavigate('technician-jobs')}
            >
              <Wrench size={18} />
              My Assigned Jobs
            </div>
            <div
              className={`nav-link ${currentView === 'inventory' ? 'active' : ''}`}
              onClick={() => onNavigate('inventory')}
            >
              <Wrench size={18} />
              Parts Catalog
            </div>
          </>
        )}

        {/* Customer Portal Menu */}
        {isCustomer && (
          <>
            <div className="nav-category">Customer Portal</div>
            <div
              className={`nav-link ${currentView === 'customer-requests' ? 'active' : ''}`}
              onClick={() => onNavigate('customer-requests')}
            >
              <ClipboardList size={18} />
              My Service Requests
            </div>
            <div
              className={`nav-link ${currentView === 'customer-create' ? 'active' : ''}`}
              onClick={() => onNavigate('customer-create')}
            >
              <PlusCircle size={18} />
              Raise Service Request
            </div>
            <div
              className={`nav-link ${currentView === 'sites' ? 'active' : ''}`}
              onClick={() => onNavigate('sites')}
            >
              <MapPin size={18} />
              Our Facilities
            </div>
          </>
        )}

        {/* Developer & Documentation Link */}
        <div className="nav-category">API & Docs</div>
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
          style={{ color: 'var(--text-secondary)' }}
        >
          <FileCode2 size={18} />
          Swagger OpenAPI
        </a>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>Project KEYSTONE v1.0.0</div>
          <div>Spring Boot 3 + MySQL 8</div>
        </div>
      </div>
    </aside>
  );
};
