import React from 'react';
import { useApp } from '../../context/AppContext';
import { WifiOff, Radio, Battery, Signal, Zap, Send, X } from 'lucide-react';
import { MeshNetworkService } from '../../services/MeshNetworkService';

export const MeshModeModal: React.FC = () => {
  const { activeModal, closeModal, meshModeActive, toggleMeshMode, sendMessage, activeRoomId } = useApp();

  if (activeModal !== 'mesh_status') return null;

  const nodes = MeshNetworkService.getNearbyMeshNodes();

  const handleTestMeshSend = () => {
    sendMessage(activeRoomId, "⚡ Hello via Bluetooth Mesh Relay! Internet disconnected.");
    closeModal();
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

        {/* Header */}
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
            <WifiOff size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Mesh-Fallback Mode Inspector</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Offline P2P store-and-forward encrypted packet routing.
            </p>
          </div>
        </div>

        {/* Status Toggle Card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: meshModeActive ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.04)',
          border: meshModeActive ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              Mesh Service: {meshModeActive ? 'ACTIVE (P2P Mesh Broadcasting)' : 'INACTIVE (Cloud Gateway)'}
            </span>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Allows nearby devices to relay Double-Ratchet encrypted messages over BLE when cellular is down.
            </p>
          </div>

          <button onClick={toggleMeshMode} style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: meshModeActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            {meshModeActive ? 'Disable Mesh' : 'Enable Mesh'}
          </button>
        </div>

        {/* Discovered Nearby Mesh Peer Nodes */}
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Discovered Nearby Mesh Nodes (3 Active Peers)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nodes.map(node => (
              <div key={node.nodeId} style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Radio size={18} style={{ color: 'var(--accent-blue)' }} />
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{node.name}</span>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', gap: '10px', marginTop: '2px' }}>
                      <span>Distance: {node.distanceMeters}m</span>
                      <span>Signal: {node.signalStrengthDbm} dBm</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Battery size={14} /> {node.batteryPercent}%
                  </div>
                  <span className="glass-pill badge-mesh" style={{ fontSize: '0.7rem' }}>
                    Relaying
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button onClick={handleTestMeshSend} style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Send size={18} /> Send Test Encrypted Mesh Packet
        </button>
      </div>
    </div>
  );
};
