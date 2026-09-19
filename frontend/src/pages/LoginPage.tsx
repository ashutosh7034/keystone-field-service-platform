import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wrench, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Building } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setEmail(demoEmail);
    setPassword('password123');
    try {
      await switchDemoUser(demoEmail);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate demo user.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D9DEE5',
          borderRadius: '6px',
          padding: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '5px',
              background: '#2563EB',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              marginBottom: '0.85rem',
            }}
          >
            <Wrench size={22} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '0.25rem', color: '#1F2937' }}>
            PROJECT KEYSTONE
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#667085' }}>
            Meridian Facilities Management Operating Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                placeholder="name@keystone.demo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast Login Section */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demo Profiles (Password: password123)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('manager@keystone.demo')}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', fontWeight: 500 }}
            >
              <ShieldCheck size={14} color="#64748B" /> Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('dispatcher@keystone.demo')}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', fontWeight: 500 }}
            >
              <UserCheck size={14} color="#64748B" /> Dispatcher
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('technician1@keystone.demo')}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', fontWeight: 500 }}
            >
              <Wrench size={14} color="#64748B" /> Tech 1 (HVAC)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('technician2@keystone.demo')}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', fontWeight: 500 }}
            >
              <Wrench size={14} color="#64748B" /> Tech 2 (Elec)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('customer1@keystone.demo')}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', fontWeight: 500 }}
            >
              <Building size={14} color="#64748B" /> Customer (Apex)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('customer2@keystone.demo')}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', fontWeight: 500 }}
            >
              <Building size={14} color="#64748B" /> Customer (Metro)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
