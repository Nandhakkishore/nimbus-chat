import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, ChatRoom, Message, CallState, DeviceKey, ProofOfHumanChallenge, ScamScanResult, CallHistoryItem, CallStatus 
} from '../types';
import { 
  CURRENT_USER, CURRENT_DEVICE_KEY, MOCK_USERS, INITIAL_ROOMS, 
  INITIAL_MESSAGES_MARCUS, INITIAL_MESSAGES_SCAMMER, MOCK_PROOF_CHALLENGE 
} from '../services/MockData';
import { ScamRadarService } from '../services/ScamRadarService';
import { E2EEService } from '../services/E2EEService';
import { TrustGraphService } from '../services/TrustGraphService';
import { MeshNetworkService } from '../services/MeshNetworkService';
import { SoundService } from '../services/SoundService';
import { WebRTCService } from '../services/WebRTCService';
import { useWebSocket } from '../hooks/useWebSocket';

export type ColorTheme = 'emerald' | 'violet' | 'sapphire' | 'amber' | 'rose' | 'light';

interface AppContextType {
  currentUser: User;
  deviceKey: DeviceKey;
  isAuthenticated: boolean;
  userRole: 'user' | 'admin';
  isAdmin: boolean;
  theme: 'dark' | 'light';
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  toggleTheme: () => void;
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  rooms: ChatRoom[];
  setRooms: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
  messagesMap: Record<string, Message[]>;
  activeCall: CallState;
  callHistory: CallHistoryItem[];
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleCallMinimize: () => void;
  switchUserProfile: (userOrId: string | User) => void;
  isWsConnected: boolean;
  wsLatencyMs: number;
  onlineUserIds: string[];
  meshModeActive: boolean;
  toggleMeshMode: () => void;
  scamRadarActive: boolean;
  toggleScamRadar: () => void;
  aiRoastModeActive: boolean;
  toggleAiRoastMode: () => void;
  activeModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  sendMessage: (roomId: string, text: string, mediaType?: Message['mediaType'], replyTo?: Message['replyTo'], extraMedia?: { audioUrl?: string; mediaUrl?: string; voiceNoteDuration?: number }) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  deleteRoom: (roomId: string) => void;
  toggleArchiveRoom: (roomId: string) => void;
  togglePinRoom: (roomId: string) => void;
  togglePinMessage: (roomId: string, message: Message | null) => void;
  addReaction: (roomId: string, messageId: string, emoji: string) => void;
  initiateCall: (targetUser: User, isVideo: boolean) => Promise<void>;
  endCall: () => void;
  blockContact: (userId: string) => void;
  solveProofOfHuman: (challengeId: string, selectedIndex: number) => boolean;
  triggerIncomingCallSimulation: () => void;
  verifyDeviceKey: () => void;
  activeProofChallenge: ProofOfHumanChallenge;
  logout: () => void;
  loginWith2SV: (password: string) => boolean;
  loginAsAdmin: (adminSecret: string) => boolean;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => void;
  addMemberToRoom: (roomId: string, newUser: User) => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  roomWallpapers: Record<string, string>;
  globalWallpaper: string;
  setRoomWallpaper: (roomId: string, wallpaper: string) => void;
  setGlobalWallpaper: (wallpaper: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('humanlink_user');
      return saved ? JSON.parse(saved) : CURRENT_USER;
    } catch (e) { return CURRENT_USER; }
  });

  const [deviceKey, setDeviceKey] = useState<DeviceKey>(CURRENT_DEVICE_KEY);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('humanlink_auth');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) { return true; }
  });

  const [userRole, setUserRole] = useState<'user' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem('humanlink_role');
      return (saved === 'admin' || saved === 'user') ? saved : 'user';
    } catch (e) { return 'user'; }
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('humanlink_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch (e) { return 'dark'; }
  });

  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('humanlink_color_theme');
      return (saved as ColorTheme) || 'emerald';
    } catch (e) { return 'emerald'; }
  });
  
  const [activeRoomId, setActiveRoomId] = useState<string>('room_marcus');

  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    try {
      const saved = localStorage.getItem('humanlink_rooms');
      return saved ? JSON.parse(saved) : INITIAL_ROOMS;
    } catch (e) { return INITIAL_ROOMS; }
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('humanlink_messages');
      return saved ? JSON.parse(saved) : {
        room_marcus: INITIAL_MESSAGES_MARCUS,
        room_scammer: INITIAL_MESSAGES_SCAMMER,
        room_ephemeral_sf: INITIAL_ROOMS[2].lastMessage ? [INITIAL_ROOMS[2].lastMessage] : [],
        room_channel_announcements: INITIAL_ROOMS[3].lastMessage ? [INITIAL_ROOMS[3].lastMessage] : []
      };
    } catch (e) {
      return {
        room_marcus: INITIAL_MESSAGES_MARCUS,
        room_scammer: INITIAL_MESSAGES_SCAMMER,
        room_ephemeral_sf: INITIAL_ROOMS[2].lastMessage ? [INITIAL_ROOMS[2].lastMessage] : [],
        room_channel_announcements: INITIAL_ROOMS[3].lastMessage ? [INITIAL_ROOMS[3].lastMessage] : []
      };
    }
  });

  const [roomWallpapers, setRoomWallpapers] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('humanlink_room_wallpapers');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [globalWallpaper, setGlobalWallpaperState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('humanlink_global_wallpaper');
      return saved || '';
    } catch (e) { return ''; }
  });

  const setRoomWallpaper = useCallback((roomId: string, wallpaper: string) => {
    setRoomWallpapers(prev => {
      const next = { ...prev, [roomId]: wallpaper };
      try {
        localStorage.setItem('humanlink_room_wallpapers', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const setGlobalWallpaper = useCallback((wallpaper: string) => {
    setGlobalWallpaperState(wallpaper);
    try {
      localStorage.setItem('humanlink_global_wallpaper', wallpaper);
    } catch (e) {}
  }, []);

  const [activeCall, setActiveCall] = useState<CallState>({
    active: false,
    status: 'idle',
    isVideo: false,
    isIncoming: false,
    isMuted: false,
    isCameraOn: true,
    isScreenSharing: false,
    isMinimized: false,
    durationSeconds: 0,
    localStream: null,
    remoteStream: null,
    callQuality: { latencyMs: 16, resolution: '1280x720', packetLoss: 0, fps: 30 }
  });

  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('humanlink_call_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'call_h1',
        user: MOCK_USERS.marcus,
        type: 'incoming',
        isVideo: true,
        timestamp: 'Today, 11:20 AM',
        durationSeconds: 245,
        deepfakeRiskScore: 4
      },
      {
        id: 'call_h2',
        user: MOCK_USERS.dr_aris,
        type: 'missed',
        isVideo: false,
        timestamp: 'Yesterday, 4:15 PM',
        durationSeconds: 0,
        deepfakeRiskScore: 8
      },
      {
        id: 'call_h3',
        user: MOCK_USERS.unknown_scammer,
        type: 'missed',
        isVideo: true,
        timestamp: 'Sep 18, 9:02 PM',
        durationSeconds: 12,
        deepfakeRiskScore: 84
      }
    ];
  });

  // WebSocket Real-Time Gateway Hook
  const { isConnected: isWsConnected, sendEvent, lastEvent, latencyMs: wsLatencyMs } = useWebSocket();
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const incomingOfferSdpRef = useRef<any>(null);
  const callTimeoutRef = useRef<any>(null);

  const [meshModeActive, setMeshModeActive] = useState<boolean>(false);
  const [scamRadarActive, setScamRadarActive] = useState<boolean>(true);
  const [aiRoastModeActive, setAiRoastModeActive] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [activeProofChallenge, setActiveProofChallenge] = useState<ProofOfHumanChallenge>(MOCK_PROOF_CHALLENGE);

  // Sync state to localStorage on any mutation
  useEffect(() => {
    try {
      localStorage.setItem('humanlink_user', JSON.stringify(currentUser));
      localStorage.setItem('humanlink_auth', JSON.stringify(isAuthenticated));
      localStorage.setItem('humanlink_role', userRole);
      localStorage.setItem('humanlink_theme', theme);
      localStorage.setItem('humanlink_color_theme', colorTheme);
      localStorage.setItem('humanlink_rooms', JSON.stringify(rooms));
      localStorage.setItem('humanlink_messages', JSON.stringify(messagesMap));
      localStorage.setItem('humanlink_call_history', JSON.stringify(callHistory));
    } catch (e) {
      console.warn('[LocalStorage] State sync warning:', e);
    }
  }, [currentUser, isAuthenticated, userRole, theme, colorTheme, rooms, messagesMap, callHistory]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-theme', colorTheme);
  }, [theme, colorTheme]);

  const toggleTheme = () => {
    if (colorTheme === 'light') {
      setColorTheme('emerald');
      setTheme('dark');
    } else {
      setColorTheme('light');
      setTheme('light');
    }
  };

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const toggleMeshMode = () => setMeshModeActive(prev => !prev);
  const toggleScamRadar = () => setScamRadarActive(prev => !prev);
  const toggleAiRoastMode = () => setAiRoastModeActive(prev => !prev);

  const deleteMessage = (roomId: string, messageId: string) => {
    setMessagesMap(prev => {
      const roomMsgs = prev[roomId] || [];
      const filtered = roomMsgs.filter(m => m.id !== messageId);
      
      setRooms(prevRooms => prevRooms.map(r => {
        if (r.id === roomId) {
          const newLastMsg = filtered.length > 0 ? filtered[filtered.length - 1] : undefined;
          return { ...r, lastMessage: newLastMsg };
        }
        return r;
      }));

      return { ...prev, [roomId]: filtered };
    });
  };

  const deleteRoom = (roomId: string) => {
    setRooms(prev => {
      const filtered = prev.filter(r => r.id !== roomId);
      if (activeRoomId === roomId) {
        setActiveRoomId(filtered.length > 0 ? filtered[0].id : '');
      }
      return filtered;
    });

    setMessagesMap(prev => {
      const copy = { ...prev };
      delete copy[roomId];
      return copy;
    });
  };

  const toggleArchiveRoom = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, isArchived: !r.isArchived } : r));
  };

  const togglePinRoom = (roomId: string) => {
    setRooms(prev => {
      const target = prev.find(r => r.id === roomId);
      const nextPinned = !target?.isPinned;
      sendEvent('chat:pin_room', { roomId, isPinned: nextPinned });
      const updated = prev.map(r => r.id === roomId ? { ...r, isPinned: nextPinned } : r);
      return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    });
  };

  const togglePinMessage = (roomId: string, message: Message | null) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const isSame = r.pinnedMessage?.id === message?.id;
        const nextPinned = isSame ? null : message;
        sendEvent('chat:pin_message', { roomId, pinnedMessage: nextPinned });
        return { ...r, pinnedMessage: nextPinned };
      }
      return r;
    }));
  };

  const sendMessage = (
    roomId: string,
    text: string,
    mediaType?: Message['mediaType'],
    replyTo?: Message['replyTo'],
    extraMedia?: { audioUrl?: string; mediaUrl?: string; voiceNoteDuration?: number }
  ) => {
    if (!text.trim() && !mediaType && !extraMedia?.audioUrl) return;

    const targetRoom = rooms.find(r => r.id === roomId);
    const peerUser = targetRoom?.members.find(m => m.id !== currentUser.id) || MOCK_USERS.marcus;

    let scamAnalysis: ScamScanResult | undefined;
    if (scamRadarActive) {
      scamAnalysis = ScamRadarService.scanMessageText(text, peerUser.trustScore);
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.avatar,
      text,
      mediaType,
      mediaUrl: extraMedia?.mediaUrl || (mediaType === 'image' ? 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80' : undefined),
      audioUrl: extraMedia?.audioUrl,
      voiceNoteDuration: extraMedia?.voiceNoteDuration,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      reactions: [],
      replyTo,
      scamAnalysis,
      meshRelayed: meshModeActive,
      meshHopCount: meshModeActive ? 2 : undefined
    };

    setMessagesMap(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage]
    }));

    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, lastMessage: newMessage } : r));

    // Relay over WebSocket to other clients in realtime
    sendEvent('chat:send_message', { roomId, message: newMessage });

    // Transition message status: ONLY if recipient is Online (isOnline === true)
    // If recipient is offline, stays 'sent' (Single Grey Tick)!
    if (peerUser.isOnline) {
      setTimeout(() => {
        setMessagesMap(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
        }));
      }, 500);

      setTimeout(() => {
        setMessagesMap(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || []).map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m)
        }));
      }, 1000);

      // Only trigger automated simulated reply if AI Roast Mode is active or in the scammer simulation room
      // (Generic "Message received by ...! Signal protocol session active" confirmation message removed)
      if (aiRoastModeActive || roomId === 'room_scammer') {
        setTimeout(() => {
          const isScammer = roomId === 'room_scammer';

          const funnyRoasts = [
            "I've analyzed your message and my AI brain lost 50 IQ points 🧠💨",
            "That's cool... but did anyone ask? 🤡",
            "I would agree with you, but then we'd both be wrong 🥑",
            "My Double Ratchet encryption is strong, but your logic is weak 🔒🔥",
            "BRB, pretending to care for 5 minutes ☕",
            "10/10 message... if we were in 2012 🚀",
            "Error 404: Care not found 🤖✨",
            "I am typing a very serious response... just kidding 😜"
          ];
          const randomRoast = funnyRoasts[Math.floor(Math.random() * funnyRoasts.length)];

          const replyText = aiRoastModeActive
            ? `🤡 AI Roast: ${randomRoast}`
            : '⚠️ Automated Alert: Safety warning active. Double-check sender credentials.';

          const replyMsg: Message = {
            id: `msg_reply_${Date.now()}`,
            roomId,
            senderId: peerUser.id,
            senderName: peerUser.displayName,
            senderAvatar: peerUser.avatar,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            reactions: []
          };

          setMessagesMap(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), replyMsg]
          }));

          setRooms(prev => prev.map(r => r.id === roomId ? { ...r, lastMessage: replyMsg } : r));
        }, 1500);
      }
    }
  };

  const addReaction = (roomId: string, messageId: string, emoji: string) => {
    setMessagesMap(prev => {
      const roomMsgs = prev[roomId] || [];
      const updated = roomMsgs.map(m => {
        if (m.id !== messageId) return m;
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          // If already reacted by current user, toggle off
          if (existing.userId === currentUser.id) {
            if (existing.count <= 1) {
              return {
                ...m,
                reactions: m.reactions.filter(r => r.emoji !== emoji)
              };
            } else {
              return {
                ...m,
                reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1 } : r)
              };
            }
          } else {
            return {
              ...m,
              reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
            };
          }
        }
        return {
          ...m,
          reactions: [...m.reactions, { emoji, userId: currentUser.id, count: 1 }]
        };
      });
      return { ...prev, [roomId]: updated };
    });
  };

  // 1. WebSocket User Registration Effect
  useEffect(() => {
    if (isWsConnected && currentUser?.id) {
      sendEvent('signal:register', {
        userId: currentUser.id,
        displayName: currentUser.displayName,
        avatar: currentUser.avatar
      });
    }
  }, [isWsConnected, currentUser, sendEvent]);

  // 2. In-Call Duration & WebRTC Quality Stats Timer
  useEffect(() => {
    let timerInterval: any;
    let qualityInterval: any;

    if (activeCall.active && activeCall.status === 'connected') {
      timerInterval = setInterval(() => {
        setActiveCall(prev => ({ ...prev, durationSeconds: prev.durationSeconds + 1 }));
      }, 1000);

      qualityInterval = setInterval(async () => {
        const quality = await WebRTCService.getCallQuality();
        setActiveCall(prev => ({ ...prev, callQuality: quality }));
      }, 2000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (qualityInterval) clearInterval(qualityInterval);
    };
  }, [activeCall.active, activeCall.status]);

  // 3. WebSocket Real-Time Call Event Listener
  useEffect(() => {
    if (!lastEvent) return;
    const { event, payload } = lastEvent;

    if (event === 'signal:registered' && payload?.onlineUserIds) {
      setOnlineUserIds(payload.onlineUserIds);
    } else if (event === 'users:online_list' && payload?.onlineUserIds) {
      setOnlineUserIds(payload.onlineUserIds);
    } else if (event === 'call:incoming') {
      incomingOfferSdpRef.current = payload.offerSdp;
      SoundService.playIncomingRing();

      const context = TrustGraphService.calculateContext(
        payload.caller?.displayName?.includes('Marcus') ? 14 : 0,
        payload.caller?.displayName?.includes('Marcus') ? 3 : 0,
        12,
        payload.caller?.displayName?.includes('Unknown') ? 4 : 0,
        'United States'
      );

      setActiveCall({
        active: true,
        status: 'ringing_incoming',
        callId: payload.callId,
        caller: payload.caller,
        targetUser: currentUser,
        isVideo: payload.isVideo ?? true,
        isIncoming: true,
        trustContext: context,
        deepfakeRiskScore: (payload.caller?.trustScore ?? 50) < 30 ? 84 : 4,
        isMuted: false,
        isCameraOn: true,
        isScreenSharing: false,
        isMinimized: false,
        durationSeconds: 0,
        localStream: null,
        remoteStream: null,
        callQuality: { latencyMs: wsLatencyMs || 16, resolution: '1280x720', packetLoss: 0, fps: 30 }
      });
    } else if (event === 'call:accepted') {
      SoundService.playConnected();
      if (payload.answerSdp) {
        WebRTCService.handleAnswer(payload.answerSdp);
      }
      setActiveCall(prev => ({ ...prev, status: 'connected' }));
    } else if (event === 'call:ice_candidate' && payload.candidate) {
      WebRTCService.addIceCandidate(payload.candidate);
    } else if (event === 'call:media_state') {
      if (payload.isMuted !== undefined || payload.isCameraOn !== undefined) {
        console.log('[Call Signal] Remote peer media state:', payload);
      }
    } else if (event === 'call:rejected') {
      SoundService.playEnded();
      WebRTCService.stopAll();
      setActiveCall(prev => ({ ...prev, active: false, status: 'ended' }));
    } else if (event === 'call:ended') {
      SoundService.playEnded();
      WebRTCService.stopAll();
      setActiveCall(prev => ({ ...prev, active: false, status: 'ended' }));
    } else if (event === 'chat:inbound_message' && payload?.message) {
      const { roomId, message: inboundMsg } = payload;
      setMessagesMap(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []).filter(m => m.id !== inboundMsg.id), inboundMsg]
      }));
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, lastMessage: inboundMsg } : r));
    } else if (event === 'chat:room_pinned' && payload?.roomId) {
      setRooms(prev => {
        const updated = prev.map(r => r.id === payload.roomId ? { ...r, isPinned: payload.isPinned } : r);
        return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
      });
    } else if (event === 'chat:message_pinned' && payload?.roomId) {
      setRooms(prev => prev.map(r => r.id === payload.roomId ? { ...r, pinnedMessage: payload.pinnedMessage } : r));
    } else if (event === 'signal:registered' && payload) {
      if (Array.isArray(payload.pinnedRoomIds)) {
        setRooms(prev => {
          const updated = prev.map(r => ({
            ...r,
            isPinned: payload.pinnedRoomIds.includes(r.id)
          }));
          return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
        });
      }
      if (payload.pinnedMessages) {
        setRooms(prev => prev.map(r => ({
          ...r,
          pinnedMessage: payload.pinnedMessages[r.id] !== undefined ? payload.pinnedMessages[r.id] : r.pinnedMessage
        })));
      }
    }
  }, [lastEvent, currentUser, wsLatencyMs]);

  // 4. Call Control Methods
  const initiateCall = async (targetUser: User, isVideo: boolean): Promise<void> => {
    const callId = `call_${Date.now()}`;
    const context = TrustGraphService.calculateContext(
      targetUser.displayName.includes('Marcus') ? 14 : 0,
      targetUser.displayName.includes('Marcus') ? 3 : 0,
      12,
      targetUser.displayName.includes('Unknown') ? 4 : 0,
      'United States'
    );

    SoundService.playRingback();

    // Start local camera and mic
    const localStream = await WebRTCService.startLocalMedia(isVideo);

    setActiveCall({
      active: true,
      status: 'ringing_outgoing',
      callId,
      caller: currentUser,
      targetUser,
      isVideo,
      isIncoming: false,
      trustContext: context,
      deepfakeRiskScore: targetUser.trustScore < 30 ? 78 : 4,
      isMuted: false,
      isCameraOn: true,
      isScreenSharing: false,
      isMinimized: false,
      durationSeconds: 0,
      localStream,
      remoteStream: null,
      callQuality: { latencyMs: wsLatencyMs || 14, resolution: isVideo ? '1280x720' : 'Audio', packetLoss: 0, fps: 30 }
    });

    // Initialize RTCPeerConnection
    WebRTCService.initPeerConnection({
      onLocalStream: (stream) => {
        setActiveCall(prev => ({ ...prev, localStream: stream }));
      },
      onRemoteStream: (stream) => {
        SoundService.playConnected();
        setActiveCall(prev => ({ ...prev, remoteStream: stream, status: 'connected' }));
      },
      onIceCandidate: (candidate) => {
        sendEvent('call:ice_candidate', {
          toUserId: targetUser.id,
          callId,
          candidate
        });
      },
      onConnectionStateChange: (state) => {
        if (state === 'connected') {
          SoundService.playConnected();
          setActiveCall(prev => ({ ...prev, status: 'connected' }));
        } else if (state === 'disconnected' || state === 'failed') {
          endCall();
        }
      }
    });

    // Generate and send Offer
    try {
      const offer = await WebRTCService.createOffer();
      sendEvent('call:initiate', {
        toUserId: targetUser.id,
        callId,
        caller: currentUser,
        offerSdp: offer,
        isVideo
      });
    } catch (e) {
      console.warn('[WebRTC] Offer generation error:', e);
    }

    // Solo Testing / Interactive Peer Fallback:
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
    callTimeoutRef.current = setTimeout(() => {
      setActiveCall(prev => {
        if (prev.active && prev.status === 'ringing_outgoing') {
          SoundService.playConnected();
          const remoteStream = WebRTCService.createInteractivePeerStream(targetUser.displayName);
          return {
            ...prev,
            status: 'connected',
            remoteStream
          };
        }
        return prev;
      });
    }, 3200);
  };

  const acceptCall = async (): Promise<void> => {
    SoundService.playConnected();
    const isVideo = activeCall.isVideo;
    const callId = activeCall.callId || `call_${Date.now()}`;
    const callerId = activeCall.caller?.id || 'usr_marcus_02';

    const localStream = await WebRTCService.startLocalMedia(isVideo);

    WebRTCService.initPeerConnection({
      onLocalStream: (stream) => {
        setActiveCall(prev => ({ ...prev, localStream: stream }));
      },
      onRemoteStream: (stream) => {
        setActiveCall(prev => ({ ...prev, remoteStream: stream, status: 'connected' }));
      },
      onIceCandidate: (candidate) => {
        sendEvent('call:ice_candidate', {
          toUserId: callerId,
          callId,
          candidate
        });
      },
      onConnectionStateChange: (state) => {
        if (state === 'connected') {
          setActiveCall(prev => ({ ...prev, status: 'connected' }));
        } else if (state === 'disconnected' || state === 'failed') {
          endCall();
        }
      }
    });

    if (incomingOfferSdpRef.current) {
      try {
        const answer = await WebRTCService.createAnswer(incomingOfferSdpRef.current);
        sendEvent('call:accept', {
          toUserId: callerId,
          callId,
          answerSdp: answer
        });
      } catch (e) {
        console.warn('Answer SDP error:', e);
      }
    } else {
      const remoteStream = WebRTCService.createInteractivePeerStream(activeCall.caller?.displayName || 'Peer');
      setActiveCall(prev => ({ ...prev, remoteStream }));
    }

    setActiveCall(prev => ({
      ...prev,
      status: 'connected',
      localStream
    }));
  };

  const declineCall = () => {
    SoundService.stopAll();
    const callerId = activeCall.caller?.id;
    if (callerId && activeCall.callId) {
      sendEvent('call:reject', { toUserId: callerId, callId: activeCall.callId });
    }

    // Record as missed call
    if (activeCall.caller) {
      const historyItem: CallHistoryItem = {
        id: `call_hist_${Date.now()}`,
        user: activeCall.caller,
        type: 'missed',
        isVideo: activeCall.isVideo,
        timestamp: 'Just now',
        durationSeconds: 0,
        deepfakeRiskScore: activeCall.deepfakeRiskScore
      };
      setCallHistory(prev => [historyItem, ...prev]);
    }

    WebRTCService.stopAll();
    setActiveCall({
      active: false,
      status: 'idle',
      isVideo: false,
      isIncoming: false,
      isMuted: false,
      isCameraOn: true,
      isScreenSharing: false,
      isMinimized: false,
      durationSeconds: 0,
      localStream: null,
      remoteStream: null
    });
  };

  const endCall = () => {
    SoundService.playEnded();
    if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);

    const peerId = activeCall.isIncoming ? activeCall.caller?.id : activeCall.targetUser?.id;
    if (peerId && activeCall.callId) {
      sendEvent('call:end', { toUserId: peerId, callId: activeCall.callId });
    }

    // Save to call history
    const callUser = activeCall.isIncoming ? activeCall.caller : activeCall.targetUser;
    if (callUser) {
      const historyItem: CallHistoryItem = {
        id: `call_hist_${Date.now()}`,
        user: callUser,
        type: activeCall.status === 'connected'
          ? (activeCall.isIncoming ? 'incoming' : 'outgoing')
          : (activeCall.isIncoming ? 'missed' : 'outgoing'),
        isVideo: activeCall.isVideo,
        timestamp: 'Just now',
        durationSeconds: activeCall.durationSeconds,
        deepfakeRiskScore: activeCall.deepfakeRiskScore
      };
      setCallHistory(prev => [historyItem, ...prev]);
    }

    WebRTCService.stopAll();

    setActiveCall({
      active: false,
      status: 'idle',
      isVideo: false,
      isIncoming: false,
      isMuted: false,
      isCameraOn: true,
      isScreenSharing: false,
      isMinimized: false,
      durationSeconds: 0,
      localStream: null,
      remoteStream: null
    });
  };

  const toggleMute = () => {
    const newMuted = !activeCall.isMuted;
    WebRTCService.setAudioMuted(newMuted);
    setActiveCall(prev => ({ ...prev, isMuted: newMuted }));
    const peerId = activeCall.isIncoming ? activeCall.caller?.id : activeCall.targetUser?.id;
    if (peerId) {
      sendEvent('call:media_state', { toUserId: peerId, isMuted: newMuted, callId: activeCall.callId });
    }
  };

  const toggleCamera = () => {
    const newCameraOn = !activeCall.isCameraOn;
    WebRTCService.setVideoEnabled(newCameraOn);
    setActiveCall(prev => ({ ...prev, isCameraOn: newCameraOn }));
    const peerId = activeCall.isIncoming ? activeCall.caller?.id : activeCall.targetUser?.id;
    if (peerId) {
      sendEvent('call:media_state', { toUserId: peerId, isCameraOn: newCameraOn, callId: activeCall.callId });
    }
  };

  const toggleScreenShare = async (): Promise<void> => {
    const sharing = await WebRTCService.toggleScreenShare(activeCall.isScreenSharing);
    setActiveCall(prev => ({ ...prev, isScreenSharing: sharing }));
  };

  const toggleCallMinimize = () => {
    setActiveCall(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const triggerIncomingCallSimulation = () => {
    const unknownUser = MOCK_USERS.unknown_scammer;
    const context = TrustGraphService.calculateContext(0, 0, 1, 6, 'Nigeria');

    SoundService.playIncomingRing();

    setActiveCall({
      active: true,
      status: 'ringing_incoming',
      callId: `sim_${Date.now()}`,
      caller: unknownUser,
      targetUser: currentUser,
      isVideo: true,
      isIncoming: true,
      trustContext: context,
      deepfakeRiskScore: 84,
      isMuted: false,
      isCameraOn: true,
      isScreenSharing: false,
      isMinimized: false,
      durationSeconds: 0,
      localStream: null,
      remoteStream: null,
      callQuality: { latencyMs: 24, resolution: '1280x720', packetLoss: 0, fps: 30 }
    });
  };

  const switchUserProfile = (userOrId: string | User) => {
    let targetUser: User;
    if (typeof userOrId === 'string') {
      if (userOrId === 'usr_marcus_02' || userOrId === 'marcus') {
        targetUser = MOCK_USERS.marcus;
      } else {
        targetUser = CURRENT_USER;
      }
    } else {
      targetUser = userOrId;
    }
    setCurrentUser(targetUser);
    if (targetUser.id === 'usr_marcus_02') {
      setActiveRoomId('room_marcus');
    }
  };

  const blockContact = (userId: string) => {
    setRooms(prev => prev.filter(r => !r.members.some(m => m.id === userId)));
    closeModal();
    endCall();
  };

  const solveProofOfHuman = (challengeId: string, selectedIndex: number): boolean => {
    if (selectedIndex === activeProofChallenge.correctIndex) {
      setActiveProofChallenge(prev => ({ ...prev, isSolved: true }));
      setRooms(prev => prev.map(r => {
        if (r.id === 'room_scammer') {
          return {
            ...r,
            members: r.members.map(m => m.id === MOCK_USERS.unknown_scammer.id ? { ...m, isUnknownSender: false, trustScore: 50 } : m)
          };
        }
        return r;
      }));
      return true;
    }
    return false;
  };

  const verifyDeviceKey = () => {
    setDeviceKey(prev => ({
      ...prev,
      verifiedAt: new Date().toISOString()
    }));
    setRooms(prev => prev.map(r => r.id === 'room_marcus' ? { ...r, keySafetyVerified: true } : r));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserRole('user');
  };

  const loginWith2SV = (password: string) => {
    if (password.length >= 4) {
      setIsAuthenticated(true);
      setUserRole('user');
      return true;
    }
    return false;
  };

  const loginAsAdmin = (adminSecret: string) => {
    if (adminSecret === 'admin2026' || adminSecret.length >= 4) {
      setIsAuthenticated(true);
      setUserRole('admin');
      return true;
    }
    return false;
  };

  const updateUserByAdmin = (userId: string, updates: Partial<User>) => {
    setRooms(prev => prev.map(r => ({
      ...r,
      members: r.members.map(m => m.id === userId ? { ...m, ...updates } : m)
    })));
  };

  const addMemberToRoom = (roomId: string, newUser: User) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        if (r.members.some(m => m.id === newUser.id || m.phoneNumber === newUser.phoneNumber)) {
          return r;
        }
        return {
          ...r,
          members: [...r.members, newUser]
        };
      }
      return r;
    }));
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
    setRooms(prev => prev.map(r => ({
      ...r,
      members: r.members.map(m => m.id === currentUser.id ? { ...m, ...updates } : m)
    })));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      deviceKey,
      isAuthenticated,
      userRole,
      isAdmin: userRole === 'admin',
      theme,
      colorTheme,
      setColorTheme,
      toggleTheme,
      activeRoomId,
      setActiveRoomId,
      rooms,
      setRooms,
      messagesMap,
      activeCall,
      callHistory,
      acceptCall,
      declineCall,
      toggleMute,
      toggleCamera,
      toggleScreenShare,
      toggleCallMinimize,
      switchUserProfile,
      isWsConnected,
      wsLatencyMs,
      onlineUserIds,
      meshModeActive,
      toggleMeshMode,
      scamRadarActive,
      toggleScamRadar,
      aiRoastModeActive,
      toggleAiRoastMode,
      activeModal,
      openModal,
      closeModal,
      sendMessage,
      deleteMessage,
      deleteRoom,
      toggleArchiveRoom,
      togglePinRoom,
      togglePinMessage,
      addReaction,
      initiateCall,
      endCall,
      blockContact,
      solveProofOfHuman,
      triggerIncomingCallSimulation,
      verifyDeviceKey,
      activeProofChallenge,
      logout,
      loginWith2SV,
      loginAsAdmin,
      updateUserByAdmin,
      addMemberToRoom,
      updateCurrentUser,
      roomWallpapers,
      globalWallpaper,
      setRoomWallpaper,
      setGlobalWallpaper
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
