import React, { useState, useEffect } from 'react';
import { SlaStatus } from '../types';

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

  const getSlaConfig = (st: SlaStatus) => {
    switch (st) {
      case 'ON_TRACK':
        return { label: 'On Track', color: '#15803D', dotColor: '#16A34A' };
      case 'AT_RISK':
        return { label: 'At Risk', color: '#B45309', dotColor: '#D97706' };
      case 'BREACHED':
        return { label: 'Breached', color: '#DC2626', dotColor: '#EF4444' };
      default:
        return { label: st, color: '#4B5563', dotColor: '#6B7280' };
    }
  };

  const config = getSlaConfig(status);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.15rem' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8rem',
          fontWeight: status === 'ON_TRACK' ? 500 : 600,
          color: config.color,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: config.dotColor,
            display: 'inline-block',
          }}
        />
        {config.label}
      </span>
      {showTimer && timeRemaining && (
        <span style={{ fontSize: '0.725rem', color: status === 'BREACHED' ? '#DC2626' : '#475467', fontWeight: 500 }}>
          {timeRemaining}
        </span>
      )}
    </div>
  );
};
