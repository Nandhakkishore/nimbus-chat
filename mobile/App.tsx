import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, StatusBar, TouchableOpacity, 
  TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, 
  Modal, Keyboard, Animated, Dimensions, PanResponder 
} from 'react-native';
import Constants from 'expo-constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Pure JS PCM 16-bit WAV Generator (RFC compliant, works in expo-av Audio.Sound and web HTML5 Audio)
function generateVoiceNoteWavBase64(durationSeconds = 3, baseFreq = 340): string {
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + numSamples * 2, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false);
  view.setUint32(40, numSamples * 2, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin((Math.PI * i) / numSamples);
    const freqMod = baseFreq + Math.sin(t * 7) * 35;
    const sample = Math.sin(2 * Math.PI * freqMod * t) * 0.6 +
                   Math.sin(4 * Math.PI * freqMod * t) * 0.25 +
                   Math.sin(6 * Math.PI * freqMod * t) * 0.15;
    const val = Math.max(-1, Math.min(1, sample * env)) * 0x7fff * 0.85;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  // Base64 encode
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return `data:audio/wav;base64,${base64}`;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MobileReaction {
  emoji: string;
  count: number;
}

export interface MobileMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  isMe: boolean;
  reactions?: MobileReaction[];
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  attachment?: {
    type: 'image' | 'file' | 'location' | 'voice';
    name: string;
    detail?: string;
    url?: string;
  };
}

export interface MobileRoom {
  id: string;
  title: string;
  avatar: string;
  isOnline: boolean;
  securityBadge: string;
  phone?: string;
  trustScore?: number;
}

export interface ActiveCallState {
  isVideo: boolean;
  duration: number;
  isMuted: boolean;
  isCameraOn: boolean;
  isSpeakerOn: boolean;
}

// Interactive Swipeable Message Bubble Component with Smooth Pan & Spring Physics
interface SwipeableMessageBubbleProps {
  msg: MobileMessage;
  onReply: (msg: MobileMessage) => void;
  onLongPress: (msg: MobileMessage) => void;
  children: React.ReactNode;
}

