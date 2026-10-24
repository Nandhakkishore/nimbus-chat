import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, ShieldCheck, QrCode, Phone, Video, Network, Globe, Users, 
  Image as ImageIcon, FileText, BellOff, UserX, Lock, UserPlus, Check, Trash2, Archive 
} from 'lucide-react';
import { User } from '../../types';

import { CountryCodePicker, COUNTRY_CODES, CountryCode } from '../Modals/CountryCodePicker';

export const ContactDetailsDrawer: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const { rooms, activeRoomId, openModal, blockContact, initiateCall, addMemberToRoom, deleteRoom, toggleArchiveRoom } = useApp();
  const [showAddInline, setShowAddInline] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const isGroup = activeRoom?.roomType === 'group' || activeRoom?.roomType === 'ephemeral';

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeRoomId) return;

    const fullPhone = `${selectedCountry.flag} ${selectedCountry.code} ${phoneDigits.trim()}`;

    const newMember: User = {
      id: `usr_${Date.now()}`,
      phoneNumber: fullPhone,
      displayName: newMemberName,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      about: 'Added to group chat via Country Code',
      trustScore: 80,
      reputationTier: 1,
      verifiedKeyQR: true,
      isBlocked: false,
      isUnknownSender: false,
      lastSeen: 'Just now',
      isOnline: true,
      passkeyEnabled: true,
      has2SV: true
    };

    addMemberToRoom(activeRoomId, newMember);
    setNewMemberName('');
    setPhoneDigits('');
    setShowAddInline(false);
  };

  return (
    <div style={{
      width: '360px',
      height: '100%',
      background: 'var(--bg-sidebar)',
      borderLeft: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'relative',
      overflowY: 'auto'
    }}>
      {/* Drawer Header */}
      <div style={{
        height: '60px',
        padding: '0 20px',
        background: 'var(--bg-header)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
        <span style={{ fontSize: '1rem', fontWeight: 700 }}>
          {isGroup ? 'Group Details & Members' : 'Contact Info'}
        </span>
      </div>

      {/* Profile Overview */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <img 
          src={isGroup ? (activeRoom?.avatar || user.avatar) : user.avatar} 
          alt={isGroup ? (activeRoom?.title || user.displayName) : user.displayName}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid var(--accent-whatsapp)',
            boxShadow: 'var(--shadow-md)'
          }}
        />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {isGroup ? activeRoom?.title : user.displayName}
            {user.verifiedKeyQR && <ShieldCheck size={18} style={{ color: 'var(--accent-whatsapp)' }} />}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {isGroup ? `${activeRoom?.members.length || 1} Group Participants` : user.phoneNumber}
          </p>
        </div>

        {/* Quick Action Buttons */}
        {!isGroup && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <button 
              onClick={() => initiateCall(user, false)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 168, 132, 0.15)',
                color: 'var(--accent-whatsapp)',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Phone size={16} /> Audio
            </button>

            <button 
              onClick={() => initiateCall(user, true)}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 168, 132, 0.15)',
                color: 'var(--accent-whatsapp)',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Video size={16} /> Video
            </button>
          </div>
        )}
      </div>

      {/* GROUP MEMBERS SECTION */}
      {isGroup && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} style={{ color: 'var(--accent-whatsapp)' }} /> Group Members ({activeRoom?.members.length})
            </span>
            <button 
              onClick={() => setShowAddInline(!showAddInline)}
              style={{
                color: 'var(--accent-whatsapp)',
                fontSize: '0.775rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <UserPlus size={14} /> Add Member
            </button>
          </div>

          {/* Inline Add Member Form */}
          {showAddInline && (
            <form onSubmit={handleAddMember} style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Participant Name" 
                required 
                value={newMemberName} 
                onChange={e => setNewMemberName(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.825rem' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <CountryCodePicker selected={selectedCountry} onSelect={setSelectedCountry} />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required
                  value={phoneDigits} 
                  onChange={e => setPhoneDigits(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.825rem' }}
                />
              </div>
              <button 
                type="submit" 
                style={{ padding: '8px', borderRadius: '6px', background: 'var(--accent-whatsapp)', color: '#fff', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Add Participant Now
              </button>
            </form>
          )}

          {/* Members List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeRoom?.members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={m.avatar} alt={m.displayName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{m.displayName}</p>
                  <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', margin: 0 }}>{m.phoneNumber}</p>
                </div>
                {m.trustScore >= 80 && <ShieldCheck size={14} style={{ color: 'var(--accent-whatsapp)' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About Section */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>About</span>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>{user.about}</p>
      </div>

      {/* INTEGRATED TRUST GRAPH CARD */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Network size={14} style={{ color: 'var(--accent-indigo)' }} /> Trust Context Graph
          </span>
          <span className="glass-pill badge-trust-high" style={{ fontSize: '0.7rem' }}>
            Score: {user.trustScore}/100
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Connection Distance:</span>
            <strong style={{ color: 'var(--text-primary)' }}>1st Degree Contact</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Shared Mutual Groups:</span>
            <strong style={{ color: 'var(--text-primary)' }}>3 Groups</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Account Verification:</span>
            <strong style={{ color: 'var(--accent-whatsapp)' }}>2SV + Hardware Passkey</strong>
          </div>
        </div>
      </div>

      {/* DEVICE KEY QR VERIFICATION CARD */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} style={{ color: 'var(--accent-purple)' }} /> Device Key Verification
          </span>
          <button onClick={() => openModal('key_verify')} style={{ color: 'var(--accent-purple)', fontSize: '0.75rem', fontWeight: 700 }}>
            Scan QR
          </button>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--accent-whatsapp)',
          background: 'rgba(0,0,0,0.3)',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          84920 38104 99120 44819
        </div>
      </div>

      {/* Block & Delete Actions */}
      <div style={{ padding: '16px 20px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={() => {
          if (activeRoomId) {
            toggleArchiveRoom(activeRoomId);
          }
        }} style={{
          width: '100%',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          background: activeRoom?.isArchived ? 'rgba(0, 168, 132, 0.2)' : 'rgba(255, 255, 255, 0.08)',
          border: activeRoom?.isArchived ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
          color: activeRoom?.isArchived ? 'var(--accent-whatsapp)' : 'var(--text-primary)',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Archive size={16} /> {activeRoom?.isArchived ? 'Unarchive Chat' : 'Archive Chat'}
        </button>

        <button onClick={() => blockContact(user.id)} style={{
          width: '100%',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(241, 92, 109, 0.12)',
          color: 'var(--accent-rose)',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <UserX size={16} /> Block {user.displayName}
        </button>

        <button onClick={() => {
          if (activeRoomId) {
            deleteRoom(activeRoomId);
            onClose();
          }
        }} style={{
          width: '100%',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          fontWeight: 700,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Trash2 size={16} /> Delete Chat & Contact
        </button>
      </div>
    </div>
  );
};

