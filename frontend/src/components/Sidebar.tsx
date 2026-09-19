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
          <div className="brand-emblem">
            <Wrench size={14} />
          </div>
          <span>KEYSTONE</span>
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
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </div>
            <div
              className={`nav-link ${currentView === 'workorders' ? 'active' : ''}`}
              onClick={() => onNavigate('workorders')}
            >
              <ClipboardList size={16} />
              <span>Work Orders</span>
            </div>
            <div
              className={`nav-link ${currentView === 'kanban' ? 'active' : ''}`}
              onClick={() => onNavigate('kanban')}
            >
              <Kanban size={16} />
              <span>Kanban Board</span>
            </div>

            <div className="nav-category">Customers & Assets</div>
            <div
              className={`nav-link ${currentView === 'customers' ? 'active' : ''}`}
              onClick={() => onNavigate('customers')}
            >
              <Building2 size={16} />
              <span>Customers</span>
            </div>
            <div
              className={`nav-link ${currentView === 'sites' ? 'active' : ''}`}
              onClick={() => onNavigate('sites')}
            >
              <MapPin size={16} />
              <span>Sites</span>
            </div>
            <div
              className={`nav-link ${currentView === 'inventory' ? 'active' : ''}`}
              onClick={() => onNavigate('inventory')}
            >
              <Wrench size={16} />
              <span>Parts & Inventory</span>
            </div>

            {isManager && (
              <>
                <div className="nav-category">Analytics & Admin</div>
                <div
                  className={`nav-link ${currentView === 'reports' ? 'active' : ''}`}
                  onClick={() => onNavigate('reports')}
                >
                  <BarChart3 size={16} />
                  <span>SLA & Performance</span>
                </div>
                <div
                  className={`nav-link ${currentView === 'users' ? 'active' : ''}`}
                  onClick={() => onNavigate('users')}
                >
                  <Users size={16} />
                  <span>Staff & Users</span>
                </div>
              </>
            )}
          </>
        )}

        {/* Technician Menu */}
        {isTechnician && (
          <>
            <div className="nav-category">Field Portal</div>
            <div
              className={`nav-link ${currentView === 'technician-jobs' ? 'active' : ''}`}
              onClick={() => onNavigate('technician-jobs')}
            >
              <Wrench size={16} />
              <span>My Assigned Jobs</span>
            </div>
            <div
              className={`nav-link ${currentView === 'inventory' ? 'active' : ''}`}
              onClick={() => onNavigate('inventory')}
            >
              <Wrench size={16} />
              <span>Parts Catalog</span>
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
              <ClipboardList size={16} />
              <span>Service Requests</span>
            </div>
            <div
              className={`nav-link ${currentView === 'customer-create' ? 'active' : ''}`}
              onClick={() => onNavigate('customer-create')}
            >
              <PlusCircle size={16} />
              <span>New Request</span>
            </div>
            <div
              className={`nav-link ${currentView === 'sites' ? 'active' : ''}`}
              onClick={() => onNavigate('sites')}
            >
              <MapPin size={16} />
              <span>Our Facilities</span>
            </div>
          </>
        )}

        {/* Developer & Documentation Link */}
        <div className="nav-category">API & Documentation</div>
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          className="nav-link"
        >
          <FileCode2 size={16} />
          <span>Swagger OpenAPI</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          <div>Project KEYSTONE Enterprise</div>
          <div>v1.0.0 • Production</div>
        </div>
      </div>
    </aside>
  );
};
