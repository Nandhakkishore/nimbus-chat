import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Network, ShieldCheck, ShieldAlert, Users, Globe, RefreshCw, X } from 'lucide-react';
import { TrustGraphService } from '../../services/TrustGraphService';

export const TrustGraphVisualizer: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  const [mutualCount, setMutualCount] = useState(6);
  const [sharedGroups, setSharedGroups] = useState(3);
  const [accountAgeMonths, setAccountAgeMonths] = useState(14);
  const [spamReports, setSpamReports] = useState(0);

  if (activeModal !== 'trust_graph') return null;

  const context = TrustGraphService.calculateContext(
    mutualCount,
    sharedGroups,
    accountAgeMonths,
    spamReports,
    'United States'
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(10, 14, 23, 0.88)',
      backdropFilter: 'blur(18px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '680px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
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
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: 'var(--accent-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Network size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Interactive Trust Graph Visualizer</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Calculates caller context & social distance graph scores without exposing full contact books.
            </p>
          </div>
        </div>

        {/* SVG Network Graph Visualization */}
        <div style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 500 220">
            {/* Animated Connection Lines */}
            <line x1="250" y1="110" x2="120" y2="60" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4" className="pulse-animation" />
            <line x1="250" y1="110" x2="380" y2="60" stroke="#6366f1" strokeWidth="2.5" />
            <line x1="250" y1="110" x2="150" y2="170" stroke="#3b82f6" strokeWidth="2" />
            <line x1="250" y1="110" x2="350" y2="170" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6" />

            {/* Central Node: Me */}
            <g transform="translate(250, 110)">
              <circle r="26" fill="#10b981" opacity="0.2" className="pulse-animation" />
              <circle r="20" fill="#10b981" />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">YOU</text>
            </g>

            {/* Node 1: Marcus (1st Degree) */}
            <g transform="translate(120, 60)">
              <circle r="18" fill="#6366f1" />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Marcus</text>
              <text y="30" textAnchor="middle" fill="#9ca3af" fontSize="9">1st Degree</text>
            </g>

            {/* Node 2: Dr. Aris (Mutual) */}
            <g transform="translate(380, 60)">
              <circle r="18" fill="#3b82f6" />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Dr. Aris</text>
              <text y="30" textAnchor="middle" fill="#9ca3af" fontSize="9">Shared Group</text>
            </g>

            {/* Node 3: Mutual Contacts Cluster */}
            <g transform="translate(150, 170)">
              <circle r="16" fill="#8b5cf6" />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Mutual (6)</text>
            </g>

            {/* Node 4: Unknown Senders */}
            <g transform="translate(350, 170)">
              <circle r="18" fill="#f43f5e" />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Unknown</text>
              <text y="30" textAnchor="middle" fill="#fb7185" fontSize="9">3rd Degree (18/100)</text>
            </g>
          </svg>
        </div>

        {/* Live Formula Calculator Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Mutual Contacts Count: <strong>{mutualCount}</strong>
            </label>
            <input 
              type="range" min={0} max={20} value={mutualCount} 
              onChange={e => setMutualCount(parseInt(e.target.value))} 
            />

            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Shared Active Groups: <strong>{sharedGroups}</strong>
            </label>
            <input 
              type="range" min={0} max={10} value={sharedGroups} 
              onChange={e => setSharedGroups(parseInt(e.target.value))} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Account Age: <strong>{accountAgeMonths} Months</strong>
            </label>
            <input 
              type="range" min={1} max={36} value={accountAgeMonths} 
              onChange={e => setAccountAgeMonths(parseInt(e.target.value))} 
            />

            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Past Spam Reports: <strong>{spamReports}</strong>
            </label>
            <input 
              type="range" min={0} max={5} value={spamReports} 
              onChange={e => setSpamReports(parseInt(e.target.value))} 
            />
          </div>
        </div>

        {/* Dynamic Formula Output Card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: context.trustScore > 60 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: context.trustScore > 60 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Calculated Graph Trust Index
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: context.trustScore > 60 ? 'var(--accent-primary)' : 'var(--accent-rose)' }}>
              {context.trustScore} / 100 ({context.riskCategory.toUpperCase()} RISK)
            </div>
          </div>

          <div className={`glass-pill ${context.trustScore > 60 ? 'badge-trust-high' : 'badge-scam-high'}`}>
            Degree: {context.connectionDegree}
          </div>
        </div>
      </div>
    </div>
  );
};
