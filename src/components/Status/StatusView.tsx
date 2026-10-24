import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CircleDashed, Plus, ShieldCheck, X, Eye, Music, Volume2, VolumeX, 
  Play, Pause, Search, Users, Globe, Lock, Disc, Check, Sparkles, 
  Filter, Radio, ChevronRight, Share2, Heart, MessageSquare
} from 'lucide-react';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  language: string;
  duration: string;
  cover: string;
}

export interface StatusItem {
  id: string;
  name: string;
  avatar: string;
  time: string;
  text: string;
  bg: string;
  targetGroup: {
    id: string;
    name: string;
    icon: string;
  };
  music?: MusicTrack;
  views?: number;
}

export const MUSIC_CATALOG: MusicTrack[] = [
  // Pop (English)
  {
    id: 'm_1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    genre: 'Pop',
    language: 'English',
    duration: '3:20',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'
  },
  // Bollywood / Desi (Hindi)
  {
    id: 'm_2',
    title: 'Kesariya (Brahmāstra)',
    artist: 'Arijit Singh & Pritam',
    genre: 'Bollywood / Desi',
    language: 'Hindi',
    duration: '4:28',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80'
  },
  // Latin / Reggaeton (Spanish)
  {
    id: 'm_3',
    title: 'Despacito',
    artist: 'Luis Fonsi & Daddy Yankee',
    genre: 'Latin / Reggaeton',
    language: 'Spanish',
    duration: '3:48',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80'
  },
  // Tamil / South Asian
  {
    id: 'm_4',
    title: 'Arabic Kuthu (Beast)',
    artist: 'Anirudh Ravichander & Jonita Gandhi',
    genre: 'Pop',
    language: 'Tamil',
    duration: '4:39',
    cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80'
  },
  // K-Pop (Korean)
  {
    id: 'm_5',
    title: 'Dynamite',
    artist: 'BTS',
    genre: 'K-Pop',
    language: 'Korean',
    duration: '3:19',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80'
  },
  // Japanese (J-Pop / Chill)
  {
    id: 'm_6',
    title: 'NIGHT DANCER',
    artist: 'imase',
    genre: 'Lo-Fi / Chill',
    language: 'Japanese',
    duration: '3:30',
    cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&auto=format&fit=crop&q=80'
  },
  // French (Pop / Classical)
  {
    id: 'm_7',
    title: 'Dernière Danse',
    artist: 'Indila',
    genre: 'Pop',
    language: 'French',
    duration: '3:35',
    cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&auto=format&fit=crop&q=80'
  },
  // Telugu (Regional / Folk)
  {
    id: 'm_8',
    title: 'Naatu Naatu (RRR)',
    artist: 'Rahul Sipligunj & Kaala Bhairava',
    genre: 'Telugu & Regional',
    language: 'Telugu',
    duration: '3:36',
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80'
  },
  // Arabic (Soul / Pop)
  {
    id: 'm_9',
    title: 'Tamally Maak',
    artist: 'Amr Diab',
    genre: 'R&B / Soul',
    language: 'Arabic',
    duration: '4:30',
    cover: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=300&auto=format&fit=crop&q=80'
  },
  // German (Rock / Synth)
  {
    id: 'm_10',
    title: '99 Luftballons',
    artist: 'Nena',
    genre: 'Rock / Alternative',
    language: 'German',
    duration: '3:52',
    cover: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=300&auto=format&fit=crop&q=80'
  },
  // Punjabi (Hip-Hop)
  {
    id: 'm_11',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    genre: 'Hip-Hop / Rap',
    language: 'Punjabi',
    duration: '4:08',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80'
  },
  // EDM / Electronic (English)
  {
    id: 'm_12',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    genre: 'EDM / Electronic',
    language: 'English',
    duration: '3:50',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80'
  },
  // Bollywood Classic (Hindi)
  {
    id: 'm_13',
    title: 'Tum Hi Ho (Aashiqui 2)',
    artist: 'Arijit Singh',
    genre: 'Bollywood / Desi',
    language: 'Hindi',
    duration: '4:22',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=80'
  },
  // Classical Masterpiece (French)
  {
    id: 'm_14',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    genre: 'Classical',
    language: 'French',
    duration: '5:03',
    cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&auto=format&fit=crop&q=80'
  },
  // K-Pop (Korean)
  {
    id: 'm_15',
    title: 'Cupid (Twin Ver.)',
    artist: 'FIFTY FIFTY',
    genre: 'K-Pop',
    language: 'Korean',
    duration: '2:54',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80'
  },
  // Latin Pop (Spanish)
  {
    id: 'm_16',
    title: 'Bailando',
    artist: 'Enrique Iglesias ft. Descemer Bueno',
    genre: 'Latin / Reggaeton',
    language: 'Spanish',
    duration: '4:03',
    cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80'
  },
  // Tamil Melody
  {
    id: 'm_17',
    title: 'Vennilave Vennilave (Minsara Kanavu)',
    artist: 'A.R. Rahman, Hariharan & Sadhana Sargam',
    genre: 'Classical',
    language: 'Tamil',
    duration: '5:58',
    cover: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?w=300&auto=format&fit=crop&q=80'
  },
  // Jazz / Blues (English)
  {
    id: 'm_18',
    title: 'Fly Me to the Moon',
    artist: 'Frank Sinatra',
    genre: 'Jazz / Blues',
    language: 'English',
    duration: '2:27',
    cover: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&auto=format&fit=crop&q=80'
  },
  // Lo-Fi Beat
  {
    id: 'm_19',
    title: 'Tokyo Midnight Rain (Lo-Fi)',
    artist: 'Komorebi Sound Lab',
    genre: 'Lo-Fi / Chill',
    language: 'Japanese',
    duration: '2:40',
    cover: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&auto=format&fit=crop&q=80'
  },
  // Telugu High Energy
  {
    id: 'm_20',
    title: 'Oo Antava Oo Oo Antava (Pushpa)',
    artist: 'Devi Sri Prasad & Indravathi Chauhan',
    genre: 'Telugu & Regional',
    language: 'Telugu',
    duration: '3:43',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80'
  }
];

