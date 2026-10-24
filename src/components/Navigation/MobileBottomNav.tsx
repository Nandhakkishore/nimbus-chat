import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, PhoneCall, CircleDashed, Radio, ShieldCheck, Settings } from 'lucide-react';

export const MobileBottomNav: React.FC<{
  activeTab: 'chats' | 'calls' | 'status' | 'channels' | 'settings';
  setActiveTab: (tab: 'chats' | 'calls' | 'status' | 'channels' | 'settings') => void;
}> = ({ activeTab, setActiveTab }) => {
  const { openModal, callHistory } = useApp();
  const missedCount = callHistory.filter(c => c.type === 'missed').length;

  return (
    <div style={{
      height: '60px',
      background: 'var(--bg-header)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100
    }} className="mobile-bottom-bar">
      <button 
        onClick={() => setActiveTab('chats')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'chats' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
          fontSize: '0.675rem',
          fontWeight: 700
        }}
      >
        <MessageSquare size={20} />
        Chats
      </button>

      <button 
        onClick={() => setActiveTab('calls')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'calls' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
          fontSize: '0.675rem',
          fontWeight: 700,
          position: 'relative'
        }}
      >
        <PhoneCall size={20} />
        {missedCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ea868f'
          }} />
        )}
        Calls
      </button>

      <button 
        onClick={() => setActiveTab('status')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'status' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
          fontSize: '0.675rem',
          fontWeight: 700
        }}
      >
        <CircleDashed size={20} />
        Status
      </button>

      <button 
        onClick={() => openModal('safety_center')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: 'var(--accent-whatsapp)',
          fontSize: '0.675rem',
          fontWeight: 700
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(0, 168, 132, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <ShieldCheck size={18} />
        </div>
        Safety
      </button>

      <button 
        onClick={() => setActiveTab('channels')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'channels' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
          fontSize: '0.675rem',
          fontWeight: 700
        }}
      >
        <Radio size={20} />
        Channels
      </button>

      <button 
        onClick={() => setActiveTab('settings')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'settings' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
          fontSize: '0.675rem',
          fontWeight: 700
        }}
      >
        <Settings size={20} />
        Settings
      </button>
    </div>
  );
};
