import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DemoLoginBar } from './components/DemoLoginBar';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkOrdersListPage } from './pages/WorkOrdersListPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { KanbanBoardPage } from './pages/KanbanBoardPage';
import { TechnicianMobileView } from './pages/TechnicianMobileView';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { PartsInventoryPage } from './pages/PartsInventoryPage';
import { CustomersPage } from './pages/CustomersPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';

export const App: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<number | null>(null);
  const [previousView, setPreviousView] = useState<string>('dashboard');

  // Set initial view based on user role upon login or role change
  useEffect(() => {
    if (user) {
      if (user.role === 'ROLE_TECHNICIAN') {
        setCurrentView('technician-jobs');
      } else if (user.role === 'ROLE_CUSTOMER') {
        setCurrentView('customer-requests');
      } else {
        setCurrentView('dashboard');
      }
      setSelectedWorkOrderId(null);
    }
  }, [user?.role, user?.id]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem',
            }}
          />
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading KEYSTONE Platform...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <DemoLoginBar />
        <LoginPage />
      </div>
    );
  }

  const handleNavigate = (view: string) => {
    setPreviousView(currentView);
    setCurrentView(view);
    if (view !== 'workorder-detail') {
      setSelectedWorkOrderId(null);
    }
  };

  const handleNavigateToWorkOrder = (id: number) => {
    setPreviousView(currentView);
    setSelectedWorkOrderId(id);
    setCurrentView('workorder-detail');
  };

  const handleBackFromDetail = () => {
    if (previousView && previousView !== 'workorder-detail') {
      setCurrentView(previousView);
    } else {
      if (user?.role === 'ROLE_TECHNICIAN') {
        setCurrentView('technician-jobs');
      } else if (user?.role === 'ROLE_CUSTOMER') {
        setCurrentView('customer-requests');
      } else {
        setCurrentView('workorders');
      }
    }
    setSelectedWorkOrderId(null);
  };

  return (
    <div className="app-container">
      {/* Top Demo Switcher for Evaluation */}
      <DemoLoginBar />

      <div className="app-layout">
        {/* Left Sidebar */}
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />

        {/* Right Main Content Area */}
        <div className="main-content">
          <Navbar onNavigateToWorkOrder={handleNavigateToWorkOrder} />

          <main className="content-container">
            {currentView === 'dashboard' && (
              <DashboardPage
                onNavigateToWorkOrder={handleNavigateToWorkOrder}
                onNavigateToView={handleNavigate}
              />
            )}

            {currentView === 'workorders' && (
              <WorkOrdersListPage onNavigateToWorkOrder={handleNavigateToWorkOrder} />
            )}

            {currentView === 'workorder-detail' && selectedWorkOrderId && (
              <WorkOrderDetailPage
                workOrderId={selectedWorkOrderId}
                onBack={handleBackFromDetail}
              />
            )}

            {currentView === 'kanban' && (
              <KanbanBoardPage onNavigateToWorkOrder={handleNavigateToWorkOrder} />
            )}

            {currentView === 'technician-jobs' && (
              <TechnicianMobileView onNavigateToWorkOrder={handleNavigateToWorkOrder} />
            )}

            {(currentView === 'customer-requests' || currentView === 'customer-create') && (
              <CustomerPortalPage onNavigateToWorkOrder={handleNavigateToWorkOrder} />
            )}

            {currentView === 'inventory' && <PartsInventoryPage />}

            {(currentView === 'customers' || currentView === 'sites') && <CustomersPage />}

            {currentView === 'reports' && <ReportsPage />}

            {currentView === 'users' && <UsersPage />}
          </main>
        </div>
      </div>
    </div>
  );
};