export const StatusView: React.FC = () => {
  const { currentUser, rooms } = useApp();
  
  // Available groups for audience filtering
  const groupOptions = [
    { id: 'public', name: 'All Contacts (Public)', icon: '🌐' },
    { id: 'room_ephemeral_sf', name: 'Tech Meetup SF - Mesh Relay', icon: '👥' },
    { id: 'group_crypto', name: 'Core Cryptography Lab', icon: '🔐' },
    { id: 'group_mesh', name: 'Mobile Bluetooth Mesh Nodes', icon: '⚡' },
    { id: 'group_close', name: 'Close Circles & Verified Peers', icon: '🌟' }
  ];

  // List of active statuses
  const [statuses, setStatuses] = useState<StatusItem[]>([
    {
      id: 'st_marcus',
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      time: '12 mins ago',
      text: 'Deployed new Double Ratchet E2EE benchmark cluster! Zero latency performance. 🚀🔒',
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      targetGroup: { id: 'room_ephemeral_sf', name: 'Tech Meetup SF - Mesh Relay', icon: '👥' },
      music: MUSIC_CATALOG[0], // Blinding Lights
      views: 18
    },
    {
      id: 'st_aris',
      name: 'Dr. Aris Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      time: '1 hour ago',
      text: 'Quantum Security Institute Zurich paper published. Verified zero-knowledge consensus! 📑⚡',
      bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      targetGroup: { id: 'group_crypto', name: 'Core Cryptography Lab', icon: '🔐' },
      music: MUSIC_CATALOG[13], // Clair de Lune
      views: 34
    },
    {
      id: 'st_elena',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      time: '3 hours ago',
      text: 'Exploring decentralised audio streams across offline mesh hops. Sounds crisp! 🎵✨',
      bg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      targetGroup: { id: 'public', name: 'All Contacts (Public)', icon: '🌐' },
      music: MUSIC_CATALOG[1], // Kesariya
      views: 52
    }
  ]);

  // Current user's own published statuses
  const [myStatuses, setMyStatuses] = useState<StatusItem[]>([]);

  // Lightbox Viewer
  const [activeStory, setActiveStory] = useState<StatusItem | null>(null);
  const [isMusicPlayingInStory, setIsMusicPlayingInStory] = useState(true);

  // Status Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [selectedBg, setSelectedBg] = useState('linear-gradient(135deg, #059669 0%, #047857 100%)');
  const [selectedGroup, setSelectedGroup] = useState(groupOptions[0]);
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);

  // Music Selector Modal State
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState('All');
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  // Toast notification
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3000);
  };

  // Filter music catalog
  const filteredTracks = MUSIC_CATALOG.filter(track => {
    const matchesQuery = !musicSearchQuery || 
      track.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
      track.genre.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
      track.language.toLowerCase().includes(musicSearchQuery.toLowerCase());

    const matchesGenre = selectedGenreFilter === 'All' || track.genre === selectedGenreFilter;
    const matchesLanguage = selectedLanguageFilter === 'All' || track.language === selectedLanguageFilter;

    return matchesQuery && matchesGenre && matchesLanguage;
  });

  const allGenres = ['All', 'Pop', 'Bollywood / Desi', 'Latin / Reggaeton', 'K-Pop', 'Telugu & Regional', 'Hip-Hop / Rap', 'Rock / Alternative', 'EDM / Electronic', 'R&B / Soul', 'Classical', 'Lo-Fi / Chill', 'Jazz / Blues'];
  const allLanguages = ['All', 'English', 'Hindi', 'Spanish', 'Tamil', 'Korean', 'Japanese', 'French', 'Telugu', 'Arabic', 'German', 'Punjabi'];

  const backgroundPresets = [
    { id: 'emerald', label: 'Emerald Cyber', gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
    { id: 'sunset', label: 'Sunset Blaze', gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)' },
    { id: 'violet', label: 'Neon Twilight', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
    { id: 'space', label: 'Deep Cosmic', gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
    { id: 'cyber', label: 'Cyber Matrix', gradient: 'linear-gradient(135deg, #0f172a 0%, #042f2e 100%)' },
    { id: 'amber', label: 'Golden Sol', gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)' }
  ];

  const handlePostStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusText.trim()) return;

    const newStatus: StatusItem = {
      id: `my_st_${Date.now()}`,
      name: currentUser.displayName,
      avatar: currentUser.avatar,
      time: 'Just now',
      text: statusText.trim(),
      bg: selectedBg,
      targetGroup: selectedGroup,
      music: selectedMusic || undefined,
      views: 0
    };

    setMyStatuses(prev => [newStatus, ...prev]);
    setStatuses(prev => [newStatus, ...prev]);
    setShowCreateModal(false);
    setStatusText('');
    setSelectedMusic(null);
    showNotification(`✨ Status shared to ${selectedGroup.name}!`);
  };

  return (
    <div style={{
      flex: 1,
      height: '100%',
      background: 'var(--bg-chat)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      overflowY: 'auto',
      position: 'relative'
    }}>
      {/* Floating Status Toast */}
      {statusToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent-whatsapp)',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '0.85rem',
          zIndex: 2000,
          boxShadow: '0 8px 24px rgba(0, 168, 132, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Sparkles size={16} />
          <span>{statusToast}</span>
        </div>
      )}

      <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircleDashed size={26} style={{ color: 'var(--accent-whatsapp)' }} /> Status Updates
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Target specific groups & attach music across all world genres & languages.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: 'var(--accent-whatsapp)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 168, 132, 0.35)'
            }}
          >
            <Plus size={18} />
            <span>Create Status</span>
          </button>
        </div>

        {/* My Status Card */}
        <div 
          onClick={() => {
            if (myStatuses.length > 0) {
              setActiveStory(myStatuses[0]);
            } else {
              setShowCreateModal(true);
            }
          }}
          style={{
            padding: '16px 20px',
            borderRadius: '16px',
            background: 'var(--bg-sidebar)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.15s ease'
          }}
        >
          <div style={{ position: 'relative' }}>
            <img 
              src={currentUser.avatar} 
              alt={currentUser.displayName}
              style={{ 
                width: '54px', 
                height: '54px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: myStatuses.length > 0 ? '3px solid var(--accent-whatsapp)' : 'none',
                padding: myStatuses.length > 0 ? '2px' : 0
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--accent-whatsapp)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}>
              <Plus size={14} />
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>My Status</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {myStatuses.length > 0 
                ? `${myStatuses.length} active updates • Tap to view or add more`
                : 'Tap to publish an encrypted status story'}
            </p>
          </div>

          {myStatuses.length > 0 && (
            <div style={{
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(0, 168, 132, 0.15)',
              color: 'var(--accent-whatsapp)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Eye size={14} />
              <span>Active</span>
            </div>
          )}
        </div>

        {/* Recent Updates by Group or Contacts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recent Status Stories ({statuses.length})
            </span>
            <span style={{ fontSize: '0.72rem', color: '#53bdeb', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> E2E Group Verified
            </span>
          </div>

          {statuses.map(s => (
            <div
              key={s.id}
              onClick={() => {
                setActiveStory(s);
                setIsMusicPlayingInStory(true);
              }}
              style={{
                padding: '14px 18px',
                borderRadius: '16px',
                background: 'var(--bg-sidebar)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'var(--accent-whatsapp)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ position: 'relative' }}>
                <img 
                  src={s.avatar} 
                  alt={s.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--accent-whatsapp)',
                    padding: '2px'
                  }}
                />
                {s.music && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#a55eea',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-sidebar)'
                  }}>
                    <Music size={11} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{s.name}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>• {s.time}</span>
                </div>

                {/* Target Audience Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span>{s.targetGroup.icon}</span>
                    <span>{s.targetGroup.name}</span>
                  </span>

                  {s.music && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'rgba(165, 94, 234, 0.2)',
                      color: '#c084fc',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px'
                    }}>
                      <Music size={11} />
                      <span>{s.music.title} • {s.music.artist}</span>
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CREATE STATUS MODAL (Group selection & Song selection)                     */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-sidebar)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-header)'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-whatsapp)' }} /> Create New Status Story
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview Card */}
            <div style={{
              margin: '20px',
              height: '240px',
              borderRadius: '16px',
              background: selectedBg,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff',
              position: 'relative',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={currentUser.avatar} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{currentUser.displayName}</h5>
                    <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>{selectedGroup.icon} {selectedGroup.name}</span>
                  </div>
                </div>

                {selectedMusic && (
                  <div style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    <Disc size={14} className="spin-slow" />
                    <span>{selectedMusic.title}</span>
                  </div>
                )}
              </div>

              {/* Status input overlay in preview */}
              <textarea
                value={statusText}
                onChange={e => setStatusText(e.target.value)}
                placeholder="What's on your mind? Type encrypted status update..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ fontSize: '0.7rem', textAlign: 'center', opacity: 0.75 }}>
                🔒 24-Hour End-to-End Encrypted Status
              </div>
            </div>

            {/* Customization controls */}
            <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* TARGET GROUP SELECTOR */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Audience / Share With Group:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                  <select
                    value={selectedGroup.id}
                    onChange={e => {
                      const found = groupOptions.find(g => g.id === e.target.value);
                      if (found) setSelectedGroup(found);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {groupOptions.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ATTACH MUSIC BUTTON */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Attach Soundtrack / Music:
                  </label>
                  {selectedMusic && (
                    <button
                      onClick={() => setSelectedMusic(null)}
                      style={{ background: 'transparent', border: 'none', color: '#f43f5e', fontSize: '0.72rem', cursor: 'pointer' }}
                    >
                      Remove Song
                    </button>
                  )}
                </div>

                {selectedMusic ? (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(165, 94, 234, 0.15)',
                    border: '1px solid rgba(165, 94, 234, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={selectedMusic.cover} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#c084fc' }}>{selectedMusic.title}</h5>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {selectedMusic.artist} • {selectedMusic.genre} ({selectedMusic.language})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMusicModal(true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: 'rgba(165, 94, 234, 0.25)',
                        color: '#c084fc',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMusicModal(true)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px dashed var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Music size={18} style={{ color: '#a55eea' }} />
                    <span>Select Song (All Genres & Languages available)</span>
                  </button>
                )}
              </div>

              {/* Background gradient color swatches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Theme Colors:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {backgroundPresets.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBg(b.gradient)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: b.gradient,
                        cursor: 'pointer',
                        border: selectedBg === b.gradient ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: selectedBg === b.gradient ? '0 0 10px rgba(255,255,255,0.4)' : 'none'
                      }}
                      title={b.label}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handlePostStatus}
                disabled={!statusText.trim()}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: statusText.trim() ? 'var(--accent-whatsapp)' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: statusText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '4px'
                }}
              >
                <Share2 size={16} />
                <span>Publish Encrypted Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MULTI-GENRE & MULTI-LANGUAGE MUSIC PICKER MODAL                           */}
      {/* ========================================================================= */}
      {showMusicModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            background: 'var(--bg-sidebar)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-header)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(165, 94, 234, 0.2)',
                  color: '#a55eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Music size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Universal Music Library</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Browse songs across all major genres and world languages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMusicModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div style={{ padding: '14px 22px 8px 22px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'var(--bg-input)',
                borderRadius: '10px',
                padding: '8px 14px',
                border: '1px solid var(--border-color)'
              }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by song title, artist, movie or language..."
                  value={musicSearchQuery}
                  onChange={e => setMusicSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
                {musicSearchQuery && (
                  <button
                    onClick={() => setMusicSearchQuery('')}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Language Filter Tabs */}
            <div style={{ padding: '6px 22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Filter by Language:
              </span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {allLanguages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setSelectedLanguageFilter(lang)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: selectedLanguageFilter === lang ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                      background: selectedLanguageFilter === lang ? 'rgba(0, 168, 132, 0.2)' : 'var(--bg-input)',
                      color: selectedLanguageFilter === lang ? 'var(--accent-whatsapp)' : 'var(--text-secondary)'
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Filter Tabs */}
            <div style={{ padding: '6px 22px 10px 22px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Filter by Genre:
              </span>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {allGenres.map(genre => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenreFilter(genre)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: selectedGenreFilter === genre ? '1px solid #a55eea' : '1px solid var(--border-color)',
                      background: selectedGenreFilter === genre ? 'rgba(165, 94, 234, 0.2)' : 'var(--bg-input)',
                      color: selectedGenreFilter === genre ? '#c084fc' : 'var(--text-secondary)'
                    }}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Songs List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 16px 22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredTracks.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No songs matching your query. Try resetting language or genre filters!
                </div>
              ) : (
                filteredTracks.map(track => {
                  const isPreviewing = previewingTrackId === track.id;
                  const isSelected = selectedMusic?.id === track.id;

                  return (
                    <div
                      key={track.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(0, 168, 132, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Left: Play button + Album Art + Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                        {/* Audio Preview Simulator Button */}
                        <button
                          type="button"
                          onClick={() => setPreviewingTrackId(isPreviewing ? null : track.id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isPreviewing ? 'var(--accent-whatsapp)' : 'rgba(255,255,255,0.08)',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                          title={isPreviewing ? "Stop audio preview" : "Play audio preview"}
                        >
                          {isPreviewing ? <Pause size={16} /> : <Play size={16} />}
                        </button>

                        <img 
                          src={track.cover} 
                          alt={track.title} 
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                        />

                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {track.title}
                            </h5>
                            {isPreviewing && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '6px' }}>
                                <span style={{ width: '3px', height: '12px', background: 'var(--accent-whatsapp)', borderRadius: '2px', animation: 'pulse 0.4s infinite' }} />
                                <span style={{ width: '3px', height: '18px', background: 'var(--accent-whatsapp)', borderRadius: '2px', animation: 'pulse 0.6s infinite' }} />
                                <span style={{ width: '3px', height: '8px', background: 'var(--accent-whatsapp)', borderRadius: '2px', animation: 'pulse 0.3s infinite' }} />
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.artist}</span>
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                              {track.genre}
                            </span>
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(165, 94, 234, 0.15)', color: '#c084fc', fontWeight: 700 }}>
                              {track.language}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Select Song Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{track.duration}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMusic(track);
                            setShowMusicModal(false);
                            setPreviewingTrackId(null);
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--accent-whatsapp)' : 'rgba(255,255,255,0.08)',
                            color: isSelected ? '#fff' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={14} />
                              <span>Attached</span>
                            </>
                          ) : (
                            <span>Select</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STORY LIGHTBOX VIEWER (With Group Badge & Animated Music Vinyl)            */}
      {/* ========================================================================= */}
      {activeStory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(11, 20, 26, 0.96)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <button 
            onClick={() => {
              setActiveStory(null);
              setIsMusicPlayingInStory(false);
            }} 
            style={{ 
              position: 'absolute', 
              top: '24px', 
              right: '24px', 
              color: '#fff',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>

          <div style={{
            width: '100%',
            maxWidth: '420px',
            height: '640px',
            borderRadius: '24px',
            background: activeStory.bg,
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#fff',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Story Top Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Progress Bar Indicator */}
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#fff', width: '65%', borderRadius: '2px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={activeStory.avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #fff' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{activeStory.name}</h4>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{activeStory.time}</span>
                  </div>
                </div>

                {/* Group audience badge */}
                <div style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(6px)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>{activeStory.targetGroup.icon}</span>
                  <span>{activeStory.targetGroup.name}</span>
                </div>
              </div>
            </div>

            {/* Story Text Content */}
            <div style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              lineHeight: 1.45,
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              padding: '0 10px'
            }}>
              {activeStory.text}
            </div>

            {/* Story Bottom Bar with Music Track & Security Watermark */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* ATTACHED MUSIC BANNER WITH SPINNING VINYL */}
              {activeStory.music && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '16px',
                  background: 'rgba(0, 0, 0, 0.55)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Spinning Vinyl Cover */}
                    <div style={{
                      position: 'relative',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      animation: isMusicPlayingInStory ? 'spin 4s linear infinite' : 'none',
                      border: '2px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                    }}>
                      <img src={activeStory.music.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: '15px', borderRadius: '50%', background: '#000', border: '1px solid #fff' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{activeStory.music.title}</span>
                        {isMusicPlayingInStory && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ width: '2px', height: '10px', background: '#38ef7d', borderRadius: '1px' }} />
                            <span style={{ width: '2px', height: '14px', background: '#38ef7d', borderRadius: '1px' }} />
                            <span style={{ width: '2px', height: '8px', background: '#38ef7d', borderRadius: '1px' }} />
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                        {activeStory.music.artist} • {activeStory.music.genre} ({activeStory.music.language})
                      </span>
                    </div>
                  </div>

                  {/* Play/Pause story music */}
                  <button
                    onClick={() => setIsMusicPlayingInStory(!isMusicPlayingInStory)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={isMusicPlayingInStory ? "Mute track" : "Unmute track"}
                  >
                    {isMusicPlayingInStory ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
              )}

              <div style={{ fontSize: '0.72rem', textAlign: 'center', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> Encrypted Status • Audience: {activeStory.targetGroup.name}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
