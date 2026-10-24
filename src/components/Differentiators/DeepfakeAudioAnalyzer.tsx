import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Volume2, Activity, Cpu, X } from 'lucide-react';
import { ScamRadarService } from '../../services/ScamRadarService';

export const DeepfakeAudioAnalyzer: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  const [jitterMs, setJitterMs] = useState(45);
  const [fpsDropPct, setFpsDropPct] = useState(15);
  const [pitchVariance, setPitchVariance] = useState(0.45);

  if (activeModal !== 'deepfake_analyzer') return null;

  const deepfakeRiskScore = ScamRadarService.evaluateDeepfakeCallRisk(jitterMs, fpsDropPct, pitchVariance);
  const isHighRisk = deepfakeRiskScore > 50;

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
        maxWidth: '560px',
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
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>WebRTC Deepfake Audio/Video Analyzer</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              On-device AI analyzing packet jitter & pitch variance for synthetic voice clones.
            </p>
          </div>
        </div>

        {/* Simulated Waveform Visualizer */}
        <div style={{
          width: '100%',
          height: '110px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '0 20px'
        }}>
          {[40, 65, 30, 85, 95, 45, 75, 20, 90, 60, 30, 70, 100, 50, 80, 45, 60, 25, 85, 40].map((h, idx) => (
            <div key={idx} style={{
              flex: 1,
              height: `${isHighRisk ? Math.max(10, h * (pitchVariance < 0.2 ? 0.3 : 1)) : h}%`,
              background: isHighRisk ? 'var(--accent-rose)' : 'var(--accent-primary)',
              borderRadius: '2px',
              transition: 'all 0.15s ease-in-out'
            }} />
          ))}
        </div>

        {/* WebRTC Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>WebRTC Network Jitter</span>
              <span><strong>{jitterMs} ms</strong></span>
            </label>
            <input type="range" min={10} max={150} value={jitterMs} onChange={e => setJitterMs(parseInt(e.target.value))} />
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Synthetic Frame Drops</span>
              <span><strong>{fpsDropPct}%</strong></span>
            </label>
            <input type="range" min={0} max={80} value={fpsDropPct} onChange={e => setFpsDropPct(parseInt(e.target.value))} />
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Voice Pitch Variance (Natural Human &gt; 0.3)</span>
              <span><strong>{pitchVariance.toFixed(2)}</strong></span>
            </label>
            <input type="range" min={0.05} max={1.0} step={0.05} value={pitchVariance} onChange={e => setPitchVariance(parseFloat(e.target.value))} />
          </div>
        </div>

        {/* Real-time Result */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: isHighRisk ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: isHighRisk ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Deepfake Voice Risk Assessment
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isHighRisk ? 'var(--accent-rose)' : 'var(--accent-primary)', marginTop: '2px' }}>
              {deepfakeRiskScore}% {isHighRisk ? 'SYNTHETIC VOICE CLONE RISK' : 'NATURAL HUMAN VOICE'}
            </div>
          </div>
          <Cpu size={32} style={{ color: isHighRisk ? 'var(--accent-rose)' : 'var(--accent-primary)' }} />
        </div>
      </div>
    </div>
  );
};
