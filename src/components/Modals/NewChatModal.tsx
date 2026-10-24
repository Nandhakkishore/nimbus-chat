import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserPlus, Users, Clock, ShieldCheck, X, Check, UserCheck, Radio, AtSign, Globe, Lock, Bot, Link as LinkIcon, Zap, Volume2, Settings2
} from 'lucide-react';
import { ChatRoom, User } from '../../types';
import { CountryCodePicker, COUNTRY_CODES, CountryCode } from './CountryCodePicker';

export const NewChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, rooms, setRooms, activeRoomId, setActiveRoomId, addMemberToRoom } = useApp();

  const [mode, setMode] = useState<'direct' | 'group' | 'channel' | 'add_member'>('direct');
  const [inputMethod, setInputMethod] = useState<'phone' | 'username'>('phone');
  
  const [name, setName] = useState('');
  const [usernameInput, setUsernameInput] = useState('@');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // USA +1
  
  // Telegram-style Advanced Group/Channel Settings
  const [ephemeralTimerHours, setEphemeralTimerHours] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(activeRoomId || rooms[0]?.id || '');
  const [isEphemeralGroup, setIsEphemeralGroup] = useState(false);
  const [isPublicChannel, setIsPublicChannel] = useState(false);
  const [slowModeSeconds, setSlowModeSeconds] = useState<number>(0); // 0 = off, 10, 30, 60
  const [adminOnlyPosting, setAdminOnlyPosting] = useState(false);
  const [enableAIBotSentinel, setEnableAIBotSentinel] = useState(true);
  const [customPublicLink, setCustomPublicLink] = useState('');

  if (!isOpen) return null;

  const fullPhoneNumber = `${selectedCountry.flag} ${selectedCountry.code} ${phoneDigits.trim()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && inputMethod === 'phone' && mode !== 'channel') return;

    const contactDisplayName = name.trim() || (inputMethod === 'username' ? usernameInput : `User ${phoneDigits}`);
    const contactPhoneNumber = inputMethod === 'phone' ? fullPhoneNumber : `${selectedCountry.code} (${usernameInput})`;

    if (mode === 'add_member') {
      const targetRoomId = selectedRoomId || activeRoomId;
      if (!targetRoomId) return;

      const newMember: User = {
        id: `usr_${Date.now()}`,
        phoneNumber: contactPhoneNumber,
        displayName: contactDisplayName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        about: inputMethod === 'username' ? `Telegram Handle: ${usernameInput}` : 'Added via E.164 Country Code',
        trustScore: 88,
        reputationTier: 1,
        verifiedKeyQR: true,
        isBlocked: false,
        isUnknownSender: false,
        lastSeen: 'Just now',
        isOnline: true,
        passkeyEnabled: true,
        has2SV: true
      };

      addMemberToRoom(targetRoomId, newMember);
      setActiveRoomId(targetRoomId);
      resetForm();
      onClose();
      return;
    }

    const newId = `room_custom_${Date.now()}`;
    
    if (mode === 'direct') {
      const newPeer: User = {
        id: `usr_${Date.now()}`,
        phoneNumber: contactPhoneNumber,
        displayName: contactDisplayName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        about: inputMethod === 'username' ? `Verified Username: ${usernameInput}` : 'Hey there! I am using HumanLink.',
        trustScore: 78,
        reputationTier: 1,
        verifiedKeyQR: true,
        isBlocked: false,
        isUnknownSender: false,
        lastSeen: 'Just now',
        isOnline: true,
        passkeyEnabled: true,
        has2SV: true
      };

      const newRoom: ChatRoom = {
        id: newId,
        title: contactDisplayName,
        roomType: 'direct',
        avatar: newPeer.avatar,
        members: [currentUser, newPeer],
        unreadCount: 0,
        isEphemeral: false,
        keySafetyVerified: true
      };

      setRooms((prev: ChatRoom[]) => [newRoom, ...prev]);
      setActiveRoomId(newId);
    } else if (mode === 'channel') {
      // Telegram-Style Broadcast Channel
      const botMember: User = {
        id: 'bot_ai_sentinel',
        phoneNumber: '🤖 AI Sentinel Bot',
        displayName: 'HumanLink AI Sentinel Bot',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        about: 'Automated Scam Detector & Channel Moderator Bot',
        trustScore: 100,
        reputationTier: 2,
        verifiedKeyQR: true,
        isBlocked: false,
        isUnknownSender: false,
        lastSeen: 'Always Online',
        isOnline: true,
        passkeyEnabled: true,
        has2SV: true
      };

      const channelRoom: ChatRoom = {
        id: newId,
        title: `📢 Channel: ${name}`,
        roomType: 'channel',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        members: enableAIBotSentinel ? [currentUser, botMember] : [currentUser],
        unreadCount: 0,
        isEphemeral: false,
        keySafetyVerified: true
      };

      setRooms((prev: ChatRoom[]) => [channelRoom, ...prev]);
      setActiveRoomId(newId);
    } else {
      // Group Room
      const ttlSeconds = ephemeralTimerHours * 3600;
      const groupRoom: ChatRoom = {
        id: newId,
        title: isEphemeralGroup ? `⚡ Secret Group: ${name}` : `👥 Group: ${name}`,
        roomType: isEphemeralGroup ? 'ephemeral' : 'group',
        avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80',
        members: [currentUser],
        unreadCount: 0,
        isEphemeral: isEphemeralGroup,
        ephemeralTtlSeconds: isEphemeralGroup ? ttlSeconds : undefined,
        ephemeralExpiresAt: isEphemeralGroup ? Date.now() + ttlSeconds * 1000 : undefined
      };

      setRooms((prev: ChatRoom[]) => [groupRoom, ...prev]);
      setActiveRoomId(newId);
    }

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPhoneDigits('');
    setUsernameInput('@');
  };

  const groupRooms = rooms.filter(r => r.roomType === 'group' || r.roomType === 'ephemeral');

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
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        background: 'var(--bg-sidebar)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: mode === 'channel' ? 'rgba(165, 94, 234, 0.2)' : 'rgba(0, 168, 132, 0.18)',
            color: mode === 'channel' ? 'var(--accent-purple)' : 'var(--accent-whatsapp)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {mode === 'add_member' ? <UserCheck size={24} /> : mode === 'group' ? <Users size={24} /> : mode === 'channel' ? <Radio size={24} /> : <UserPlus size={24} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {mode === 'add_member' ? 'Add Participant' : mode === 'group' ? 'Create Telegram Group' : mode === 'channel' ? 'Create Broadcast Channel' : 'New E2EE Direct Chat'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              {mode === 'channel' ? 'Broadcast messages to unlimited subscribers (Telegram feature).' : 'Add contacts by country code or Telegram @username handle.'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => setMode('direct')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: mode === 'direct' ? 'var(--bg-header)' : 'transparent',
              color: mode === 'direct' ? 'var(--accent-whatsapp)' : 'var(--text-muted)'
            }}
          >
            1:1 Chat
          </button>
          <button
            type="button"
            onClick={() => setMode('group')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: mode === 'group' ? 'var(--bg-header)' : 'transparent',
              color: mode === 'group' ? 'var(--accent-whatsapp)' : 'var(--text-muted)'
            }}
          >
            Group Chat
          </button>
          <button
            type="button"
            onClick={() => setMode('channel')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: mode === 'channel' ? 'var(--bg-header)' : 'transparent',
              color: mode === 'channel' ? 'var(--accent-purple)' : 'var(--text-muted)'
            }}
          >
            Channel 📢
          </button>
          <button
            type="button"
            onClick={() => setMode('add_member')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              background: mode === 'add_member' ? 'var(--bg-header)' : 'transparent',
              color: mode === 'add_member' ? 'var(--accent-amber)' : 'var(--text-muted)'
            }}
          >
            Add Member
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Group Selector (for Add Member mode) */}
          {mode === 'add_member' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Target Group Room
              </label>
              <select
                value={selectedRoomId}
                onChange={e => setSelectedRoomId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  marginTop: '6px'
                }}
              >
                {groupRooms.map(g => (
                  <option key={g.id} value={g.id} style={{ background: '#111b21' }}>
                    {g.title} ({g.members.length} members)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name / Title Field */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {mode === 'group' ? 'Group Name' : mode === 'channel' ? 'Channel Name' : 'Display Name'}
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={
                mode === 'group' ? 'e.g. SF Tech Founders' : 
                mode === 'channel' ? 'e.g. Crypto & AI Announcements' : 
                'e.g. Sarah Jenkins'
              }
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
                marginTop: '6px'
              }}
            />
          </div>

          {/* TELEGRAM INPUT METHOD SWITCHER (Phone vs Username Handle) */}
          {(mode === 'direct' || mode === 'add_member') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Add Contact By:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setInputMethod('phone')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: inputMethod === 'phone' ? 'var(--accent-whatsapp)' : 'rgba(0,0,0,0.3)',
                      color: inputMethod === 'phone' ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    Country Code & Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMethod('username')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: inputMethod === 'username' ? 'var(--accent-purple)' : 'rgba(0,0,0,0.3)',
                      color: inputMethod === 'username' ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <AtSign size={12} /> Telegram @username
                  </button>
                </div>
              </div>

              {inputMethod === 'phone' ? (
                /* COUNTRY CODE SELECTOR + PHONE DIGITS INPUT */
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <CountryCodePicker selected={selectedCountry} onSelect={setSelectedCountry} />
                  
                  <input 
                    type="tel"
                    required
                    value={phoneDigits}
                    onChange={e => setPhoneDigits(e.target.value)}
                    placeholder="Mobile number (e.g. 555 0192)"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              ) : (
                /* TELEGRAM @USERNAME SEARCH INPUT */
                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <input 
                    type="text"
                    required
                    value={usernameInput}
                    onChange={e => {
                      const val = e.target.value;
                      setUsernameInput(val.startsWith('@') ? val : `@${val}`);
                    }}
                    placeholder="@username (e.g. @marcus_vance)"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(165, 94, 234, 0.1)',
                      border: '1px solid var(--accent-purple)',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  />
                  <AtSign size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--accent-purple)' }} />
                </div>
              )}
            </div>
          )}

          {/* TELEGRAM GROUP & CHANNEL ADVANCED FEATURES */}
          {(mode === 'group' || mode === 'channel') && (
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-whatsapp)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings2 size={14} /> Telegram Governance & Protection
              </span>

              {mode === 'group' && (
                <>
                  {/* Ephemeral / Secret Group Toggle */}
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={isEphemeralGroup} 
                      onChange={e => setIsEphemeralGroup(e.target.checked)} 
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Zap size={14} style={{ color: 'var(--accent-amber)' }} />
                      Make Secret Ephemeral Group (Self-destructing)
                    </span>
                  </label>

                  {isEphemeralGroup && (
                    <div>
                      <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Message TTL Expiry: <strong>{ephemeralTimerHours} Hour{ephemeralTimerHours > 1 ? 's' : ''}</strong>
                      </label>
                      <input 
                        type="range" min={1} max={24} value={ephemeralTimerHours} 
                        onChange={e => setEphemeralTimerHours(parseInt(e.target.value))}
                        style={{ marginTop: '6px', width: '100%' }}
                      />
                    </div>
                  )}

                  {/* Telegram Slow Mode Option */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Telegram Slow Mode (Rate Limit):
                    </label>
                    <select
                      value={slowModeSeconds}
                      onChange={e => setSlowModeSeconds(parseInt(e.target.value))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-header)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.775rem'
                      }}
                    >
                      <option value={0}>Off (No Delay)</option>
                      <option value={10}>10 Seconds Delay</option>
                      <option value={30}>30 Seconds Delay</option>
                      <option value={60}>60 Seconds Delay</option>
                    </select>
                  </div>
                </>
              )}

              {/* Public Channel / Invitation Link Feature */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isPublicChannel} 
                    onChange={e => setIsPublicChannel(e.target.checked)} 
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} style={{ color: 'var(--accent-indigo)' }} />
                    Generate Telegram Public Link (`t.me/humanlink_...`)
                  </span>
                </label>

                {isPublicChannel && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>t.me/</span>
                    <input 
                      type="text" 
                      placeholder="custom_group_handle" 
                      value={customPublicLink}
                      onChange={e => setCustomPublicLink(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-header)',
                        border: '1px solid var(--accent-whatsapp)',
                        color: 'var(--text-primary)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Telegram AI Sentinel Bot */}
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={enableAIBotSentinel} 
                  onChange={e => setEnableAIBotSentinel(e.target.checked)} 
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bot size={14} style={{ color: 'var(--accent-emerald)' }} />
                  Add AI Sentinel Bot (Scam & Link Security)
                </span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" style={{
            padding: '14px',
            borderRadius: 'var(--radius-md)',
            background: mode === 'channel' ? 'var(--accent-purple)' : 'var(--accent-whatsapp)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <ShieldCheck size={18} /> 
            {mode === 'add_member' ? 'Add Participant' : mode === 'group' ? 'Create Telegram Group' : mode === 'channel' ? 'Create Broadcast Channel' : 'Start E2EE Conversation'}
          </button>
        </form>
      </div>
    </div>
  );
};
