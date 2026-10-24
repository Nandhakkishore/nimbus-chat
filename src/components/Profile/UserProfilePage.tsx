import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Camera, Edit2, Check, ShieldCheck, Phone, Info, Lock, Eye, Bell, Globe, ArrowLeft, Upload, Link as LinkIcon, Radio, ToggleLeft, ToggleRight, Sparkles, User, Smile, Clock, EyeOff, CheckCircle2, RefreshCw, Trash2, Shield, Zap, Award
} from 'lucide-react';

export const UserProfilePage: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, updateCurrentUser } = useApp();

  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [aboutText, setAboutText] = useState(currentUser.about);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [isOnline, setIsOnline] = useState<boolean>(currentUser.isOnline !== undefined ? currentUser.isOnline : true);
  
  // Customization extension states
  const [avatarFrame, setAvatarFrame] = useState<'emerald' | 'violet' | 'amber' | 'cyber'>('emerald');
  const [selectedEmoji, setSelectedEmoji] = useState('🔒');
  const [statusExpiry, setStatusExpiry] = useState<'never' | '1h' | '4h' | '24h'>('never');
  const [bioPrivacy, setBioPrivacy] = useState<'everyone' | 'contacts' | 'nobody'>('everyone');
  const [selectedRoleBadge, setSelectedRoleBadge] = useState<string>('🛡️ Verified Human');

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'avatar' | 'preview'>('profile');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusEmojis = ['☕', '✨', '🌅', '📚', '🎧', '🍕', '🏖️', '✈️', '🏋️‍♂️', '🌙', '💫', '💼', '🔒', '⚡'];

  const statusPresets = [
    'Living life one cup of coffee at a time ☕',
    'Chasing sunsets & good vibes 🌅',
    'Currently in my main character era ✨',
    'Deep focus mode • Replies might be slow 🎧',
    'Do not disturb: lost in a good book 📚',
    'On a quest to find the best food in town 🍕',
    'At the gym • Pushing limits 🏋️‍♂️',
    'Mind somewhere on a beach 🏖️',
    'Exploring the world • Travelling ✈️',
    'Sleeping / Do Not Disturb 🌙',
    'Making memories & keeping it simple 💫',
    'If urgent, call twice 📞'
  ];

  const roleBadges = [
    '✨ Explorer',
    '☕ Coffee Lover',
    '🎧 Music Enthusiast',
    '🎨 Creative Spirit',
    '🏋️ Fitness Buff',
    '✈️ Globe Trotter',
    '🌱 Mindful Soul',
    '🛡️ Verified Friend'
  ];

  const presetAvatars = [
    { title: 'Marcus (Tech)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
    { title: 'Elena (Dev)', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80' },
    { title: 'Sophia (Design)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
    { title: 'Alex (Security)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
    { title: 'Maya (Founder)', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' },
    { title: 'Default Shield', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80' }
  ];

  const frameStyles: Record<string, { border: string; glow: string; name: string }> = {
    emerald: { border: '4px solid var(--accent-whatsapp)', glow: '0 0 16px rgba(0, 168, 132, 0.4)', name: 'WhatsApp Emerald' },
    violet: { border: '4px solid #a55eea', glow: '0 0 16px rgba(165, 94, 234, 0.4)', name: 'Cyberpunk Violet' },
    amber: { border: '4px solid #f59e0b', glow: '0 0 16px rgba(245, 158, 11, 0.4)', name: 'Amber Gold' },
    cyber: { border: '4px solid #00f2fe', glow: '0 0 18px rgba(0, 242, 254, 0.5)', name: 'Cyber Cyan' }
  };

  const handleSave = (newAvatar?: string, newOnlineState?: boolean) => {
    const finalAvatar = newAvatar || avatar;
    const finalOnline = newOnlineState !== undefined ? newOnlineState : isOnline;

    updateCurrentUser({
      displayName,
      about: aboutText.startsWith(selectedEmoji) ? aboutText : `${selectedEmoji} ${aboutText}`,
      avatar: finalAvatar,
      isOnline: finalOnline
    });

    setIsEditingName(false);
    setIsEditingAbout(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgData = event.target.result as string;
          setAvatar(imgData);
          handleSave(imgData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setAvatar(customUrl);
      handleSave(customUrl);
      setShowUrlInput(false);
      setCustomUrl('');
    }
  };

  const toggleActiveStatus = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    handleSave(undefined, nextState);
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      background: 'var(--bg-chat)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Top Header Bar */}
      <div style={{
        height: '90px',
        background: 'var(--bg-header)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onClose} 
            style={{ 
              color: 'var(--text-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)'
            }}
          >
            <ArrowLeft size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Back to Chats</span>
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Personalized Profile Settings</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Customize your identity, avatar, status & bio</p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-sidebar)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveSubTab('profile')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: activeSubTab === 'profile' ? 'var(--accent-whatsapp)' : 'transparent',
              color: activeSubTab === 'profile' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <User size={14} /> Profile & Bio
          </button>

          <button
            onClick={() => setActiveSubTab('avatar')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: activeSubTab === 'avatar' ? 'var(--accent-whatsapp)' : 'transparent',
              color: activeSubTab === 'avatar' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Camera size={14} /> Avatar Studio
          </button>

          <button
            onClick={() => setActiveSubTab('preview')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: activeSubTab === 'preview' ? 'var(--accent-whatsapp)' : 'transparent',
              color: activeSubTab === 'preview' ? '#ffffff' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> Live Card Preview
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '24px auto', width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Hidden File Input for Photo Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
        />

        {/* HERO PROFILE HEADER CARD */}
        <div style={{
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--bg-sidebar) 0%, rgba(0, 168, 132, 0.08) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Avatar with dynamic frame */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            <img 
              src={avatar} 
              alt={displayName}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: frameStyles[avatarFrame].border,
                boxShadow: frameStyles[avatarFrame].glow,
                transition: 'all var(--transition-fast)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--accent-whatsapp)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)'
            }} title="Change Profile Photo">
              <Camera size={16} />
            </div>

            {/* Online Status Dot Indicator */}
            {isOnline && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#38ef7d',
                border: '2px solid var(--bg-sidebar)',
                boxShadow: '0 0 6px rgba(0,0,0,0.5)'
              }} title="Active Online" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {displayName}
              </h3>
              <span className="glass-pill badge-trust-high" style={{ fontSize: '0.7rem' }}>
                {selectedRoleBadge}
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{selectedEmoji}</span> {aboutText || 'No bio status set yet.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                🇺🇸 {currentUser.phoneNumber}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-whatsapp)', fontWeight: 700 }}>
                • Trust Score: {currentUser.trustScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* TAB 1: PROFILE & BIO EDITING */}
        {activeSubTab === 'profile' && (
          <>
            {/* Display Name Section */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-whatsapp)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Your Display Name
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingName ? (
                  <input 
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-header)',
                      border: '1px solid var(--accent-whatsapp)',
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}
                    autoFocus
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {displayName}
                  </span>
                )}

                <button 
                  onClick={() => isEditingName ? handleSave() : setIsEditingName(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isEditingName ? 'var(--accent-whatsapp)' : 'rgba(0, 168, 132, 0.15)',
                    color: isEditingName ? '#fff' : 'var(--accent-whatsapp)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isEditingName ? <Check size={16} /> : <Edit2 size={16} />}
                  {isEditingName ? 'Save' : 'Edit Name'}
                </button>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                This is not a username. This name will be visible to your contacts and verified callers.
              </p>
            </div>

            {/* About & Bio Status Section */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-whatsapp)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  About & Status Bio
                </span>
                <span style={{ fontSize: '0.725rem', color: aboutText.length > 130 ? '#f59e0b' : 'var(--text-muted)' }}>
                  {aboutText.length} / 150 characters
                </span>
              </div>

              {/* Status Emoji Selector & Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Choose Status Emoji:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {statusEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: selectedEmoji === emoji ? 'rgba(0, 168, 132, 0.25)' : 'var(--bg-header)',
                        border: selectedEmoji === emoji ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingAbout ? (
                  <textarea 
                    value={aboutText}
                    maxLength={150}
                    onChange={e => setAboutText(e.target.value)}
                    rows={2}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-header)',
                      border: '1px solid var(--accent-whatsapp)',
                      fontSize: '0.925rem',
                      color: 'var(--text-primary)',
                      resize: 'none'
                    }}
                    autoFocus
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {selectedEmoji} {aboutText}
                  </span>
                )}

                <button 
                  onClick={() => isEditingAbout ? handleSave() : setIsEditingAbout(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: isEditingAbout ? 'var(--accent-whatsapp)' : 'rgba(0, 168, 132, 0.15)',
                    color: isEditingAbout ? '#fff' : 'var(--accent-whatsapp)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isEditingAbout ? <Check size={16} /> : <Edit2 size={16} />}
                  {isEditingAbout ? 'Save Bio' : 'Edit Bio'}
                </button>
              </div>

              {/* Preset Quick Status Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick preset bio lines:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {statusPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAboutText(preset);
                        updateCurrentUser({ about: preset });
                        setSavedSuccess(true);
                        setTimeout(() => setSavedSuccess(false), 2000);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        background: aboutText === preset ? 'rgba(0, 168, 132, 0.2)' : 'var(--bg-header)',
                        border: aboutText === preset ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                        color: aboutText === preset ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Role & Mood Badges Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Role & Identity Badge:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {roleBadges.map(badge => (
                    <button
                      key={badge}
                      onClick={() => setSelectedRoleBadge(badge)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: selectedRoleBadge === badge ? 'var(--accent-whatsapp)' : 'var(--bg-header)',
                        color: selectedRoleBadge === badge ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {badge}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ONLINE ACTIVE STATUS TOGGLE */}
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isOnline ? 'rgba(56, 239, 125, 0.15)' : 'rgba(134, 150, 160, 0.15)',
                  color: isOnline ? '#38ef7d' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Radio size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Online Active Status
                    {isOnline && (
                      <span className="glass-pill badge-trust-high" style={{ fontSize: '0.7rem' }}>
                        Online
                      </span>
                    )}
                  </h4>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    {isOnline ? 'Contacts see your green online status.' : 'Status hidden. You appear offline.'}
                  </p>
                </div>
              </div>

              <button 
                onClick={toggleActiveStatus}
                style={{ color: isOnline ? 'var(--accent-whatsapp)' : 'var(--text-muted)', cursor: 'pointer', background: 'transparent' }}
                title="Toggle Active Online Status"
              >
                {isOnline ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
              </button>
            </div>

            {/* BIO PRIVACY & STATUS EXPIRY SETTINGS */}
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-whatsapp)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Privacy & Expiry Governance
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Who can see Bio */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>Who can see my Bio:</label>
                  <select 
                    value={bioPrivacy}
                    onChange={e => setBioPrivacy(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-header)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.825rem'
                    }}
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">My Contacts Only</option>
                    <option value="nobody">Nobody (Private)</option>
                  </select>
                </div>

                {/* Status Expiry Timer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status Expiry Timer:</label>
                  <select 
                    value={statusExpiry}
                    onChange={e => setStatusExpiry(e.target.value as any)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-header)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.825rem'
                    }}
                  >
                    <option value="never">Keep Indefinitely</option>
                    <option value="1h">Clear in 1 Hour</option>
                    <option value="4h">Clear in 4 Hours</option>
                    <option value="24h">Clear in 24 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: AVATAR STUDIO & FRAMES */}
        {activeSubTab === 'avatar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Upload Buttons */}
            <div style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Custom Photo Upload</h4>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 168, 132, 0.15)',
                    border: '1px dashed var(--accent-whatsapp)',
                    color: 'var(--accent-whatsapp)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Upload size={18} /> Upload Image File
                </button>

                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-header)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LinkIcon size={18} /> Enter Image URL
                </button>
              </div>

              {/* URL Input Form */}
              {showUrlInput && (
                <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input 
                    type="url" 
                    placeholder="https://example.com/my-photo.jpg" 
                    value={customUrl} 
                    onChange={e => setCustomUrl(e.target.value)} 
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-header)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.875rem' }} 
                  />
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--accent-whatsapp)', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                    Apply Photo
                  </button>
                </form>
              )}
            </div>

            {/* Avatar Frame Selector */}
            <div style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Avatar Ring & Frame Styles</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                {Object.keys(frameStyles).map((key) => {
                  const fKey = key as 'emerald' | 'violet' | 'amber' | 'cyber';
                  const frame = frameStyles[fKey];
                  return (
                    <button
                      key={key}
                      onClick={() => setAvatarFrame(fKey)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: avatarFrame === fKey ? 'rgba(0, 168, 132, 0.15)' : 'var(--bg-header)',
                        border: avatarFrame === fKey ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: frame.border,
                        boxShadow: frame.glow,
                        background: '#111b21'
                      }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {frame.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preset Avatars Library */}
            <div style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-sidebar)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Curated Preset Avatars</h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '12px' }}>
                {presetAvatars.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setAvatar(item.url);
                      handleSave(item.url);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      background: avatar === item.url ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
                      border: avatar === item.url ? '1px solid var(--accent-whatsapp)' : '1px solid transparent'
                    }}
                  >
                    <img 
                      src={item.url} 
                      alt={item.title} 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE CONTACT CARD PREVIEW */}
        {activeSubTab === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0, 168, 132, 0.1)',
              border: '1px solid rgba(0, 168, 132, 0.3)',
              color: 'var(--accent-whatsapp)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Sparkles size={20} />
              <span>This is how your contacts see your profile in chats, calls & contact info popups:</span>
            </div>

            {/* Simulated Chat Header Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                1. Chat Header Preview
              </span>
              <div style={{
                height: '60px',
                background: 'var(--bg-header)',
                padding: '0 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img 
                  src={avatar} 
                  alt={displayName} 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: frameStyles[avatarFrame].border }} 
                />
                <div>
                  <h4 style={{ fontSize: '0.925rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{displayName}</h4>
                  {isOnline && <p style={{ fontSize: '0.725rem', color: 'var(--accent-whatsapp)', margin: 0 }}>online</p>}
                </div>
              </div>
            </div>

            {/* Simulated Contact Details Card Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                2. Contact Info Drawer Preview
              </span>
              <div style={{
                padding: '24px',
                background: 'var(--bg-sidebar)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center'
              }}>
                <img 
                  src={avatar} 
                  alt={displayName} 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: frameStyles[avatarFrame].border, boxShadow: frameStyles[avatarFrame].glow }} 
                />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{displayName}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>🇺🇸 {currentUser.phoneNumber}</p>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--bg-header)', border: '1px solid var(--border-color)', width: '100%' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedEmoji} {aboutText}</span>
                </div>
                <span className="glass-pill badge-trust-high" style={{ fontSize: '0.75rem' }}>
                  {selectedRoleBadge} • Trust Score 100%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert Feedback Toast */}
        {savedSuccess && (
          <div style={{ 
            padding: '14px 18px', 
            borderRadius: '10px', 
            background: 'rgba(0, 168, 132, 0.2)', 
            border: '1px solid var(--accent-whatsapp)',
            color: 'var(--accent-whatsapp)', 
            textAlign: 'center', 
            fontWeight: 700, 
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <CheckCircle2 size={20} />
            <span>Profile photo, bio & custom identity synced in real-time!</span>
          </div>
        )}
      </div>
    </div>
  );
};
