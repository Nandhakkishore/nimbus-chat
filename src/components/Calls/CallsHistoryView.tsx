import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, 
  Search, ShieldAlert, ShieldCheck, Clock, Plus, PhoneCall
} from 'lucide-react';
import { CallHistoryItem, User } from '../../types';

export const CallsHistoryView: React.FC = () => {
  const { callHistory, initiateCall, triggerIncomingCallSimulation, rooms } = useApp();
  const [filter, setFilter] = useState<'all' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = callHistory.filter(item => {
    if (filter === 'missed' && item.type !== 'missed') return false;
    if (searchQuery.trim()) {
      return item.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.user.phoneNumber.includes(searchQuery);
    }
    return true;
  });

  const formatDuration = (secs: number) => {
    if (!secs) return '';
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-chat)',
      overflowY: 'auto'
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '20px 28px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-header)',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={22} style={{ color: 'var(--accent-whatsapp)' }} />
            Encrypted Calls History
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Direct Peer-to-Peer WebRTC Calls with Biometric Deepfake Screening
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Incoming Call Simulation Button */}
          <button
            onClick={triggerIncomingCallSimulation}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: 'rgba(0, 168, 132, 0.15)',
              border: '1px solid rgba(0, 168, 132, 0.4)',
              color: 'var(--accent-whatsapp)',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Simulate incoming call to test real-time ringing & accept/decline"
          >
            <PhoneIncoming size={16} /> Test Incoming Call
          </button>
        </div>
      </div>

      {/* Sub-header Filter & Search */}
      <div style={{
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filter === 'all' ? 'rgba(0, 168, 132, 0.2)' : 'var(--bg-header)',
              color: filter === 'all' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            All Calls ({callHistory.length})
          </button>
          <button
            onClick={() => setFilter('missed')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: filter === 'missed' ? 'rgba(234, 134, 143, 0.2)' : 'var(--bg-header)',
              color: filter === 'missed' ? '#ea868f' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            Missed Calls ({callHistory.filter(c => c.type === 'missed').length})
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search calls by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 36px',
              borderRadius: '8px',
              background: 'var(--bg-header)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.825rem'
            }}
          />
        </div>
      </div>

      {/* Calls List */}
      <div style={{ flex: 1, padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredHistory.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <PhoneCall size={48} style={{ opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>No calls match your search or filter.</p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const isMissed = item.type === 'missed';
            const isIncoming = item.type === 'incoming';
            const hasRisk = (item.deepfakeRiskScore || 0) > 50;

            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  background: 'var(--bg-sidebar)',
                  border: hasRisk ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Contact Avatar & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={item.user.avatar} 
                      alt={item.user.displayName}
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    {hasRisk && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#f43f5e',
                        borderRadius: '50%',
                        padding: '2px',
                        color: '#fff'
                      }} title="High Synthetic Deepfake Risk Flag">
                        <ShieldAlert size={12} />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '0.925rem',
                      fontWeight: 700,
                      margin: '0 0 4px 0',
                      color: isMissed ? '#ea868f' : 'var(--text-primary)'
                    }}>
                      {item.user.displayName}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isMissed ? (
                          <PhoneMissed size={14} style={{ color: '#ea868f' }} />
                        ) : isIncoming ? (
                          <PhoneIncoming size={14} style={{ color: 'var(--accent-whatsapp)' }} />
                        ) : (
                          <PhoneOutgoing size={14} style={{ color: 'var(--accent-blue)' }} />
                        )}
                        <span style={{ textTransform: 'capitalize' }}>
                          {item.type} {item.isVideo ? 'Video' : 'Voice'}
                        </span>
                      </span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      {item.durationSeconds > 0 && (
                        <>
                          <span>•</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{formatDuration(item.durationSeconds)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Direct Call Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => initiateCall(item.user, false)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      border: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Start real-time voice call with ${item.user.displayName}`}
                  >
                    <Phone size={15} style={{ color: 'var(--accent-whatsapp)' }} /> Voice
                  </button>

                  <button
                    onClick={() => initiateCall(item.user, true)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 168, 132, 0.18)',
                      color: 'var(--accent-whatsapp)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid rgba(0, 168, 132, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Start real-time video call with ${item.user.displayName}`}
                  >
                    <Video size={15} /> Video Call
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
