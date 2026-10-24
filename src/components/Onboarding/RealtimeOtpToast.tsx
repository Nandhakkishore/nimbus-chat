import React, { useEffect, useState } from 'react';
import { Smartphone, CheckCircle2, Copy } from 'lucide-react';

export const RealtimeOtpToast: React.FC<{ 
  phoneNumber: string; 
  otpCode: string; 
  onAutofill: (code: string) => void;
  onClose: () => void;
}> = ({ phoneNumber, otpCode, onAutofill, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto dismiss after 10s
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 2000,
      background: 'var(--bg-header)',
      border: '1px solid var(--accent-whatsapp)',
      borderRadius: '16px',
      padding: '16px 20px',
      boxShadow: 'var(--shadow-md)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      maxWidth: '420px',
      animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: 'rgba(0, 168, 132, 0.2)',
        color: 'var(--accent-whatsapp)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Smartphone size={22} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--accent-whatsapp)', fontWeight: 700, textTransform: 'uppercase' }}>
          Realtime SMS Notification Received
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
          HumanLink Code: <span style={{ letterSpacing: '2px', color: 'var(--accent-whatsapp)' }}>{otpCode}</span>
        </div>
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Sent to {phoneNumber}
        </div>
      </div>

      <button
        onClick={() => {
          onAutofill(otpCode);
          setVisible(false);
          onClose();
        }}
        style={{
          padding: '8px 14px',
          borderRadius: '8px',
          background: 'var(--accent-whatsapp)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.775rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0
        }}
      >
        <CheckCircle2 size={14} /> Auto-fill Code
      </button>
    </div>
  );
};
