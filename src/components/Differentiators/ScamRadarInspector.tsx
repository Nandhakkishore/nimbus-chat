import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Scan, ShieldAlert, CheckCircle2, Zap, X } from 'lucide-react';
import { ScamRadarService } from '../../services/ScamRadarService';
import { ScamScanResult } from '../../types';

export const ScamRadarInspector: React.FC = () => {
  const { activeModal, closeModal, scamRadarActive, toggleScamRadar } = useApp();
  const [testText, setTestText] = useState('URGENT: Claim $5,000 crypto bonus at http://paypa1-security-claim.com');
  const [scanOutput, setScanOutput] = useState<ScamScanResult | null>(null);

  if (activeModal !== 'scam_inspector') return null;

  const handleRunScan = () => {
    const res = ScamRadarService.scanMessageText(testText, 25);
    setScanOutput(res);
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
        maxWidth: '520px',
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Scan size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>On-Device AI Scam Radar</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Zero-leakage local NLP & link threat classifier.
            </p>
          </div>
        </div>

        {/* Live Test Sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Live NLP Sandbox Tester
          </label>
          <textarea
            rows={3}
            value={testText}
            onChange={e => setTestText(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)'
            }}
          />
          <button onClick={handleRunScan} style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <Zap size={16} /> Run Local Inference (&lt;10ms)
          </button>
        </div>

        {scanOutput && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: scanOutput.isSuspicious ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: scanOutput.isSuspicious ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                Classification: {scanOutput.category.toUpperCase()}
              </span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                Risk Score: {Math.round(scanOutput.riskScore * 100)}%
              </span>
            </div>

            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem' }}>
              {scanOutput.reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
