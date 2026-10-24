import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageSquare, PhoneCall, CircleDashed, Radio, ShieldCheck, Settings, User as UserIcon, Sun, Moon, LogOut, Plus, Server 
} from 'lucide-react';

export const LeftSidebarNav: React.FC<{ 
  activeTab: 'chats' | 'calls' | 'status' | 'channels' | 'settings' | 'profile' | 'admin'; 
  setActiveTab: (tab: 'chats' | 'calls' | 'status' | 'channels' | 'settings' | 'profile' | 'admin') => void;
  onOpenNewChat: () => void;
}> = ({ activeTab, setActiveTab, onOpenNewChat }) => {
  const { currentUser, theme, toggleTheme, openModal, logout, isAdmin, callHistory } = useApp();

  const missedCallsCount = callHistory.filter(c => c.type === 'missed').length;

  return (
    <div style={{
      width: '64px',
      height: '100%',
      background: 'var(--bg-header)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0',
      gap: '20px',
      flexShrink: 0,
      zIndex: 20
    }}>
      {/* Top Main Navigation Icons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        {/* Chats Tab */}
        <button 
          onClick={() => setActiveTab('chats')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'chats' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
            color: activeTab === 'chats' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
          title="Chats"
        >
          <MessageSquare size={20} />
        </button>

        {/* Calls Tab */}
        <button 
          onClick={() => setActiveTab('calls')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'calls' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
            color: activeTab === 'calls' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
            position: 'relative'
          }}
          title="Voice & Video Calls"
        >
          <PhoneCall size={20} />
          {missedCallsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ea868f',
              border: '2px solid var(--bg-header)'
            }} />
          )}
        </button>

        {/* Status / Stories Tab */}
        <button 
          onClick={() => setActiveTab('status')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'status' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
            color: activeTab === 'status' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
          title="Status Updates (Stories)"
        >
          <CircleDashed size={20} />
        </button>

        {/* Channels Tab */}
        <button 
          onClick={() => setActiveTab('channels')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'channels' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
            color: activeTab === 'channels' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
          title="Broadcast Channels"
        >
          <Radio size={20} />
        </button>

        {/* New Chat FAB */}
        <button 
          onClick={onOpenNewChat}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)'
          }}
          title="New Chat or Group"
        >
          <Plus size={22} />
        </button>
      </div>

      {/* Middle Security Center Button */}
      <div style={{ margin: 'auto 0 0 0', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
        <button 
          onClick={() => openModal('safety_center')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(0, 168, 132, 0.15)',
            border: '1px solid rgba(0, 168, 132, 0.4)',
            color: 'var(--accent-emerald)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="HumanLink Safety & Trust Center"
        >
          <ShieldCheck size={20} />
        </button>

        {/* Admin Console Tab - ONLY VISIBLE TO ADMIN ACCOUNTS */}
        {isAdmin && (
          <button 
            onClick={() => setActiveTab('admin')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'admin' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
              color: activeTab === 'admin' ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Admin Management Console"
          >
            <Server size={20} />
          </button>
        )}

        {/* Settings Tab */}
        <button 
          onClick={() => setActiveTab('settings')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'settings' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
            color: activeTab === 'settings' ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Settings & Security"
        >
          <Settings size={20} />
        </button>

        {/* User Profile Avatar */}
        <img 
          src={currentUser.avatar}
          alt={currentUser.displayName}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: activeTab === 'profile' ? '3px solid var(--accent-whatsapp)' : '2px solid var(--accent-emerald)',
            boxShadow: activeTab === 'profile' ? '0 0 10px rgba(0, 168, 132, 0.6)' : 'none',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onClick={() => setActiveTab('profile')}
          title="My Profile & Bio Settings"
        />
      </div>
    </div>
  );
};
