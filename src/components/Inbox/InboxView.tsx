import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ShieldCheck, Clock, Radio, Archive, Filter, CheckCheck, Trash2, ArrowLeft, ArchiveRestore, Pin } from 'lucide-react';
import { RoomType } from '../../types';

export const InboxView: React.FC<{ onSelectRoom?: () => void }> = ({ onSelectRoom }) => {
  const { rooms, activeRoomId, setActiveRoomId, openModal, blockContact, deleteRoom, toggleArchiveRoom, togglePinRoom } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPill, setFilterPill] = useState<'all' | 'unread' | 'favorites' | 'groups' | 'pinned'>('all');
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  const archivedCount = rooms.filter(r => r.isArchived).length;

  const filteredRooms = rooms.filter(room => {
    if (showArchivedOnly) {
      if (!room.isArchived) return false;
    } else {
      if (room.isArchived) return false;
    }

    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterPill === 'unread') return room.unreadCount > 0;
    if (filterPill === 'pinned') return !!room.isPinned;
    if (filterPill === 'groups') return room.roomType === 'group' || room.roomType === 'ephemeral';
    return true;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="inbox-container" style={{
      width: '380px',
      height: '100%',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-sidebar)',
      flexShrink: 0
    }}>
      {/* 1. Search Bar & Filter Pills */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-sidebar)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder={showArchivedOnly ? "Search archived chats..." : "Search or start new chat"}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px 8px 40px',
              borderRadius: '8px',
              background: 'var(--bg-header)',
              border: 'none',
              fontSize: '0.875rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* WhatsApp Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'pinned', label: '📌 Pinned' },
            { id: 'favorites', label: 'Favorites' },
            { id: 'groups', label: 'Groups' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => setFilterPill(pill.id as any)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.775rem',
                fontWeight: 600,
                background: filterPill === pill.id ? 'rgba(0, 168, 132, 0.2)' : 'var(--bg-header)',
                color: filterPill === pill.id ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Archived Row or Back Navigation */}
      {showArchivedOnly ? (
        <div 
          onClick={() => setShowArchivedOnly(false)}
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0, 168, 132, 0.1)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--accent-whatsapp)'
          }}
        >
          <ArrowLeft size={18} />
          <span>Archived Chats ({archivedCount})</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Back to All Chats
          </span>
        </div>
      ) : (
        <div 
          onClick={() => setShowArchivedOnly(true)}
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderBottom: '1px solid var(--border-color)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            transition: 'background var(--transition-fast)'
          }}
        >
          <Archive size={18} style={{ color: 'var(--accent-whatsapp)' }} />
          <span>Archived</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.775rem', color: 'var(--accent-whatsapp)', fontWeight: 700, background: 'rgba(0, 168, 132, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
            {archivedCount}
          </span>
        </div>
      )}

      {/* 3. Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {filteredRooms.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {showArchivedOnly ? 'No archived chats.' : 'No chats match filter.'}
          </div>
        ) : (
          filteredRooms.map(room => {
            const isActive = room.id === activeRoomId;
            const peerUser = room.members.find(m => m.id !== 'usr_me_001');
            const hasScamWarning = room.lastMessage?.scamAnalysis?.isSuspicious;
            const isHovered = hoveredRoomId === room.id;

            return (
              <div
                key={room.id}
                onClick={() => {
                  setActiveRoomId(room.id);
                  onSelectRoom?.();
                }}
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(134, 150, 160, 0.08)',
                  background: isActive ? 'var(--bg-active)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                  position: 'relative'
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img 
                    src={room.avatar} 
                    alt={room.title}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  {peerUser?.isOnline && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'var(--accent-whatsapp)',
                      border: '2px solid var(--bg-sidebar)'
                    }} />
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {room.title}
                      </span>
                      {room.isPinned && (
                        <Pin size={13} style={{ color: 'var(--accent-whatsapp)', flexShrink: 0, transform: 'rotate(45deg)' }} />
                      )}
                      {room.keySafetyVerified && (
                        <ShieldCheck size={15} style={{ color: 'var(--accent-whatsapp)', flexShrink: 0 }} />
                      )}
                      {room.isEphemeral && (
                        <Clock size={13} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.725rem', color: room.unreadCount > 0 ? 'var(--accent-whatsapp)' : 'var(--text-muted)', fontWeight: room.unreadCount > 0 ? 700 : 400 }}>
                        {room.lastMessage?.timestamp}
                      </span>
                      {room.isPinned && (
                        <span style={{ fontSize: '11px' }} title="Pinned Chat">📌</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <p style={{
                      fontSize: '0.825rem',
                      color: hasScamWarning ? '#ea868f' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      margin: 0
                    }}>
                      {hasScamWarning ? '⚠️ Phishing Scam Warning' : room.lastMessage?.text || 'No messages yet'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isHovered && (
                        <>
                          <button
                            title={room.isPinned ? "Unpin chat" : "Pin chat to top in real-time"}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinRoom(room.id);
                            }}
                            style={{
                              padding: '4px',
                              borderRadius: '50%',
                              background: room.isPinned ? 'rgba(0, 168, 132, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                              color: room.isPinned ? 'var(--accent-whatsapp)' : 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <Pin size={13} />
                          </button>
                          <button
                            title={room.isArchived ? "Unarchive chat" : "Archive chat"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleArchiveRoom(room.id);
                            }}
                            style={{
                              padding: '4px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'var(--text-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {room.isArchived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                          </button>
                        </>
                      )}

                      {room.unreadCount > 0 && (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--accent-whatsapp)',
                          color: '#fff',
                          fontSize: '0.725rem',
                          fontWeight: 700
                        }}>
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
