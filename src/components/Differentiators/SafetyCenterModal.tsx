import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, Network, QrCode, Scan, WifiOff, Clock, Bot, Activity, Server, X, ChevronRight, Cpu 
} from 'lucide-react';

export const SafetyCenterModal: React.FC = () => {
  const { activeModal, closeModal, openModal, meshModeActive, scamRadarActive, currentUser, isAdmin } = useApp();

  if (activeModal !== 'safety_center') return null;

  const features = [
    {
      id: 'trust_graph',
      title: 'Trust Graph & Context Calling',
      desc: 'Verify unknown caller origin country, mutual contacts & graph trust score.',
      icon: <Network size={22} style={{ color: 'var(--accent-indigo)' }} />,
      badge: 'Calculated'
    },
    {
      id: 'key_verify',
      title: 'Device-Bound Key Verification (QR)',
      desc: 'Scan partner QR code or compare 30-digit safety number fingerprint.',
      icon: <QrCode size={22} style={{ color: 'var(--accent-purple)' }} />,
      badge: 'Hardware Verified'
    },
    {
      id: 'scam_inspector',
      title: 'On-Device AI Scam Radar',
      desc: 'Zero-leakage local NLP classifier evaluating message text and links.',
      icon: <Scan size={22} style={{ color: 'var(--accent-emerald)' }} />,
      badge: scamRadarActive ? 'Active' : 'Disabled'
    },
    {
      id: 'deepfake_analyzer',
      title: 'WebRTC Deepfake Voice Risk Analyzer',
      desc: 'Local AI evaluating packet jitter & pitch variance for synthetic voice clones.',
      icon: <Cpu size={22} style={{ color: 'var(--accent-rose)' }} />,
      badge: 'AI Monitor'
    },
    {
      id: 'mesh_status',
      title: 'Mesh-Fallback Mode (Offline P2P)',
      desc: 'Relay double-ratchet encrypted messages over BLE/Wi-Fi mesh when internet is down.',
      icon: <WifiOff size={22} style={{ color: 'var(--accent-blue)' }} />,
      badge: meshModeActive ? '3 Peers Connected' : 'Ready'
    },
    {
      id: 'proof_of_human',
      title: 'Proof-of-Human Challenge',
      desc: 'Interactive micro-puzzle challenge to block automated spam bots.',
      icon: <Bot size={22} style={{ color: 'var(--accent-amber)' }} />,
      badge: 'Bot Guard'
    },
    {
      id: 'reputation_inspector',
      title: 'Reputation & Rate Limit Meter',
      desc: 'Dynamic throttling matrix based on account trust tier.',
      icon: <Activity size={22} style={{ color: 'var(--accent-blue)' }} />,
      badge: `Tier ${currentUser.reputationTier}`
    },
    ...(isAdmin ? [{
      id: 'ops_dashboard',
      title: 'System Infrastructure Telemetry',
      desc: 'Monitor WebSocket gateways, Coturn TURN server & Key rotators.',
      icon: <Server size={22} style={{ color: 'var(--accent-whatsapp)' }} />,
      badge: 'Admin Only'
    }] : [])
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(12, 19, 23, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '620px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
        background: 'var(--bg-sidebar)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px'
      }}>
        <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00a884 0%, #128c7e 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>HumanLink Safety & Trust Center</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
              Access the 7 unique security & anti-fraud capabilities.
            </p>
          </div>
        </div>

        {/* Grid of Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {features.map(f => (
            <div
              key={f.id}
              onClick={() => {
                closeModal();
                openModal(f.id);
              }}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {f.icon}
                <span className="glass-pill" style={{ fontSize: '0.675rem', padding: '2px 8px' }}>
                  {f.badge}
                </span>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {f.title} <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