const SwipeableMessageBubble: React.FC<SwipeableMessageBubbleProps> = ({
  msg,
  onReply,
  onLongPress,
  children
}) => {
  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capture horizontal right swipes with sufficient distance and clear horizontal dominance
        return gestureState.dx > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          // Add friction curve past 65px
          const clampedX = Math.min(gestureState.dx * 0.75, 80);
          pan.setValue(clampedX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 45) {
          onReply(msg);
        }
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 9,
          speed: 18
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

  const replyIconScale = pan.interpolate({
    inputRange: [0, 20, 50, 80],
    outputRange: [0.3, 0.7, 1.15, 1.25],
    extrapolate: 'clamp'
  });

  const replyIconOpacity = pan.interpolate({
    inputRange: [0, 15, 45],
    outputRange: [0, 0.75, 1],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.swipeableMessageContainer}>
      {/* Background Reply Action Indicator */}
      <Animated.View 
        style={[
          styles.swipeReplyIndicator,
          {
            opacity: replyIconOpacity,
            transform: [
              { scale: replyIconScale },
              {
                translateX: pan.interpolate({
                  inputRange: [0, 80],
                  outputRange: [-24, 12],
                  extrapolate: 'clamp'
                })
              }
            ]
          }
        ]}
        pointerEvents="none"
      >
        <View style={styles.swipeReplyIconCircle}>
          <Text style={styles.swipeReplyIconText}>↩️</Text>
        </View>
      </Animated.View>

      {/* Foreground Message Bubble */}
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX: pan }]
        }}
      >
        <TouchableOpacity
          onLongPress={() => onLongPress(msg)}
          activeOpacity={0.92}
          style={[
            styles.messageBubble,
            msg.isMe ? styles.sentBubble : styles.receivedBubble
          ]}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function App(): React.JSX.Element {
  const [activeRoomId, setActiveRoomId] = useState<string>('room_marcus');
  const [inputText, setInputText] = useState<string>('');
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<MobileMessage | null>(null);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<MobileMessage | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState<boolean>(false);
  const [showEmojiPalette, setShowEmojiPalette] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const [voiceLevels, setVoiceLevels] = useState<number[]>([12, 22, 16, 28, 14, 24, 18, 20]);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<number>(0);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [pinnedMessageMap, setPinnedMessageMap] = useState<Record<string, MobileMessage | null>>({
    room_marcus: {
      id: 'm1',
      senderId: 'usr_marcus_02',
      senderName: 'Marcus Vance',
      text: 'Hey Elena! Double Ratchet session initiated. All keys hardware verified. 🔒',
      timestamp: '10:14 AM',
      status: 'read',
      isMe: false
    }
  });
  const [pinnedRoomIds, setPinnedRoomIds] = useState<string[]>(['room_marcus']);
  const [showContactDetails, setShowContactDetails] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wallpaper & Theme state for mobile
  const [roomWallpapers, setRoomWallpapers] = useState<Record<string, string>>({});
  const [globalWallpaper, setGlobalWallpaper] = useState<string>('#0b141a');
  const [showWallpaperModal, setShowWallpaperModal] = useState<boolean>(false);
  const [wallpaperScope, setWallpaperScope] = useState<'this' | 'all'>('this');
  const [mobileCustomUrl, setMobileCustomUrl] = useState<string>('');

  // Mention Suggestions state for mobile
  const [showMentionSuggestions, setShowMentionSuggestions] = useState<boolean>(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');

  // Camera Viewfinder Modal state for mobile
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [cameraFlash, setCameraFlash] = useState<'auto' | 'on' | 'off'>('auto');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSnapping, setIsSnapping] = useState<boolean>(false);

  // Contacts & Chats Full Screen Modal state for mobile
  const [showChatsList, setShowChatsList] = useState<boolean>(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState<string>('');
  const [chatsFilter, setChatsFilter] = useState<'all' | 'pinned' | 'unread' | 'groups'>('all');

  // Swipe-to-Back & Input References
  const inputRef = useRef<TextInput>(null);
  const backSwipePan = useRef(new Animated.Value(0)).current;
  const [isSwipingBack, setIsSwipingBack] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voicePlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mobileAudioRef = useRef<any>(null);

  // Trigger quick reply to specific message
  const handleStartReply = (msg: MobileMessage) => {
    setReplyingTo(msg);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    showToast(`↩️ Replying to ${msg.senderName}`);
  };

  // Edge Swipe-to-Back PanResponder (Left-edge swipe to reveal chats/contacts list)
  const backPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isLeftEdge = evt.nativeEvent.pageX <= 75;
        const isHorizontalRight = gestureState.dx > 15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        return isLeftEdge && isHorizontalRight;
      },
      onPanResponderGrant: () => {
        setIsSwipingBack(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          const clamped = Math.min(gestureState.dx, 180);
          backSwipePan.setValue(clamped);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 75 || gestureState.vx > 0.35) {
          Animated.timing(backSwipePan, {
            toValue: 220,
            duration: 160,
            useNativeDriver: true
          }).start(() => {
            setShowChatsList(true);
            backSwipePan.setValue(0);
            setIsSwipingBack(false);
          });
        } else {
          Animated.spring(backSwipePan, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6
          }).start(() => {
            setIsSwipingBack(false);
          });
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(backSwipePan, {
          toValue: 0,
          useNativeDriver: true
        }).start(() => {
          setIsSwipingBack(false);
        });
      }
    })
  ).current;

  const activeRoomIdRef = useRef<string>(activeRoomId);
  activeRoomIdRef.current = activeRoomId;

  // Safe Audio Player (HTML5 Audio + Web Audio fallback, with safe dynamic Expo loader)
  const playMobileAudioSound = (durationSeconds: number = 4) => {
    try {
      const wavUri = generateVoiceNoteWavBase64(durationSeconds, 320);

      // 1. HTML5 Audio (Mobile Web Browser & WebView)
      if (typeof window !== 'undefined' && (window as any).Audio) {
        try {
          const htmlAudio = new (window as any).Audio(wavUri);
          htmlAudio.volume = 0.9;
          htmlAudio.play().catch(() => {});
          mobileAudioRef.current = {
            stop: () => { try { htmlAudio.pause(); } catch {} }
          };
          return;
        } catch {}
      }

      // 3. Web Audio Context Synthesizer
      if (typeof window !== 'undefined') {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(420, ctx.currentTime + 0.3);
          osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 1.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + durationSeconds);
          mobileAudioRef.current = {
            stop: () => { try { osc.stop(); } catch {} }
          };
        }
      }
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  };

  const stopMobileAudioSound = () => {
    if (mobileAudioRef.current) {
      try {
        if (typeof mobileAudioRef.current.stopAsync === 'function') {
          mobileAudioRef.current.stopAsync().catch(() => {});
          mobileAudioRef.current.unloadAsync().catch(() => {});
        } else if (typeof mobileAudioRef.current.stop === 'function') {
          mobileAudioRef.current.stop();
        }
      } catch {}
      mobileAudioRef.current = null;
    }
  };

  const rooms: MobileRoom[] = [
    {
      id: 'room_marcus',
      title: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      securityBadge: 'Hardware Verified (Double Ratchet)',
      phone: '+1 (415) 555-0142',
      trustScore: 96
    },
    {
      id: 'room_aris',
      title: 'Dr. Aris Thorne',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      securityBadge: 'Quantum Security Institute (98%)',
      phone: '+41 22 555 0188',
      trustScore: 88
    },
    {
      id: 'room_scammer',
      title: 'Unknown Contact (+1 917)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isOnline: false,
      securityBadge: 'Unverified Peer • Risk Detected',
      phone: '+1 (917) 555-0188',
      trustScore: 31
    },
    {
      id: 'room_ephemeral_sf',
      title: '⚡ Ephemeral: Tech Meetup SF',
      avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      securityBadge: 'Self-Destruct (60s)',
      phone: 'Mesh Broadcast Group',
      trustScore: 99
    },
    {
      id: 'room_channel_announcements',
      title: '📢 HumanLink Security Updates',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      isOnline: true,
      securityBadge: 'Verified Broadcast Channel',
      phone: 'Official Channel',
      trustScore: 100
    }
  ];

  const [messagesMap, setMessagesMap] = useState<Record<string, MobileMessage[]>>({
    room_marcus: [
      {
        id: 'm1',
        senderId: 'usr_marcus_02',
        senderName: 'Marcus Vance',
        text: 'Hey Elena! Double Ratchet session initiated. All keys hardware verified. 🔒',
        timestamp: '10:14 AM',
        status: 'read',
        isMe: false,
        reactions: [{ emoji: '👍', count: 1 }, { emoji: '🔒', count: 1 }]
      },
      {
        id: 'm2',
        senderId: 'usr_me_001',
        senderName: 'Elena Rostova',
        text: 'Perfect! Zero-leakage signal protocol active on mobile & web.',
        timestamp: '10:15 AM',
        status: 'read',
        isMe: true,
        reactions: [{ emoji: '❤️', count: 1 }]
      }
    ],
    room_aris: [
      {
        id: 'a1',
        senderId: 'usr_aris_03',
        senderName: 'Dr. Aris Thorne',
        text: 'Elena, post-quantum lattice cryptography paper is finalized. Peer keys verified.',
        timestamp: '11:15 AM',
        status: 'read',
        isMe: false,
        reactions: [{ emoji: '🔬', count: 1 }]
      }
    ],
    room_scammer: [
      {
        id: 's1',
        senderId: 'usr_unknown_99',
        senderName: 'Unknown Contact',
        text: 'URGENT: Your account access is restricted. Click link to verify: http://secure-login-phish.net',
        timestamp: '09:30 AM',
        status: 'read',
        isMe: false,
        reactions: [{ emoji: '⚠️', count: 1 }]
      }
    ],
    room_ephemeral_sf: [
      {
        id: 'e1',
        senderId: 'usr_marcus_02',
        senderName: 'Marcus Vance',
        text: 'Welcome to the Ephemeral self-destruct group space! Messages burn 60s after read.',
        timestamp: '11:00 AM',
        status: 'read',
        isMe: false,
        reactions: [{ emoji: '🔥', count: 2 }]
      }
    ],
    room_channel_announcements: [
      {
        id: 'c1',
        senderId: 'usr_system',
        senderName: 'HumanLink Security',
        text: '📢 System Update: E2EE Mobile Signaling v2.4 deployed with zero-leakage ephemeral storage.',
        timestamp: '09:00 AM',
        status: 'read',
        isMe: false,
        reactions: [{ emoji: '🛡️', count: 4 }]
      }
    ]
  });

  // Filtered and sorted mobile rooms
  const filteredMobileRooms = rooms.filter(room => {
    const q = mobileSearchQuery.toLowerCase().trim();
    const matchesSearch = !q || room.title.toLowerCase().includes(q) || (room.phone && room.phone.toLowerCase().includes(q));
    if (!matchesSearch) return false;
    if (chatsFilter === 'pinned') return pinnedRoomIds.includes(room.id);
    if (chatsFilter === 'unread') {
      const msgs = messagesMap[room.id] || [];
      return msgs.some(m => !m.isMe && m.status !== 'read') || room.id === 'room_scammer';
    }
    if (chatsFilter === 'groups') return room.id.includes('sf') || room.id.includes('channel');
    return true;
  }).sort((a, b) => {
    const aPinned = pinnedRoomIds.includes(a.id) ? 1 : 0;
    const bPinned = pinnedRoomIds.includes(b.id) ? 1 : 0;
    return bPinned - aPinned;
  });

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const activeMessages = messagesMap[activeRoomId] || [];

  // Persistent WebSocket Server Connection for real-time synchronization
  useEffect(() => {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri || (Constants as any).manifest?.debuggerHost;
    const hostIp = hostUri ? hostUri.split(':')[0] : '192.168.137.245';
    const wsUrl = `ws://${hostIp}:4000`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsWsConnected(true);
        // Register client user
        socket?.send(JSON.stringify({
          event: 'signal:register',
          payload: {
            userId: 'usr_me_001',
            displayName: 'Elena Rostova (Mobile)'
          }
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'chat:inbound_message' && data.payload) {
            const inbound = data.payload;
            const targetRoomId = inbound.roomId || activeRoomIdRef.current;
            
            // Ignore echoes from self
            if (inbound.senderId === 'usr_me_001') return;

            setMessagesMap(prev => {
              const currentList = prev[targetRoomId] || [];
              if (currentList.some(m => m.id === inbound.id)) {
                return prev;
              }
              return {
                ...prev,
                [targetRoomId]: [...currentList, {
                  id: inbound.id || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  senderId: inbound.senderId || 'peer',
                  senderName: inbound.senderName || 'Peer',
                  text: inbound.text || '',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'read',
                  isMe: false,
                  reactions: []
                }]
              };
            });
          } else if (data.event === 'call:incoming') {
            setActiveCall({
              isVideo: !!data.payload?.isVideo,
              duration: 0,
              isMuted: false,
              isCameraOn: !!data.payload?.isVideo,
              isSpeakerOn: true
            });
          } else if (data.event === 'call:ended' || data.event === 'call:rejected') {
            setActiveCall(null);
          } else if (data.event === 'chat:room_pinned' && data.payload) {
            const { roomId, isPinned } = data.payload;
            setPinnedRoomIds(prev => isPinned ? [...prev.filter(id => id !== roomId), roomId] : prev.filter(id => id !== roomId));
          } else if (data.event === 'chat:message_pinned' && data.payload) {
            const { roomId, pinnedMessage } = data.payload;
            setPinnedMessageMap(prev => ({ ...prev, [roomId]: pinnedMessage }));
          } else if (data.event === 'signal:registered' && data.payload) {
            if (Array.isArray(data.payload.pinnedRoomIds)) {
              setPinnedRoomIds(data.payload.pinnedRoomIds);
            }
            if (data.payload.pinnedMessages) {
              setPinnedMessageMap(data.payload.pinnedMessages);
            }
          }
        } catch {
          // Ignore parse errors
        }
      };

      socket.onclose = () => setIsWsConnected(false);
      socket.onerror = () => setIsWsConnected(false);
    } catch {
      setIsWsConnected(false);
    }

    return () => {
      if (socket) socket.close();
    };
  }, []);

  // Keep scroll pinned to bottom when messages change or keyboard appears
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [activeMessages]);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', 
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    );
    return () => showSub.remove();
  }, []);

  // In-call duration timer
  useEffect(() => {
    if (activeCall) {
      callTimerRef.current = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCall !== null]);

  // Voice recording duration timer & live audio wave animation
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setVoiceDuration(v => v + 1);
        setVoiceLevels([
          Math.floor(8 + Math.random() * 22),
          Math.floor(14 + Math.random() * 24),
          Math.floor(6 + Math.random() * 26),
          Math.floor(16 + Math.random() * 20),
          Math.floor(20 + Math.random() * 18),
          Math.floor(10 + Math.random() * 24),
          Math.floor(15 + Math.random() * 20),
          Math.floor(8 + Math.random() * 25)
        ]);
      }, 500);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Handle Send Message
  const handleSend = useCallback((overrideText?: string, attachment?: MobileMessage['attachment']) => {
    const messageContent = overrideText !== undefined ? overrideText : inputText;
    if (!messageContent.trim() && !attachment) return;

    const newMsg: MobileMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      senderId: 'usr_me_001',
      senderName: 'Elena Rostova',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isMe: true,
      reactions: [],
      replyTo: replyingTo ? {
        id: replyingTo.id,
        senderName: replyingTo.senderName,
        text: replyingTo.text
      } : undefined,
      attachment
    };

    const currentRoomId = activeRoomId;

    setMessagesMap(prev => ({
      ...prev,
      [currentRoomId]: [...(prev[currentRoomId] || []), newMsg]
    }));

    // Send to WebSocket server if connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'chat:send_message',
        payload: {
          id: newMsg.id,
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          text: newMsg.text,
          roomId: currentRoomId,
          replyTo: newMsg.replyTo,
          attachment: newMsg.attachment
        }
      }));
    }

    setInputText('');
    setReplyingTo(null);

    // Delivery Status Transition: sent -> delivered -> read
    setTimeout(() => {
      setMessagesMap(prev => ({
        ...prev,
        [currentRoomId]: (prev[currentRoomId] || []).map(m => m.id === newMsg.id ? { ...m, status: 'delivered' } : m)
      }));
    }, 400);

    setTimeout(() => {
      setMessagesMap(prev => ({
        ...prev,
        [currentRoomId]: (prev[currentRoomId] || []).map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)
      }));
    }, 900);
  }, [inputText, activeRoomId, replyingTo]);

  // Add emoji reaction to message
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessagesMap(prev => ({
      ...prev,
      [activeRoomId]: (prev[activeRoomId] || []).map(m => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const existing = currentReactions.find(r => r.emoji === emoji);
        let updated: MobileReaction[];
        if (existing) {
          updated = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
        } else {
          updated = [...currentReactions, { emoji, count: 1 }];
        }
        return { ...m, reactions: updated };
      })
    }));
    setSelectedMessageForAction(null);
    setShowEmojiPalette(false);
  };

  // Start Call (Audio or Video)
  const handleStartCall = (isVideo: boolean) => {
    setActiveCall({
      isVideo,
      duration: 0,
      isMuted: false,
      isCameraOn: isVideo,
      isSpeakerOn: true
    });

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'call:initiate',
        payload: {
          toUserId: activeRoom.id,
          isVideo,
          callId: `call_${Date.now()}`,
          caller: {
            id: 'usr_me_001',
            displayName: 'Elena Rostova (Mobile)'
          }
        }
      }));
    }
  };

  // End active call
  const handleEndCall = () => {
    setActiveCall(null);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'call:end',
        payload: {
          toUserId: activeRoom.id,
          callId: `call_${Date.now()}`
        }
      }));
    }
  };

  // Toast Notification helper
  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Toggle Pin Chat Room with Real-Time WebSocket Relay
  const handleTogglePinChat = (roomId: string) => {
    setPinnedRoomIds(prev => {
      const isPinned = prev.includes(roomId);
      const nextPinned = !isPinned;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          event: 'chat:pin_room',
          payload: { roomId, isPinned: nextPinned }
        }));
      }
      if (isPinned) {
        showToast('Chat unpinned');
        return prev.filter(id => id !== roomId);
      } else {
        showToast('📌 Chat pinned to top in real-time');
        return [...prev, roomId];
      }
    });
  };

  // Pin / Unpin a Message in the active room with Real-Time Relay
  const handlePinMessage = (msg: MobileMessage) => {
    const isAlreadyPinned = pinnedMessageMap[activeRoomId]?.id === msg.id;
    const nextMsg = isAlreadyPinned ? null : msg;
    setPinnedMessageMap(prev => ({ ...prev, [activeRoomId]: nextMsg }));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'chat:message_pinned',
        payload: { roomId: activeRoomId, pinnedMessage: nextMsg }
      }));
    }
    showToast(isAlreadyPinned ? 'Message unpinned' : '📌 Message pinned to top in real-time');
  };

  // Unpin the current pinned message
  const handleUnpinMessage = () => {
    setPinnedMessageMap(prev => ({ ...prev, [activeRoomId]: null }));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        event: 'chat:message_pinned',
        payload: { roomId: activeRoomId, pinnedMessage: null }
      }));
    }
    showToast('Message unpinned');
  };

  // Copy message text to composer input
  const handleCopyMessage = (msg: MobileMessage) => {
    setInputText(msg.text);
    showToast('📋 Message copied to input');
  };

  // Delete message from current conversation
  const handleDeleteMessage = (msgId: string) => {
    setMessagesMap(prev => ({
      ...prev,
      [activeRoomId]: (prev[activeRoomId] || []).filter(m => m.id !== msgId)
    }));
    if (pinnedMessageMap[activeRoomId]?.id === msgId) {
      setPinnedMessageMap(prev => ({ ...prev, [activeRoomId]: null }));
    }
    showToast('🗑️ Message deleted');
  };

  // Toggle Voice Note Audio Playback simulation with REAL audible sound
  const handleToggleVoicePlayback = (msgId: string) => {
    if (playingVoiceId === msgId) {
      if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
      stopMobileAudioSound();
      setPlayingVoiceId(null);
      setVoiceProgress(0);
    } else {
      if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
      stopMobileAudioSound();
      setPlayingVoiceId(msgId);
      setVoiceProgress(0.08);
      playMobileAudioSound(4);
      let p = 0.08;
      voicePlayTimerRef.current = setInterval(() => {
        p += 0.05;
        if (p >= 1) {
          if (voicePlayTimerRef.current) clearInterval(voicePlayTimerRef.current);
          stopMobileAudioSound();
          setPlayingVoiceId(null);
          setVoiceProgress(0);
        } else {
          setVoiceProgress(p);
        }
      }, 200);
    }
  };

  // Send Attachment action (Photo, Document, Location, Contact, Audio)
  const handleSendAttachment = (type: 'image' | 'file' | 'location' | 'contact' | 'audio') => {
    setShowAttachMenu(false);
    if (type === 'image') {
      handleSend('📷 Secure encrypted photo', {
        type: 'image',
        name: 'Photo_2026_E2EE.jpg',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
      });
      showToast('📷 Photo encrypted & sent');
    } else if (type === 'file') {
      handleSend('📑 Confidential Hardware Specification.pdf', {
        type: 'file',
        name: 'Specification_DoubleRatchet.pdf',
        detail: '2.4 MB • SHA-256 Verified'
      });
      showToast('📄 Document encrypted & sent');
    } else if (type === 'location') {
      handleSend('📍 Live Hardware Beacon Location', {
        type: 'location',
        name: 'San Francisco HQ (Secured Node)',
        detail: '37.7749° N, 122.4194° W'
      });
      showToast('📍 Live GPS Location broadcast');
    } else if (type === 'contact') {
      handleSend(`👤 Verified Peer: ${activeRoom.title} (${activeRoom.phone || '+1 415-555-0142'})`);
      showToast('👤 Contact card shared');
    } else if (type === 'audio') {
      handleSend('🎵 Encrypted Audio Recording.m4a', {
        type: 'voice',
        name: 'Voice Memo (00:08)',
        detail: 'Double Ratchet Audio Payload'
      });
      showToast('🎵 Audio memo sent');
    }
  };

  // Complete and send voice note
  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const duration = Math.max(voiceDuration, 1);
    const durationStr = `${String(Math.floor(duration / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}`;
    handleSend(`🎤 Voice Note (${durationStr})`, {
      type: 'voice',
      name: `Voice Memo (${durationStr})`,
      detail: 'Double Ratchet Encrypted Audio'
    });
    setVoiceDuration(0);
    showToast('🎤 Voice note encrypted & sent');
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Mobile Wallpaper Management
  const currentMobileWallpaper = roomWallpapers[activeRoomId] || globalWallpaper || '#0b141a';

  const handleApplyMobileWallpaper = (wpColor: string) => {
    if (wallpaperScope === 'this') {
      setRoomWallpapers(prev => ({ ...prev, [activeRoomId]: wpColor }));
      showToast(`🎨 Wallpaper applied to ${activeRoom.title}`);
    } else {
      setGlobalWallpaper(wpColor);
      showToast('🎨 Wallpaper applied to All Chats');
    }
    setShowWallpaperModal(false);
  };

  const handleResetMobileWallpaper = () => {
    if (wallpaperScope === 'this') {
      setRoomWallpapers(prev => {
        const next = { ...prev };
        delete next[activeRoomId];
        return next;
      });
      showToast(`Reset wallpaper for ${activeRoom.title}`);
    } else {
      setGlobalWallpaper('#0b141a');
      showToast('Reset global wallpaper');
    }
    setShowWallpaperModal(false);
  };

  // Mobile Mention auto-detect & suggestions
  const handleMobileInputChange = (text: string) => {
    setInputText(text);
    const lastAt = text.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(text[lastAt - 1]))) {
      const q = text.slice(lastAt + 1);
      setMentionQuery(q);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
    }
  };

  const handleSelectMention = (tag: string) => {
    const lastAt = inputText.lastIndexOf('@');
    if (lastAt !== -1) {
      setInputText(inputText.slice(0, lastAt) + tag + ' ');
    } else {
      setInputText(prev => prev + (prev.endsWith(' ') || !prev ? '' : ' ') + tag + ' ');
    }
    setShowMentionSuggestions(false);
  };

  const mobileMentions = [
    { tag: '@everyone', label: '📢 @everyone', desc: 'Notify everyone', color: '#38ef7d' },
    { tag: '@all', label: '👥 @all', desc: 'Broadcast to group', color: '#38ef7d' },
    { tag: `@${activeRoom.title}`, label: `👤 @${activeRoom.title}`, desc: 'Public tag', color: '#53bdeb' },
    { tag: `@private:${activeRoom.title}`, label: `🔒 @private:${activeRoom.title}`, desc: 'Encrypted whisper', color: '#c084fc' }
  ].filter(m => !mentionQuery || m.tag.toLowerCase().includes(mentionQuery.toLowerCase()));

  // Render text with styled mention badges
  const renderMobileMessageText = (text: string) => {
    const parts = text.split(/(@everyone|@all|@private:[^\s]+|@[\w\s.]+(?=\b|[.,!?]|$))/g);
    if (parts.length <= 1) {
      return <Text style={styles.messageText}>{text}</Text>;
    }
    return (
      <Text style={styles.messageText}>
        {parts.map((part, pIdx) => {
          if (part === '@everyone' || part === '@all') {
            return (
              <Text key={pIdx} style={styles.mentionBadgeAll}>
                {' '}{part}{' '}
              </Text>
            );
          }
          if (part.startsWith('@private:')) {
            const name = part.replace('@private:', '');
            return (
              <Text key={pIdx} style={styles.mentionBadgeWhisper}>
                {' 🔒 Whisper to ' + name + ' '}
              </Text>
            );
          }
          if (part.startsWith('@') && part.length > 1) {
            return (
              <Text key={pIdx} style={styles.mentionBadgeUser}>
                {' '}{part}{' '}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  // Mobile Camera Snapshot Simulation
  const handleSnapMobilePhoto = () => {
    setIsSnapping(true);
    setTimeout(() => {
      setIsSnapping(false);
      const url = cameraFacing === 'front' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80';
      setCapturedPhoto(url);
    }, 280);
  };

  const handleSendMobilePhoto = () => {
    if (!capturedPhoto) return;
    handleSend('📷 Encrypted Hardware Snapshot (SHA-256 Verified)', {
      type: 'image',
      name: 'Snapshot_Mobile_E2EE.jpg',
      url: capturedPhoto,
      detail: 'Hardware Verified (Double Ratchet)'
    });
    setCapturedPhoto(null);
    setShowCameraModal(false);
    showToast('📷 Encrypted photo sent to chat');
  };

  return (
    <SafeAreaView style={styles.safeArea} {...backPanResponder.panHandlers}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <View style={styles.toastContainer} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Interactive Edge Back Indicator & Contact Peek Card (Swipe to go back) */}
      {isSwipingBack && (
        <Animated.View
          style={[
            styles.edgeBackIndicatorContainer,
            {
              transform: [
                {
                  translateX: backSwipePan.interpolate({
                    inputRange: [0, 150],
                    outputRange: [-110, 16],
                    extrapolate: 'clamp'
                  })
                },
                {
                  scale: backSwipePan.interpolate({
                    inputRange: [0, 80, 150],
                    outputRange: [0.85, 1.05, 1.12],
                    extrapolate: 'clamp'
                  })
                }
              ],
              opacity: backSwipePan.interpolate({
                inputRange: [0, 20, 75],
                outputRange: [0, 0.85, 1],
                extrapolate: 'clamp'
              })
            }
          ]}
          pointerEvents="none"
        >
          <View style={styles.edgeBackPill}>
            <View style={styles.edgeBackArrowCircle}>
              <Text style={styles.edgeBackArrowText}>←</Text>
            </View>
            <View style={styles.edgeBackCardContent}>
              <Text style={styles.edgeBackTitle}>All Chats</Text>
              <Text style={styles.edgeBackSubtitle}>
                Release to view contacts list
              </Text>
            </View>
            <View style={styles.edgeBackBadge}>
              <Text style={styles.edgeBackBadgeText}>5</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Top Mobile Header with adjusted Android Notch / Status Bar padding */}
      <View style={styles.header}>
        {/* Back Button to View All Contacts / Chats List */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setShowChatsList(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerLeft} 
          onPress={() => setShowContactDetails(true)}
          activeOpacity={0.75}
        >
          <Image source={{ uri: activeRoom.avatar }} style={styles.avatar} />
          <View style={styles.headerTextContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>{activeRoom.title}</Text>
              {pinnedRoomIds.includes(activeRoomId) && (
                <Text style={{ fontSize: 13 }}>📌</Text>
              )}
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isWsConnected ? styles.dotOnline : styles.dotOffline]} />
              <Text style={styles.headerSubtitle}>
                {isWsConnected ? 'online • E2EE Gateway' : 'local • Double Ratchet'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {/* Pin Chat Toggle Button */}
          <TouchableOpacity 
            style={[
              styles.headerIconButton, 
              pinnedRoomIds.includes(activeRoomId) && styles.headerIconButtonActive
            ]} 
            onPress={() => handleTogglePinChat(activeRoomId)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.iconText}>📌</Text>
          </TouchableOpacity>

          {/* Wallpaper & Theme Selector */}
          <TouchableOpacity 
            style={styles.headerIconButton} 
            onPress={() => setShowWallpaperModal(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.iconText}>🎨</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.headerIconButton} 
            onPress={() => handleStartCall(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerIconButton} 
            onPress={() => handleStartCall(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Room Switcher Horizontal Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {rooms.map(room => {
            const isRoomPinned = pinnedRoomIds.includes(room.id);
            return (
              <TouchableOpacity
                key={room.id}
                onPress={() => {
                  setActiveRoomId(room.id);
                  setReplyingTo(null);
                }}
                style={[
                  styles.tabButton,
                  activeRoomId === room.id && styles.activeTabButton
                ]}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeRoomId === room.id && styles.activeTabButtonText
                ]}>
                  {isRoomPinned ? `📌 ${room.title}` : room.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Pinned Message Sticky Banner */}
      {pinnedMessageMap[activeRoomId] && (
        <View style={styles.pinnedBanner}>
          <Text style={styles.pinnedBannerIcon}>📌</Text>
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
              showToast('Scrolled to pinned message');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.pinnedBannerLabel}>Pinned Message</Text>
            <Text style={styles.pinnedBannerText} numberOfLines={1}>
              {pinnedMessageMap[activeRoomId]?.text}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.pinnedBannerClose}
            onPress={handleUnpinMessage}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.pinnedBannerCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active Room Security Context Notice */}
      {activeRoomId === 'room_scammer' && (
        <View style={styles.securityWarningBanner}>
          <Text style={styles.securityWarningText}>
            ⚠️ AI Scam Shield: Unverified peer. Phishing detection active.
          </Text>
        </View>
      )}

      {activeRoomId === 'room_ephemeral_sf' && (
        <View style={styles.ephemeralBanner}>
          <Text style={styles.ephemeralBannerText}>
            ⚡ Self-Destruct Active: All messages incinerate 60s after read.
          </Text>
        </View>
      )}

      {/* Active Chat Message Stream with Dynamic Wallpaper & Keyboard Avoiding Pad */}
      <KeyboardAvoidingView 
        style={[styles.chatContainer, { backgroundColor: (currentMobileWallpaper.startsWith('http') || currentMobileWallpaper.startsWith('data:') || currentMobileWallpaper.startsWith('file:')) ? '#0b141a' : currentMobileWallpaper }]} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 25 : 0}
      >
        {(currentMobileWallpaper.startsWith('http') || currentMobileWallpaper.startsWith('data:') || currentMobileWallpaper.startsWith('file:')) && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Image 
              source={{ uri: currentMobileWallpaper }} 
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }} 
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(11, 20, 26, 0.72)' }]} />
          </View>
        )}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>TODAY • {activeRoom.securityBadge.toUpperCase()}</Text>
          </View>

          {activeMessages.map((msg, idx) => (
            <SwipeableMessageBubble
              key={`${msg.id || 'msg'}_${idx}`} 
              msg={msg}
              onReply={handleStartReply}
              onLongPress={setSelectedMessageForAction}
            >
              {!msg.isMe && (
                <Text style={styles.senderName}>{msg.senderName}</Text>
              )}

              {/* Embedded Quoted Reply Preview */}
              {msg.replyTo && (
                <View style={styles.quotedReplyBox}>
                  <Text style={styles.quotedReplySender}>{msg.replyTo.senderName}</Text>
                  <Text style={styles.quotedReplyText} numberOfLines={2}>{msg.replyTo.text}</Text>
                </View>
              )}

              {/* Rich Attachment Preview */}
              {msg.attachment?.type === 'image' && (
                <View style={styles.attachmentImageContainer}>
                  <Image source={{ uri: msg.attachment.url }} style={styles.attachmentImage} />
                </View>
              )}

              {msg.attachment?.type === 'file' && (
                <View style={styles.attachmentFileBox}>
                  <Text style={styles.attachmentFileIcon}>📄</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachmentFileName} numberOfLines={1}>{msg.attachment.name}</Text>
                    <Text style={styles.attachmentFileDetail}>{msg.attachment.detail}</Text>
                  </View>
                </View>
              )}

              {msg.attachment?.type === 'location' && (
                <View style={styles.attachmentLocationBox}>
                  <Text style={styles.attachmentLocationIcon}>📍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachmentLocationTitle}>{msg.attachment.name}</Text>
                    <Text style={styles.attachmentLocationCoord}>{msg.attachment.detail}</Text>
                  </View>
                </View>
              )}

              {msg.attachment?.type === 'voice' && (
                <View style={styles.voiceNoteRow}>
                  <TouchableOpacity 
                    style={styles.voicePlayBtn}
                    onPress={() => handleToggleVoicePlayback(msg.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                      {playingVoiceId === msg.id ? '⏸' : '▶'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.voiceWaveform}>
                    <View 
                      style={[
                        styles.voiceWaveTrack, 
                        { width: playingVoiceId === msg.id ? `${Math.round(voiceProgress * 100)}%` : '40%' }
                      ]} 
                    />
                  </View>
                  <Text style={styles.voiceDuration}>
                    {playingVoiceId === msg.id 
                      ? `${Math.round(voiceProgress * 4)}s / 4s` 
                      : (msg.attachment.name.split('(')[1]?.replace(')', '') || '00:04')}
                  </Text>
                </View>
              )}

              {/* Message text with Mentions & Whispers Highlighted */}
              {renderMobileMessageText(msg.text)}
              
              <View style={styles.metaRow}>
                <Text style={styles.timestamp}>{msg.timestamp}</Text>
                {msg.isMe && (
                  <Text style={[
                    styles.checkmarks,
                    msg.status === 'read' && styles.readCheckmarks
                  ]}>
                    {msg.status === 'sent' ? '✓' : '✓✓'}
                  </Text>
                )}
              </View>

              {/* Reaction Badges */}
              {msg.reactions && msg.reactions.length > 0 && (
                <View style={styles.reactionsRow}>
                  {msg.reactions.map((r, rIdx) => (
                    <TouchableOpacity 
                      key={rIdx} 
                      style={styles.reactionPill}
                      onPress={() => handleAddReaction(msg.id, r.emoji)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                      {r.count > 1 && <Text style={styles.reactionCount}>{r.count}</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </SwipeableMessageBubble>
          ))}
        </ScrollView>

        {/* Replying-To Context Banner above input pad */}
        {replyingTo && (
          <View style={styles.replyBanner}>
            <View style={styles.replyBannerIndicator} />
            <View style={{ flex: 1 }}>
              <Text style={styles.replyBannerTitle}>Replying to {replyingTo.senderName}</Text>
              <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} style={styles.replyBannerClose}>
              <Text style={styles.replyBannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MENTION SUGGESTIONS HORIZONTAL TRAY */}
        {showMentionSuggestions && mobileMentions.length > 0 && (
          <View style={styles.mentionSuggestionsTray}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12 }}>
              {mobileMentions.map((m, mIdx) => (
                <TouchableOpacity
                  key={mIdx}
                  style={styles.mentionSuggestionPill}
                  onPress={() => handleSelectMention(m.tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.mentionSuggestionLabel, { color: m.color }]}>{m.label}</Text>
                  <Text style={styles.mentionSuggestionDesc}>{m.desc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Live Typing Draft Indicator */}
        {inputText.length > 0 && (
          <View style={styles.liveTypingBanner}>
            <Text style={styles.liveTypingLabel}>Draft: </Text>
            <Text style={styles.liveTypingText} numberOfLines={1}>{inputText}</Text>
            <TouchableOpacity onPress={() => setInputText('')} style={styles.liveTypingClear}>
              <Text style={styles.liveTypingClearText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modern Full-Width Capsule Typebar / Composer */}
        <View style={styles.composerWrapper}>
          {isRecordingVoice ? (
            <View style={styles.recordingRow}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>● {formatTimer(voiceDuration)}</Text>
              
              {/* Dynamic Sound Wave Bars */}
              <View style={styles.recordingWaveBars}>
                {voiceLevels.map((lvl, lIdx) => (
                  <View 
                    key={lIdx} 
                    style={[styles.recordingWaveBar, { height: lvl }]} 
                  />
                ))}
              </View>

              <TouchableOpacity 
                onPress={() => setIsRecordingVoice(false)} 
                style={styles.cancelRecordingBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelRecordingText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSendVoiceNote} 
                style={styles.sendVoiceBtn}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modernInputBar}>
              {/* Outer Left Action Buttons: 😊 Emoji & @ Mention */}
              <View style={styles.composerLeftButtons}>
                <TouchableOpacity 
                  style={[styles.composerIconBtn, showEmojiPalette && styles.composerIconBtnActive]}
                  onPress={() => setShowEmojiPalette(v => !v)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.composerIconText}>😊</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.composerIconBtn, showMentionSuggestions && styles.composerIconBtnActive]}
                  onPress={() => {
                    setShowMentionSuggestions(v => !v);
                    setMentionQuery('');
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.composerIconText, showMentionSuggestions && { color: '#00a884', fontWeight: 'bold' }]}>@</Text>
                </TouchableOpacity>
              </View>

              {/* Center Capsule: Full-width TextInput with embedded 📎 Attach, 📷 Camera, 📌 Pin */}
              <View style={[
                styles.composerCapsule,
                isInputFocused && styles.composerCapsuleFocused
              ]}>
                <TextInput
                  ref={inputRef}
                  style={styles.composerTextInput}
                  placeholder={replyingTo ? `Replying to ${replyingTo.senderName}...` : "Type a message or @..."}
                  placeholderTextColor="#94a3b8"
                  value={inputText}
                  onChangeText={handleMobileInputChange}
                  onFocus={() => {
                    setIsInputFocused(true);
                    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 120);
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  onSubmitEditing={() => handleSend()}
                  returnKeyType="send"
                  multiline={true}
                  cursorColor="#00a884"
                  selectionColor="rgba(0, 168, 132, 0.4)"
                />

                {/* Embedded Actions inside the input capsule on the right */}
                <View style={styles.capsuleInnerActions}>
                  {/* Attach Media & Files */}
                  <TouchableOpacity 
                    style={styles.capsuleIconBtn}
                    onPress={() => setShowAttachMenu(true)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Text style={styles.capsuleIconText}>📎</Text>
                  </TouchableOpacity>

                  {/* Dedicated Camera Viewfinder Button */}
                  <TouchableOpacity 
                    style={styles.capsuleIconBtn}
                    onPress={() => setShowCameraModal(true)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Text style={styles.capsuleIconText}>📷</Text>
                  </TouchableOpacity>

                  {/* Real-time Pin Chat / Message Shortcut */}
                  <TouchableOpacity 
                    style={[
                      styles.capsuleIconBtn,
                      pinnedRoomIds.includes(activeRoomId) && styles.capsuleIconBtnPinned
                    ]}
                    onPress={() => handleTogglePinChat(activeRoomId)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Text style={[styles.capsuleIconText, { fontSize: 16 }]}>
                      {pinnedRoomIds.includes(activeRoomId) ? '📌' : '📍'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Floating Outer Right Action Button (Send / Mic) */}
              {inputText.trim() ? (
                <TouchableOpacity 
                  style={styles.composerSendBtn} 
                  onPress={() => handleSend()} 
                  activeOpacity={0.8}
                >
                  <Text style={styles.composerSendIcon}>➤</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.composerMicBtn} 
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsRecordingVoice(true);
                  }}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.composerMicIcon}>🎤</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Quick Emoji Picker Drawer */}
        {showEmojiPalette && (
          <View style={styles.emojiDrawer}>
            {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🙏', '🔒', '🥑'].map((emoji, eIdx) => (
              <TouchableOpacity 
                key={eIdx} 
                style={styles.emojiDrawerItem}
                onPress={() => {
                  if (activeMessages.length > 0) {
                    const lastMsg = activeMessages[activeMessages.length - 1];
                    handleAddReaction(lastMsg.id, emoji);
                  } else {
                    setInputText(prev => prev + emoji);
                  }
                  setShowEmojiPalette(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiLarge}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Message Action Sheet Modal (Reply, Pin, Copy, Delete, Reactions) */}
      <Modal
        visible={selectedMessageForAction !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessageForAction(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setSelectedMessageForAction(null)}
          />
          <View style={styles.actionSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.actionSheetTitle}>Message Actions & Reactions</Text>
            
            {/* Emoji Reactions Row */}
            <View style={styles.actionSheetEmojis}>
              {['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '🔒'].map((emoji, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.actionEmojiBtn}
                  onPress={() => {
                    if (selectedMessageForAction) {
                      handleAddReaction(selectedMessageForAction.id, emoji);
                    }
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionSheetDivider} />

            {/* Reply */}
            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                if (selectedMessageForAction) {
                  setReplyingTo(selectedMessageForAction);
                }
                setSelectedMessageForAction(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionSheetIcon}>↩️</Text>
              <Text style={styles.actionSheetLabel}>Reply to this message</Text>
            </TouchableOpacity>

            {/* Pin / Unpin Message */}
            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                if (selectedMessageForAction) {
                  handlePinMessage(selectedMessageForAction);
                }
                setSelectedMessageForAction(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionSheetIcon}>📌</Text>
              <Text style={styles.actionSheetLabel}>
                {pinnedMessageMap[activeRoomId]?.id === selectedMessageForAction?.id 
                  ? 'Unpin from Top of Chat' 
                  : 'Pin to Top of Chat'}
              </Text>
            </TouchableOpacity>

            {/* Copy Text */}
            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                if (selectedMessageForAction) {
                  handleCopyMessage(selectedMessageForAction);
                }
                setSelectedMessageForAction(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionSheetIcon}>📋</Text>
              <Text style={styles.actionSheetLabel}>Copy Message Text</Text>
            </TouchableOpacity>

            {/* Delete Message */}
            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => {
                if (selectedMessageForAction) {
                  handleDeleteMessage(selectedMessageForAction.id);
                }
                setSelectedMessageForAction(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionSheetIcon}>🗑️</Text>
              <Text style={[styles.actionSheetLabel, { color: '#ef4444' }]}>Delete Message</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionSheetRow}
              onPress={() => setSelectedMessageForAction(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionSheetIcon}>✕</Text>
              <Text style={[styles.actionSheetLabel, { color: '#8696a0' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Attachment Options Drawer Modal (Photo, Document, Location, Contact, Audio) */}
      <Modal
        visible={showAttachMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowAttachMenu(false)}
          />
          <View style={styles.attachSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.attachSheetTitle}>Share Encrypted Media</Text>
            <View style={styles.attachGrid}>
              <TouchableOpacity 
                style={styles.attachItem}
                onPress={() => handleSendAttachment('image')}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: '#bf59cf' }]}>
                  <Text style={styles.attachIcon}>📷</Text>
                </View>
                <Text style={styles.attachLabel}>Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.attachItem}
                onPress={() => handleSendAttachment('file')}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: '#5f66cd' }]}>
                  <Text style={styles.attachIcon}>📄</Text>
                </View>
                <Text style={styles.attachLabel}>Document</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.attachItem}
                onPress={() => handleSendAttachment('location')}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: '#00a884' }]}>
                  <Text style={styles.attachIcon}>📍</Text>
                </View>
                <Text style={styles.attachLabel}>Location</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.attachItem}
                onPress={() => handleSendAttachment('contact')}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: '#007bfc' }]}>
                  <Text style={styles.attachIcon}>👤</Text>
                </View>
                <Text style={styles.attachLabel}>Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.attachItem}
                onPress={() => handleSendAttachment('audio')}
                activeOpacity={0.7}
              >
                <View style={[styles.attachIconCircle, { backgroundColor: '#e58e26' }]}>
                  <Text style={styles.attachIcon}>🎵</Text>
                </View>
                <Text style={styles.attachLabel}>Audio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contact Profile / Security Details Modal */}
      <Modal
        visible={showContactDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowContactDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowContactDetails(false)}
          />
          <View style={styles.contactSheet}>
            <View style={styles.sheetHandle} />
            <Image source={{ uri: activeRoom.avatar }} style={styles.contactSheetAvatar} />
            <Text style={styles.contactSheetName}>{activeRoom.title}</Text>
            <Text style={styles.contactSheetPhone}>{activeRoom.phone || '+1 (415) 555-0142'}</Text>

            <View style={styles.contactBadgeRow}>
              <Text style={styles.contactBadgeText}>🔒 {activeRoom.securityBadge}</Text>
            </View>

            <View style={styles.contactInfoBox}>
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoLabel}>Trust Score:</Text>
                <Text style={[styles.contactInfoValue, { color: '#00a884' }]}>{activeRoom.trustScore || 96}% Verified</Text>
              </View>
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoLabel}>Double Ratchet:</Text>
                <Text style={styles.contactInfoValue}>Active (Ephemeral)</Text>
              </View>
              <View style={styles.contactInfoRow}>
                <Text style={styles.contactInfoLabel}>Identity Fingerprint:</Text>
                <Text style={[styles.contactInfoValue, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11 }]}>
                  4a8f:c921:bb70:00e2
                </Text>
              </View>
            </View>

            <View style={styles.contactActionsRow}>
              <TouchableOpacity 
                style={styles.contactActionBtn}
                onPress={() => {
                  setShowContactDetails(false);
                  handleStartCall(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>📞</Text>
                <Text style={styles.contactActionBtnText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactActionBtn}
                onPress={() => {
                  setShowContactDetails(false);
                  handleStartCall(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>📹</Text>
                <Text style={styles.contactActionBtnText}>Video</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.contactActionBtn}
                onPress={() => {
                  handleTogglePinChat(activeRoomId);
                  setShowContactDetails(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>📌</Text>
                <Text style={styles.contactActionBtnText}>
                  {pinnedRoomIds.includes(activeRoomId) ? 'Unpin' : 'Pin Chat'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Real-time Video/Audio Call Glassmorphic Stage */}
      <Modal
        visible={activeCall !== null}
        animationType="slide"
        onRequestClose={handleEndCall}
      >
        <SafeAreaView style={styles.callModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#0a1014" />
          
          {/* Call Header */}
          <View style={styles.callHeader}>
            <View style={styles.e2eePill}>
              <Text style={styles.e2eePillText}>🔒 256-Bit E2EE Active</Text>
            </View>
            <Text style={styles.callQualityText}>Gateway 18ms • 720p 30fps</Text>
          </View>

          {/* Call Avatar / Stage */}
          <View style={styles.callBody}>
            <View style={styles.callAvatarPulse}>
              <Image source={{ uri: activeRoom.avatar }} style={styles.callAvatarImage} />
            </View>
            
            <Text style={styles.callPeerName}>{activeRoom.title}</Text>
            <Text style={styles.callStateLabel}>
              {activeCall?.duration === 0 ? 'Connecting...' : formatTimer(activeCall?.duration || 0)}
            </Text>

            <View style={styles.callTrustBadge}>
              <Text style={styles.callTrustText}>
                🛡️ Trust Score: {activeRoom.trustScore || 95}% • Hardware Verified
              </Text>
            </View>

            {/* Audio Wave Visualizer Simulation */}
            <View style={styles.audioWaveformRow}>
              {[12, 24, 42, 18, 36, 48, 20, 32, 14].map((h, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.audioWaveBar, 
                    { height: activeCall?.isMuted ? 4 : h, backgroundColor: activeCall?.isMuted ? '#6b7280' : '#00a884' }
                  ]} 
                />
              ))}
            </View>
          </View>

          {/* Call Controls Dock */}
          <View style={styles.callControlsDock}>
            <TouchableOpacity 
              style={[styles.callControlBtn, activeCall?.isMuted && styles.callControlBtnActive]}
              onPress={() => setActiveCall(p => p ? { ...p, isMuted: !p.isMuted } : null)}
            >
              <Text style={styles.callControlIcon}>{activeCall?.isMuted ? '🔇' : '🎙️'}</Text>
              <Text style={styles.callControlText}>{activeCall?.isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.callControlBtn, !activeCall?.isCameraOn && styles.callControlBtnActive]}
              onPress={() => setActiveCall(p => p ? { ...p, isCameraOn: !p.isCameraOn } : null)}
            >
              <Text style={styles.callControlIcon}>{activeCall?.isCameraOn ? '📹' : '🚫'}</Text>
              <Text style={styles.callControlText}>{activeCall?.isCameraOn ? 'Video' : 'Camera Off'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.callControlBtn, activeCall?.isSpeakerOn && styles.callControlBtnActive]}
              onPress={() => setActiveCall(p => p ? { ...p, isSpeakerOn: !p.isSpeakerOn } : null)}
            >
              <Text style={styles.callControlIcon}>🔊</Text>
              <Text style={styles.callControlText}>Speaker</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.callEndBtn}
              onPress={handleEndCall}
            >
              <Text style={styles.callEndIcon}>📞</Text>
              <Text style={styles.callEndText}>End</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Mobile Wallpaper & Theme Customization Modal */}
      <Modal
        visible={showWallpaperModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWallpaperModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setShowWallpaperModal(false)} 
          />
          <View style={styles.wallpaperSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetHeaderTitle}>🎨 Chat Wallpaper & Theme</Text>
            <Text style={styles.sheetHeaderSubtitle}>Customize chat background color & aesthetic</Text>

            {/* Scope selection */}
            <View style={styles.wallpaperScopeRow}>
              <TouchableOpacity
                style={[styles.wallpaperScopeBtn, wallpaperScope === 'this' && styles.wallpaperScopeBtnActive]}
                onPress={() => setWallpaperScope('this')}
                activeOpacity={0.7}
              >
                <Text style={[styles.wallpaperScopeText, wallpaperScope === 'this' && styles.wallpaperScopeTextActive]}>
                  👤 This Chat Only
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.wallpaperScopeBtn, wallpaperScope === 'all' && styles.wallpaperScopeBtnActive]}
                onPress={() => setWallpaperScope('all')}
                activeOpacity={0.7}
              >
                <Text style={[styles.wallpaperScopeText, wallpaperScope === 'all' && styles.wallpaperScopeTextActive]}>
                  🌐 All Chats Globally
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Image URL for Personal Chat */}
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#8696a0', marginBottom: 6 }}>
                Set Any Personal Image URL as Background:
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: '#111b21',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    color: '#e9edef',
                    fontSize: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                  placeholder="Paste https://... image URL"
                  placeholderTextColor="#64748b"
                  value={mobileCustomUrl}
                  onChangeText={setMobileCustomUrl}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#00a884',
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onPress={() => {
                    if (mobileCustomUrl.trim()) {
                      handleApplyMobileWallpaper(mobileCustomUrl.trim());
                      setMobileCustomUrl('');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Presets Grid */}
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#8696a0', marginBottom: 8 }}>
              Curated Photography & Cyber Themes:
            </Text>
            <View style={styles.wallpaperGrid}>
              {[
                { id: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', name: 'Breeze Ocean', icon: '🌊', color: '#0369a1' },
                { id: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80', name: 'Tokyo Cyber', icon: '🏙️', color: '#581c87' },
                { id: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', name: 'Nordic Aurora', icon: '✨', color: '#064e3b' },
                { id: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80', name: 'Alpine Peaks', icon: '🏔️', color: '#1e293b' },
                { id: '#0b141a', name: 'Cyber Dark', icon: '🖤', color: '#0b141a' },
                { id: '#042f2e', name: 'Emerald Cyber', icon: '🌿', color: '#042f2e' },
                { id: '#160829', name: 'Neon Twilight', icon: '⚡', color: '#160829' },
                { id: '#090e21', name: 'Deep Space', icon: '🌌', color: '#090e21' },
                { id: '#24131e', name: 'Sunset Glow', icon: '🌅', color: '#24131e' },
                { id: '#082f49', name: 'Ocean Breeze', icon: '🌊', color: '#082f49' },
              ].map(wp => (
                <TouchableOpacity
                  key={wp.id}
                  style={[
                    styles.wallpaperItem,
                    { backgroundColor: wp.color },
                    currentMobileWallpaper === wp.id && styles.wallpaperItemActive
                  ]}
                  onPress={() => handleApplyMobileWallpaper(wp.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.wallpaperItemIcon}>{wp.icon}</Text>
                  <Text style={styles.wallpaperItemLabel}>{wp.name}</Text>
                  {currentMobileWallpaper === wp.id && (
                    <Text style={styles.wallpaperItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Reset & Close Buttons */}
            <View style={styles.wallpaperActionsRow}>
              <TouchableOpacity
                style={styles.wallpaperResetBtn}
                onPress={handleResetMobileWallpaper}
                activeOpacity={0.7}
              >
                <Text style={styles.wallpaperResetText}>Reset to Default</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.wallpaperCloseBtn}
                onPress={() => setShowWallpaperModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.wallpaperCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mobile Live Camera Viewfinder Modal */}
      <Modal
        visible={showCameraModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCameraModal(false);
          setCapturedPhoto(null);
        }}
      >
        <SafeAreaView style={styles.cameraModalContainer}>
          {/* Viewfinder Header */}
          <View style={styles.cameraHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.cameraLiveDot} />
              <Text style={styles.cameraTitle}>1080P E2EE CAMERA FEED</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TouchableOpacity
                style={styles.cameraHeaderBtn}
                onPress={() => setCameraFlash(f => f === 'auto' ? 'on' : f === 'on' ? 'off' : 'auto')}
                activeOpacity={0.7}
              >
                <Text style={styles.cameraHeaderBtnText}>⚡ {cameraFlash.toUpperCase()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraHeaderBtn}
                onPress={() => setCameraFacing(c => c === 'back' ? 'front' : 'back')}
                activeOpacity={0.7}
              >
                <Text style={styles.cameraHeaderBtnText}>🔄 {cameraFacing === 'back' ? 'REAR' : 'FRONT'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCameraModal(false);
                  setCapturedPhoto(null);
                }}
                style={styles.cameraCloseBtn}
              >
                <Text style={styles.cameraCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Viewfinder Lens Frame */}
          <View style={styles.cameraViewfinder}>
            {isSnapping && <View style={styles.cameraFlashOverlay} />}

            {capturedPhoto ? (
              <Image source={{ uri: capturedPhoto }} style={styles.cameraPreviewImage} />
            ) : (
              <>
                <Image
                  source={{ 
                    uri: cameraFacing === 'front'
                      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'
                  }}
                  style={styles.cameraPreviewImage}
                />
                {/* Viewfinder Reticle Box */}
                <View style={styles.cameraReticleBox}>
                  <View style={[styles.reticleCorner, styles.reticleTopLeft]} />
                  <View style={[styles.reticleCorner, styles.reticleTopRight]} />
                  <View style={[styles.reticleCorner, styles.reticleBottomLeft]} />
                  <View style={[styles.reticleCorner, styles.reticleBottomRight]} />
                </View>
                <View style={styles.cameraWatermarkPill}>
                  <Text style={styles.cameraWatermarkText}>🔒 SHA-256 Watermark Active</Text>
                </View>
              </>
            )}
          </View>

          {/* Camera Bottom Controls */}
          <View style={styles.cameraBottomBar}>
            {capturedPhoto ? (
              <View style={styles.capturedActionsRow}>
                <TouchableOpacity
                  style={styles.cameraRetakeBtn}
                  onPress={() => setCapturedPhoto(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cameraRetakeText}>🔄 Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cameraSendBtn}
                  onPress={handleSendMobilePhoto}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cameraSendText}>🚀 Send Encrypted Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.shutterRow}>
                <TouchableOpacity
                  style={styles.cameraCancelShutter}
                  onPress={() => setShowCameraModal(false)}
                >
                  <Text style={{ color: '#8696a0', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>

                {/* Big Shutter Button */}
                <TouchableOpacity
                  style={styles.shutterButton}
                  onPress={handleSnapMobilePhoto}
                  activeOpacity={0.8}
                >
                  <View style={styles.shutterInnerCircle} />
                </TouchableOpacity>

                <View style={{ width: 50 }} />
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* 5. Mobile Chats & Contacts List Screen Modal */}
      <Modal
        visible={showChatsList}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowChatsList(false)}
      >
        <SafeAreaView style={styles.chatsListSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#111b21" />

          {/* Top Brand Header */}
          <View style={styles.chatsListHeader}>
            <View style={styles.chatsListHeaderTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.chatsListBrandLogo}>
                  <Text style={{ fontSize: 18 }}>🛡️</Text>
                </View>
                <View>
                  <Text style={styles.chatsListBrandTitle}>HumanLink</Text>
                  <Text style={styles.chatsListBrandSubtitle}>
                    {isWsConnected ? '● Online • E2EE Gateway' : '○ Offline Mode'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.chatsListCloseBtn}
                onPress={() => setShowChatsList(false)}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ color: '#00a884', fontSize: 15, fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Instant Search Bar */}
            <View style={styles.chatsSearchBox}>
              <Text style={styles.chatsSearchIcon}>🔍</Text>
              <TextInput
                style={styles.chatsSearchInput}
                placeholder="Search contacts, chats, or phone..."
                placeholderTextColor="#8696a0"
                value={mobileSearchQuery}
                onChangeText={setMobileSearchQuery}
                autoCapitalize="none"
              />
              {mobileSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setMobileSearchQuery('')}>
                  <Text style={{ color: '#8696a0', fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chatsFilterRow}>
              {[
                { id: 'all', label: `All (${rooms.length})` },
                { id: 'pinned', label: `📌 Pinned (${pinnedRoomIds.length})` },
                { id: 'unread', label: 'Unread' },
                { id: 'groups', label: 'Groups' }
              ].map(chip => (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.chatsFilterChip,
                    chatsFilter === chip.id && styles.chatsFilterChipActive
                  ]}
                  onPress={() => setChatsFilter(chip.id as any)}
                >
                  <Text style={[
                    styles.chatsFilterChipText,
                    chatsFilter === chip.id && styles.chatsFilterChipTextActive
                  ]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Contact & Chat List Scroll */}
          <ScrollView style={styles.chatsScroll} contentContainerStyle={{ paddingBottom: 50 }}>
            {filteredMobileRooms.length === 0 ? (
              <View style={styles.chatsEmptyState}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={styles.chatsEmptyTitle}>No contacts match search</Text>
                <Text style={styles.chatsEmptySubtitle}>Try searching by another name or phone number</Text>
              </View>
            ) : (
              filteredMobileRooms.map(room => {
                const isPinned = pinnedRoomIds.includes(room.id);
                const roomMsgs = messagesMap[room.id] || [];
                const lastMsg = roomMsgs[roomMsgs.length - 1];
                const isCurrent = room.id === activeRoomId;

                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[
                      styles.chatCard,
                      isCurrent && styles.chatCardCurrent,
                      isPinned && styles.chatCardPinned
                    ]}
                    onPress={() => {
                      setActiveRoomId(room.id);
                      setReplyingTo(null);
                      setShowChatsList(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={styles.chatCardAvatarWrapper}>
                      <Image source={{ uri: room.avatar }} style={styles.chatCardAvatar} />
                      {room.isOnline && <View style={styles.chatCardOnlineDot} />}
                    </View>

                    <View style={styles.chatCardContent}>
                      <View style={styles.chatCardRow1}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                          <Text style={styles.chatCardTitle} numberOfLines={1}>
                            {room.title}
                          </Text>
                          {isPinned && <Text style={{ fontSize: 13 }}>📌</Text>}
                        </View>
                        <Text style={styles.chatCardTime}>
                          {lastMsg?.timestamp || 'Just now'}
                        </Text>
                      </View>

                      <View style={styles.chatCardRow2}>
                        <Text style={styles.chatCardSnippet} numberOfLines={1}>
                          {lastMsg ? `${lastMsg.isMe ? '✓✓ ' : ''}${lastMsg.text}` : 'No messages yet'}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          {/* Quick Pin Toggle Button */}
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation?.();
                              handleTogglePinChat(room.id);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={{ fontSize: 14, opacity: isPinned ? 1 : 0.4 }}>📌</Text>
                          </TouchableOpacity>

                          {room.id === 'room_scammer' && (
                            <View style={styles.riskBadgePill}>
                              <Text style={styles.riskBadgeText}>Risk 31%</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                        <Text style={styles.chatCardBadge}>{room.securityBadge}</Text>
                        {isCurrent && (
                          <View style={styles.activeChatIndicatorPill}>
                            <Text style={styles.activeChatIndicatorText}>Active Chat</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Quick Active Chat Footer Return */}
          <TouchableOpacity 
            style={styles.chatsListFooterBar}
            onPress={() => setShowChatsList(false)}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={{ uri: activeRoom.avatar }} style={{ width: 28, height: 28, borderRadius: 14 }} />
              <Text style={styles.chatsListFooterText} numberOfLines={1}>
                Return to <Text style={{ fontWeight: 'bold' }}>{activeRoom.title}</Text>
              </Text>
            </View>
            <Text style={{ color: '#00a884', fontSize: 16, fontWeight: 'bold' }}>→</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111b21',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0,
  },
  header: {
    height: 60,
    backgroundColor: '#202c33',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    color: '#e9edef',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#00a884',
  },
  dotOffline: {
    backgroundColor: '#8696a0',
  },
  headerSubtitle: {
    color: '#00a884',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  tabContainer: {
    backgroundColor: '#111b21',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeTabButton: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    borderWidth: 1,
    borderColor: '#00a884',
  },
  tabButtonText: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#00a884',
    fontWeight: 'bold',
  },
  securityWarningBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  securityWarningText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ephemeralBanner: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234, 179, 8, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  ephemeralBannerText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#0b141a',
  },
  messageList: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateDivider: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateDividerText: {
    color: '#8696a0',
    fontSize: 10,
    backgroundColor: '#182229',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
  },
  sentBubble: {
    backgroundColor: '#005c4b',
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: '#202c33',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },
  senderName: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quotedReplyBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderLeftWidth: 3,
    borderLeftColor: '#00a884',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  quotedReplySender: {
    color: '#00a884',
    fontSize: 11,
    fontWeight: 'bold',
  },
  quotedReplyText: {
    color: 'rgba(233, 237, 239, 0.85)',
    fontSize: 12,
  },
  attachmentImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  attachmentImage: {
    width: 220,
    height: 150,
    borderRadius: 8,
  },
  attachmentFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
  },
  attachmentFileIcon: {
    fontSize: 22,
  },
  attachmentFileName: {
    color: '#e9edef',
    fontSize: 13,
    fontWeight: 'bold',
  },
  attachmentFileDetail: {
    color: '#8696a0',
    fontSize: 11,
  },
  attachmentLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    gap: 8,
  },
  attachmentLocationIcon: {
    fontSize: 22,
  },
  attachmentLocationTitle: {
    color: '#e9edef',
    fontSize: 13,
    fontWeight: 'bold',
  },
  attachmentLocationCoord: {
    color: '#8696a0',
    fontSize: 11,
  },
  voiceNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  voicePlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00a884',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceWaveform: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  voiceWaveTrack: {
    width: '45%',
    height: 4,
    backgroundColor: '#00a884',
    borderRadius: 2,
  },
  voiceDuration: {
    color: '#8696a0',
    fontSize: 11,
  },
  messageText: {
    color: '#e9edef',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    color: 'rgba(241, 241, 242, 0.63)',
    fontSize: 10,
  },
  checkmarks: {
    color: 'rgba(241, 241, 242, 0.63)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  readCheckmarks: {
    color: '#53bdeb',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182229',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    color: '#8696a0',
    fontSize: 10,
    fontWeight: 'bold',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2c34',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.2)',
    gap: 8,
  },
  replyBannerIndicator: {
    width: 3,
    height: '100%',
    backgroundColor: '#00a884',
    borderRadius: 1.5,
  },
  replyBannerTitle: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: 'bold',
  },
  replyBannerText: {
    color: '#8696a0',
    fontSize: 12,
  },
  replyBannerClose: {
    padding: 6,
  },
  replyBannerCloseText: {
    color: '#8696a0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202c33',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.1)',
  },
  inputActionIcon: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2a3942',
    color: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 16,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  textInputFocused: {
    borderColor: '#00a884',
    backgroundColor: '#1f2c34',
  },
  liveTypingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182229',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 168, 132, 0.3)',
    gap: 6,
  },
  liveTypingLabel: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: 'bold',
  },
  liveTypingText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  liveTypingClear: {
    padding: 4,
  },
  liveTypingClearText: {
    color: '#8696a0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00a884',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#ffffff',
    fontSize: 16,
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: '#ef4444',
    fontWeight: 'bold',
    flex: 1,
    fontSize: 13,
  },
  cancelRecordingBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cancelRecordingText: {
    color: '#8696a0',
    fontSize: 13,
  },
  sendVoiceBtn: {
    backgroundColor: '#00a884',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  emojiDrawer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#202c33',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.15)',
    justifyContent: 'space-around',
  },
  emojiDrawerItem: {
    padding: 6,
  },
  emojiLarge: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8696a0',
    alignSelf: 'center',
    marginBottom: 14,
    opacity: 0.6,
  },
  headerIconButtonActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.25)',
    borderWidth: 1,
    borderColor: '#00a884',
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#182229',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 168, 132, 0.35)',
    gap: 10,
  },
  pinnedBannerIcon: {
    fontSize: 16,
  },
  pinnedBannerLabel: {
    color: '#00a884',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pinnedBannerText: {
    color: '#e9edef',
    fontSize: 13,
  },
  pinnedBannerClose: {
    padding: 4,
  },
  pinnedBannerCloseText: {
    color: '#8696a0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 12 : 24,
    alignSelf: 'center',
    backgroundColor: '#00a884',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  recordingWaveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginHorizontal: 8,
    height: 28,
  },
  recordingWaveBar: {
    width: 3,
    backgroundColor: '#ef4444',
    borderRadius: 1.5,
  },
  contactSheet: {
    backgroundColor: '#202c33',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  contactSheetAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#00a884',
  },
  contactSheetName: {
    color: '#e9edef',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactSheetPhone: {
    color: '#8696a0',
    fontSize: 13,
    marginBottom: 12,
  },
  contactBadgeRow: {
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 16,
  },
  contactBadgeText: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: '600',
  },
  contactInfoBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  contactInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfoLabel: {
    color: '#8696a0',
    fontSize: 12,
  },
  contactInfoValue: {
    color: '#e9edef',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  contactActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  contactActionBtnText: {
    color: '#e9edef',
    fontSize: 13,
    fontWeight: '600',
  },
  actionSheet: {
    backgroundColor: '#202c33',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 14,
  },
  actionSheetTitle: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionSheetEmojis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  actionEmojiBtn: {
    padding: 6,
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: 'rgba(134, 150, 160, 0.15)',
  },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  actionSheetIcon: {
    fontSize: 20,
  },
  actionSheetLabel: {
    color: '#e9edef',
    fontSize: 15,
    fontWeight: '600',
  },
  attachSheet: {
    backgroundColor: '#202c33',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 22,
  },
  attachSheetTitle: {
    color: '#e9edef',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  attachGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  attachItem: {
    alignItems: 'center',
    gap: 6,
  },
  attachIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    fontSize: 22,
  },
  attachLabel: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: '600',
  },
  callModalContainer: {
    flex: 1,
    backgroundColor: '#080d11',
    justifyContent: 'space-between',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  callHeader: {
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  e2eePill: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 132, 0.4)',
  },
  e2eePillText: {
    color: '#00a884',
    fontSize: 12,
    fontWeight: 'bold',
  },
  callQualityText: {
    color: '#8696a0',
    fontSize: 12,
  },
  callBody: {
    alignItems: 'center',
    gap: 14,
  },
  callAvatarPulse: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#00a884',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#182229',
    elevation: 10,
    shadowColor: '#00a884',
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  callAvatarImage: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  callPeerName: {
    color: '#e9edef',
    fontSize: 24,
    fontWeight: 'bold',
  },
  callStateLabel: {
    color: '#00a884',
    fontSize: 16,
    fontWeight: '600',
  },
  callTrustBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  callTrustText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  audioWaveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    gap: 5,
    marginTop: 10,
  },
  audioWaveBar: {
    width: 5,
    borderRadius: 2.5,
  },
  callControlsDock: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1f2c34',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  callControlBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  callControlBtnActive: {
    opacity: 0.6,
  },
  callControlIcon: {
    fontSize: 22,
  },
  callControlText: {
    color: '#8696a0',
    fontSize: 11,
    fontWeight: '600',
  },
  callEndBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  callEndIcon: {
    fontSize: 16,
    transform: [{ rotate: '135deg' }],
  },
  callEndText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Mention Badges & Suggestions Tray
  mentionBadgeAll: {
    backgroundColor: 'rgba(56, 239, 125, 0.22)',
    color: '#38ef7d',
    fontWeight: 'bold',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  mentionBadgeWhisper: {
    backgroundColor: 'rgba(165, 94, 234, 0.22)',
    color: '#c084fc',
    fontWeight: 'bold',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  mentionBadgeUser: {
    backgroundColor: 'rgba(83, 189, 235, 0.22)',
    color: '#53bdeb',
    fontWeight: 'bold',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  mentionSuggestionsTray: {
    backgroundColor: '#1f2c34',
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.15)',
    paddingVertical: 8,
  },
  mentionSuggestionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-start',
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mentionSuggestionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  mentionSuggestionDesc: {
    fontSize: 10,
    color: '#8696a0',
  },

  // Wallpaper Customization Sheet
  wallpaperSheet: {
    backgroundColor: '#1f2c34',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHeaderTitle: {
    color: '#e9edef',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sheetHeaderSubtitle: {
    color: '#8696a0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  wallpaperScopeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  wallpaperScopeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  wallpaperScopeBtnActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    borderColor: '#00a884',
  },
  wallpaperScopeText: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: '600',
  },
  wallpaperScopeTextActive: {
    color: '#00a884',
    fontWeight: 'bold',
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  wallpaperItem: {
    width: '48%',
    height: 70,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  wallpaperItemActive: {
    borderColor: '#00a884',
    borderWidth: 2,
  },
  wallpaperItemIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  wallpaperItemLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wallpaperItemCheck: {
    position: 'absolute',
    top: 8,
    right: 10,
    color: '#00a884',
    fontWeight: 'bold',
    fontSize: 16,
  },
  wallpaperActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  wallpaperResetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  wallpaperResetText: {
    color: '#8696a0',
    fontSize: 13,
  },
  wallpaperCloseBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  wallpaperCloseText: {
    color: '#e9edef',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Mobile Camera Viewfinder Simulator
  cameraModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraHeader: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  cameraLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38ef7d',
  },
  cameraTitle: {
    color: '#38ef7d',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cameraHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cameraHeaderBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cameraCloseBtn: {
    padding: 6,
  },
  cameraCloseBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraViewfinder: {
    flex: 1,
    backgroundColor: '#080d11',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraFlashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 20,
  },
  cameraPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cameraReticleBox: {
    position: 'absolute',
    width: 160,
    height: 160,
  },
  reticleCorner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38ef7d',
  },
  reticleTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  reticleTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  reticleBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  reticleBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  cameraWatermarkPill: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cameraWatermarkText: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: '600',
  },
  cameraBottomBar: {
    height: 100,
    backgroundColor: '#090d10',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  capturedActionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cameraRetakeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cameraRetakeText: {
    color: '#e9edef',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cameraSendBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#00a884',
    alignItems: 'center',
  },
  cameraSendText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraCancelShutter: {
    width: 50,
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff',
  },
  // Back button in Chat Header
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButtonText: {
    color: '#00a884',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  // Mobile Chats List Screen Styles
  chatsListSafeArea: {
    flex: 1,
    backgroundColor: '#111b21',
  },
  chatsListHeader: {
    backgroundColor: '#202c33',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(134, 150, 160, 0.15)',
  },
  chatsListHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chatsListBrandLogo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatsListBrandTitle: {
    color: '#e9edef',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  chatsListBrandSubtitle: {
    color: '#00a884',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  chatsListCloseBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 168, 132, 0.15)',
  },
  chatsSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111b21',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  chatsSearchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  chatsSearchInput: {
    flex: 1,
    color: '#e9edef',
    fontSize: 14,
    paddingVertical: 0,
  },
  chatsFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chatsFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#111b21',
    borderWidth: 1,
    borderColor: 'rgba(134, 150, 160, 0.2)',
  },
  chatsFilterChipActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    borderColor: '#00a884',
  },
  chatsFilterChipText: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: '600',
  },
  chatsFilterChipTextActive: {
    color: '#00a884',
    fontWeight: 'bold',
  },
  chatsScroll: {
    flex: 1,
    backgroundColor: '#111b21',
  },
  chatsEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  chatsEmptyTitle: {
    color: '#e9edef',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chatsEmptySubtitle: {
    color: '#8696a0',
    fontSize: 13,
    textAlign: 'center',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(134, 150, 160, 0.12)',
    backgroundColor: '#111b21',
  },
  chatCardCurrent: {
    backgroundColor: 'rgba(0, 168, 132, 0.08)',
  },
  chatCardPinned: {
    borderLeftWidth: 3,
    borderLeftColor: '#00a884',
  },
  chatCardAvatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  chatCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#202c33',
  },
  chatCardOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00a884',
    borderWidth: 2,
    borderColor: '#111b21',
  },
  chatCardContent: {
    flex: 1,
  },
  chatCardRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  chatCardTitle: {
    color: '#e9edef',
    fontSize: 15,
    fontWeight: 'bold',
  },
  chatCardTime: {
    color: '#8696a0',
    fontSize: 11,
  },
  chatCardRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  chatCardSnippet: {
    color: '#8696a0',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  chatCardBadge: {
    color: '#00a884',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.85,
  },
  riskBadgePill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  riskBadgeText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeChatIndicatorPill: {
    backgroundColor: 'rgba(0, 168, 132, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeChatIndicatorText: {
    color: '#00a884',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatsListFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#202c33',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.15)',
  },
  chatsListFooterText: {
    color: '#e9edef',
    fontSize: 13,
  },

  // Swipeable message row & reply indicator
  swipeableMessageContainer: {
    position: 'relative',
    marginVertical: 3,
    justifyContent: 'center',
  },
  swipeReplyIndicator: {
    position: 'absolute',
    left: 8,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeReplyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00a884',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00a884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  swipeReplyIconText: {
    fontSize: 18,
    color: '#ffffff',
  },

  // Interactive Edge Back Indicator & Contact Peek Card (Swipe to go back)
  edgeBackIndicatorContainer: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 9999,
  },
  edgeBackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 44, 52, 0.96)',
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#00a884',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 10,
    gap: 12,
  },
  edgeBackArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00a884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  edgeBackArrowText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  edgeBackCardContent: {
    justifyContent: 'center',
  },
  edgeBackTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  edgeBackSubtitle: {
    color: '#00a884',
    fontSize: 11,
    fontWeight: '600',
  },
  edgeBackBadge: {
    backgroundColor: '#00a884',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  edgeBackBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Modern WhatsApp Full-Width Capsule Typebar / Composer
  composerWrapper: {
    backgroundColor: '#202c33',
    borderTopWidth: 1,
    borderTopColor: 'rgba(134, 150, 160, 0.1)',
  },
  modernInputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#202c33',
    gap: 6,
  },
  composerLeftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  composerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  composerIconBtnActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.25)',
  },
  composerIconText: {
    fontSize: 18,
    color: '#8696a0',
  },
  composerCapsule: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3942',
    borderRadius: 24,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  composerCapsuleFocused: {
    borderColor: '#00a884',
    backgroundColor: '#1f2c34',
  },
  composerTextInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    minHeight: 38,
    maxHeight: 100,
  },
  capsuleInnerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 2,
  },
  capsuleIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capsuleIconBtnPinned: {
    backgroundColor: 'rgba(0, 168, 132, 0.25)',
  },
  capsuleIconText: {
    fontSize: 16,
    color: '#8696a0',
  },
  composerSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00a884',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
    shadowColor: '#00a884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  composerSendIcon: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 2,
  },
  composerMicBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00a884',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
    shadowColor: '#00a884',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  composerMicIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
});
