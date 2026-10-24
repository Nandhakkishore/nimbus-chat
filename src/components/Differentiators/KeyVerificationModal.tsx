import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, QrCode, Camera, CheckCircle2, X } from 'lucide-react';
import { E2EEService } from '../../services/E2EEService';

export const KeyVerificationModal: React.FC = () => {
  const { activeModal, closeModal, deviceKey, verifyDeviceKey } = useApp();
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan'>('my_qr');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  if (activeModal !== 'key_verify') return null;

  const handleSimulateScan = () => {
    verifyDeviceKey();
    setVerifiedSuccess(true);
    setTimeout(() => {
      setVerifiedSuccess(false);
      closeModal();
    }, 1800);
  };

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
        maxWidth: '460px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: 'var(--accent-purple)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <QrCode size={26} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Device Key QR Verifier</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            Confirm per-device encryption identity keys to prevent SIM-swapping & MITM attacks.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button 
            onClick={() => setActiveTab('my_qr')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              background: activeTab === 'my_qr' ? 'var(--bg-dark-tertiary)' : 'transparent',
              color: activeTab === 'my_qr' ? 'var(--accent-purple)' : 'var(--text-muted)'
            }}
          >
            My Device Safety QR
          </button>
          <button 
            onClick={() => setActiveTab('scan')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              background: activeTab === 'scan' ? 'var(--bg-dark-tertiary)' : 'transparent',
              color: activeTab === 'scan' ? 'var(--accent-purple)' : 'var(--text-muted)'
            }}
          >
            Scan Partner QR
          </button>
        </div>

        {verifiedSuccess ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--accent-primary)'
          }}>
            <CheckCircle2 size={56} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Device Key Verified!</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Hardware cryptographic fingerprint matches Marcus Vance's device.
            </p>
          </div>
        ) : activeTab === 'my_qr' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Visual QR Code Generator */}
            <div style={{
              padding: '16px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="180" height="180" viewBox="0 0 100 100">
                <path d="M10 10 h30 v30 h-30 z M15 15 h20 v20 h-20 z M22 22 h6 v6 h-6 z" fill="#0f172a" />
                <path d="M60 10 h30 v30 h-30 z M65 15 h20 v20 h-20 z M72 22 h6 v6 h-6 z" fill="#0f172a" />
                <path d="M10 60 h30 v30 h-30 z M15 65 h20 v20 h-20 z M22 72 h6 v6 h-6 z" fill="#0f172a" />
                <path d="M45 10 h10 v10 h-10 z M50 25 h10 v15 h-10 z M45 45 h30 v10 h-30 z M60 60 h10 v30 h-10 z M75 60 h15 v15 h-15 z M75 80 h15 v10 h-15 z M45 75 h10 v15 h-10 z" fill="#0f172a" />
              </svg>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                30-Digit Safety Number Fingerprint
              </span>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
                background: 'rgba(0,0,0,0.3)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                marginTop: '6px',
                letterSpacing: '1px'
              }}>
                {deviceKey.safetyNumber}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
            <div style={{
              width: '100%',
              height: '200px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.5)',
              border: '2px dashed var(--accent-purple)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-muted)'
            }}>
              <Camera size={40} className="pulse-animation" style={{ color: 'var(--accent-purple)' }} />
              <span style={{ fontSize: '0.85rem' }}>Align partner's QR code within camera frame</span>
            </div>

            <button onClick={handleSimulateScan} style={{
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={18} /> Simulate Successful Key QR Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
