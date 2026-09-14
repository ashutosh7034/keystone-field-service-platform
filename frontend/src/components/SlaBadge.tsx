import React, { useState, useEffect } from 'react';
import { SlaStatus } from '../types';
import { AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';

interface SlaBadgeProps {
  status: SlaStatus;
  dueDate?: string;
  showTimer?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ status, dueDate, showTimer = false }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!dueDate || !showTimer) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const due = new Date(dueDate).getTime();
      const diff = due - now;

      if (diff <= 0) {
        const overdueMinutes = Math.abs(Math.floor(diff / (1000 * 60)));
        const overdueHours = Math.floor(overdueMinutes / 60);
        const remMins = overdueMinutes % 60;
        setTimeRemaining(`Breached by ${overdueHours}h ${remMins}m`);
      } else {
        const totalMinutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [dueDate, showTimer]);

  const renderIcon = () => {
    switch (status) {
      case 'ON_TRACK':
        return <CheckCircle2 size={13} />;
      case 'AT_RISK':
        return <AlertTriangle size={13} />;
      case 'BREACHED':
        return <XCircle size={13} />;
    }
  };

  const formatText = () => {
    switch (status) {
      case 'ON_TRACK': return 'SLA On Track';
      case 'AT_RISK': return 'SLA At Risk';
      case 'BREACHED': return 'SLA Breached';
    }
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
      <span className={`badge sla-${status.toLowerCase()}`}>
        {renderIcon()}
        {formatText()}
      </span>
      {showTimer && timeRemaining && (
        <span style={{ fontSize: '0.75rem', color: status === 'BREACHED' ? 'var(--danger)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={11} /> {timeRemaining}
        </span>
      )}
    </div>
  );
};
