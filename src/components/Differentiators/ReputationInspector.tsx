import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, ShieldCheck, Zap, Lock, X } from 'lucide-react';

export const ReputationInspector: React.FC = () => {
  const { activeModal, closeModal, currentUser } = useApp();

  if (activeModal !== 'reputation_inspector') return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Reputation & Rate Limit Meter</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Dynamic throttling tied to social graph trust & activity history.
            </p>
          </div>
        </div>

        {/* Current Score */}
        <div style={{
          padding: '18px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Current User Reputation
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              Tier {currentUser.reputationTier} • High Trust ({currentUser.trustScore}/100)
            </div>
          </div>
          <ShieldCheck size={36} style={{ color: 'var(--accent-primary)' }} />
        </div>

        {/* Limits Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', margin: 0 }}>
            Adaptive Quota Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Unknown Senders Message Limit:</span>
              <strong>Unlimited (Verified Trust)</strong>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Voice/Video Calls Rate Limit:</span>
              <strong>Unlimited / Hour</strong>
            </div>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Media Attachment Upload:</span>
              <strong>HD Media Allowed</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
