import React, { useState } from 'react';
import { useApp, ColorTheme } from '../../context/AppContext';
import { 
  ShieldCheck, WifiOff, Scan, PhoneCall, QrCode, Bot, Activity, Server, Sun, Moon, LogOut, Network, Cpu, MoreVertical, Search, Phone, Video, Info, Palette, Check, ArrowLeftRight, UserCheck
} from 'lucide-react';

export const HeaderBar: React.FC<{ onToggleContactInfo: () => void; onOpenProfile?: () => void }> = ({ onToggleContactInfo, onOpenProfile }) => {
  const { 
    currentUser, theme, toggleTheme, colorTheme, setColorTheme, meshModeActive, toggleMeshMode, 
    scamRadarActive, toggleScamRadar, openModal, triggerIncomingCallSimulation, logout, rooms, activeRoomId, 
    initiateCall, switchUserProfile, isWsConnected, wsLatencyMs, onlineUserIds
  } = useApp();

  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const peerUser = activeRoom?.members.find(m => m.id !== currentUser.id);

  const themeOptions: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'emerald', label: 'WhatsApp Emerald', color: '#00a884' },
    { id: 'violet', label: 'Cyberpunk Violet', color: '#a55eea' },
    { id: 'sapphire', label: 'Sapphire Deep Blue', color: '#38ef7d' },
    { id: 'amber', label: 'Sunset Amber Gold', color: '#f59e0b' },
    { id: 'rose', label: 'Ruby Crimson Rose', color: '#f43f5e' },
    { id: 'light', label: 'Crisp Light Mode', color: '#008069' },
  ];

  return (
    <header style={{
      height: '60px',
      padding: '0 16px',
      background: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100,
      gap: '12px',
      flexShrink: 0,
      position: 'relative'
    }}>
      {/* Brand & Left User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div 
          onClick={onOpenProfile} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onOpenProfile ? 'pointer' : 'default' }}
          title="Edit Profile Settings"
        >
          <img 
            src={currentUser.avatar} 
            alt={currentUser.displayName}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--accent-whatsapp)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Human<span style={{ color: 'var(--accent-whatsapp)' }}>Link</span>
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* Safety & Trust Center Drawer Button */}
        <button 
          onClick={() => openModal('safety_center')} 
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(0, 168, 132, 0.15)',
            border: '1px solid rgba(0, 168, 132, 0.4)',
            color: 'var(--accent-whatsapp)',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Open HumanLink Safety & Differentiators Center"
        >
          <ShieldCheck size={16} />
          <span>Safety Center</span>
        </button>
      </div>

      {/* Center Peer Info if Chat Selected */}
      {activeRoom && (
        <div 
          onClick={onToggleContactInfo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            padding: '4px 12px',
            borderRadius: 'var(--radius-md)',
            transition: 'background var(--transition-fast)'
          }}
        >
          <img 
            src={activeRoom.avatar} 
            alt={activeRoom.title}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div>
            <h3 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {activeRoom.title}
              {activeRoom.keySafetyVerified && (
                <ShieldCheck size={14} style={{ color: 'var(--accent-whatsapp)' }} />
              )}
            </h3>
            {peerUser?.isOnline && (
              <p style={{ fontSize: '0.725rem', color: 'var(--accent-whatsapp)', margin: 0 }}>
                online
              </p>
            )}
          </div>
        </div>
      )}

      {/* Right Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Gateway WebSocket Status Badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: '16px',
          background: isWsConnected ? 'rgba(0, 168, 132, 0.15)' : 'rgba(234, 134, 143, 0.15)',
          border: isWsConnected ? '1px solid rgba(0, 168, 132, 0.3)' : '1px solid rgba(234, 134, 143, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.725rem',
          color: isWsConnected ? 'var(--accent-whatsapp)' : '#ea868f',
          fontWeight: 700
        }} title="WebSocket Real-Time Gateway Status">
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isWsConnected ? 'var(--accent-whatsapp)' : '#ea868f',
            boxShadow: isWsConnected ? '0 0 6px var(--accent-whatsapp)' : 'none'
          }} />
          <span>{isWsConnected ? `Gateway ${wsLatencyMs}ms` : 'Connecting...'}</span>
        </div>

        {/* Multi-Account Quick Switcher for Testing 2-Way Calls */}
        <button
          onClick={() => switchUserProfile(currentUser.id === 'usr_me_001' ? 'usr_marcus_02' : 'usr_me_001')}
          style={{
            padding: '5px 10px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            fontSize: '0.725rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
          title="Switch Active Account (Elena Rostova ⇄ Marcus Vance) to test 2-way real-time calls across two tabs"
        >
          <ArrowLeftRight size={13} style={{ color: 'var(--accent-whatsapp)' }} />
          <span>As: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.displayName.split(' ')[0]}</strong></span>
        </button>

        {peerUser && (
          <>
            <button 
              onClick={() => initiateCall(peerUser, false)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.08)'
              }} 
              title={`Start real-time voice call with ${peerUser.displayName}`}
            >
              <Phone size={15} style={{ color: 'var(--accent-whatsapp)' }} />
            </button>
            <button 
              onClick={() => initiateCall(peerUser, true)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(0, 168, 132, 0.2)',
                color: 'var(--accent-whatsapp)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(0, 168, 132, 0.35)',
                boxShadow: '0 2px 8px rgba(0, 168, 132, 0.2)'
              }} 
              title={`Start real-time video call with ${peerUser.displayName}`}
            >
              <Video size={16} />
              <span>Call</span>
            </button>
          </>
        )}

        <button onClick={onToggleContactInfo} style={{ color: 'var(--text-secondary)', padding: '6px', borderRadius: '50%' }} title="Contact Details">
          <Info size={18} />
        </button>

        {/* Theme Palette Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowThemeMenu(!showThemeMenu)} 
            style={{ 
              color: 'var(--accent-whatsapp)',
              padding: '6px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
            title="Change App Color Theme"
          >
            <Palette size={18} />
          </button>

          {showThemeMenu && (
            <div style={{
              position: 'absolute',
              top: '42px',
              right: 0,
              width: '210px',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: '8px',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '4px 8px', textTransform: 'uppercase' }}>
                App Color Theme
              </span>
              {themeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setColorTheme(opt.id);
                    setShowThemeMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: colorTheme === opt.id ? 'var(--bg-active)' : 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: colorTheme === opt.id ? 700 : 500,
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: opt.color,
                      display: 'inline-block',
                      boxShadow: '0 0 4px rgba(0,0,0,0.4)'
                    }} />
                    <span>{opt.label}</span>
                  </div>
                  {colorTheme === opt.id && <Check size={14} style={{ color: 'var(--accent-whatsapp)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={toggleTheme} style={{ color: 'var(--text-secondary)' }} title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          onClick={logout} 
          style={{ 
            padding: '6px 10px',
            borderRadius: '6px',
            background: 'rgba(234, 134, 143, 0.15)',
            color: '#ea868f',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }} 
          title="Log Out of HumanLink"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </header>
  );
};

