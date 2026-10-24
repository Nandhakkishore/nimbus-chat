import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Phone, Video, ShieldCheck, QrCode, Clock, Send, Mic, Paperclip, 
  Smile, AlertTriangle, Wifi, CheckCheck, Bot, UserX, ShieldAlert, 
  ImageIcon, FileText, Camera, User, BarChart2, MoreVertical, Search, ChevronDown,
  Play, Pause, Volume2, Trash2, X, Sparkles, Zap, Flame, Radio, MapPin, Navigation,
  Star, Bookmark, Plus, RotateCcw, Image as ImageLucide, Reply, CornerUpLeft,
  Palette, AtSign, Lock, Music, Check, Maximize2, Sliders, RefreshCw, Upload,
  Pin, ArrowLeft
} from 'lucide-react';
import { Message } from '../../types';

export const ChatView: React.FC<{ onToggleContactInfo: () => void; onBackToInbox?: () => void }> = ({ onToggleContactInfo, onBackToInbox }) => {
  const { 
    rooms, activeRoomId, messagesMap, currentUser, sendMessage, deleteMessage, addReaction, 
    initiateCall, openModal, blockContact, scamRadarActive, aiRoastModeActive, toggleAiRoastMode,
    roomWallpapers, globalWallpaper, setRoomWallpaper, setGlobalWallpaper,
    togglePinRoom, togglePinMessage
  } = useApp();

  const [inputText, setInputText] = useState('');
  
  // Replying To Particular Message State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Swipe-to-Reply Gesture State
  const [swipingMessageId, setSwipingMessageId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const swipeStartXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Floating Quick Reactions Menu State
  const [activeReactionMenuMsgId, setActiveReactionMenuMsgId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Voice Note State (Recording, Pause, Resume, Preview, FX)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceEffect, setVoiceEffect] = useState<'normal' | 'chipmunk' | 'deep' | 'alien'>('normal');
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  // Popover & UI States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'emojis' | 'stickers' | 'saved'>('emojis');
  
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Sticker Creation & Favorites State
  const [savedFavorites, setSavedFavorites] = useState<string[]>(['🔥', '🎉', '🐱 Cyber Cat', '🚀 Rocket Launch']);
  const [customStickers, setCustomStickers] = useState<{ id: string; name: string; url: string }[]>([
    { id: 'stk_1', name: '🐱 Cyber Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80' },
    { id: 'stk_2', name: '🚀 Rocket Launch', url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=200&auto=format&fit=crop&q=80' },
    { id: 'stk_3', name: '🥑 Avocado Toast', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&auto=format&fit=crop&q=80' },
    { id: 'stk_4', name: '🔐 Security Shield', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80' },
    { id: 'stk_5', name: '☕ Coffee Fuel', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' }
  ]);

  // Particle Burst & Toast
  const [activeParticles, setActiveParticles] = useState<{ id: number; emoji: string; left: number; top: number }[]>([]);
  const [showPoofToast, setShowPoofToast] = useState(false);
  const [customToast, setCustomToast] = useState<string | null>(null);

  // Wallpaper / Theme Customization State
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [wallpaperScope, setWallpaperScope] = useState<'this' | 'all'>('this');
  const [customWallpaperInput, setCustomWallpaperInput] = useState('');
  const [wallpaperDimming, setWallpaperDimming] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nimbus_wallpaper_dimming');
      return saved ? parseFloat(saved) : 0.65;
    } catch {
      return 0.65;
    }
  });
  const [wallpaperBlur, setWallpaperBlur] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nimbus_wallpaper_blur');
      return saved ? parseInt(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Mentions Auto-Suggest State
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string>('');

  // Live Camera Viewfinder Modal State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [cameraFlash, setCameraFlash] = useState<'auto' | 'on' | 'off'>('auto');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [isCapturingAnimation, setIsCapturingAnimation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const customWallpaperFileInputRef = useRef<HTMLInputElement>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];
  const activeMessages = messagesMap[activeRoomId] || [];
  const peerUser = activeRoom.members.find(m => m.id !== currentUser.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isPeerTyping]);

  // Voice recording timer with pause support
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice && !isVoicePaused) {
      interval = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice, isVoicePaused]);

  const triggerEmojiBurst = (text: string) => {
    const burstEmojis = ['🎉', '🚀', '🤡', '🔥', '🥑', '💩', '⚡', '🥳', '💯', '✨'];
    const matched = burstEmojis.find(e => text.includes(e));

    if (matched) {
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        emoji: matched,
        left: Math.random() * 80 + 10,
        top: Math.random() * 60 + 20
      }));
      setActiveParticles(newParticles);
      setTimeout(() => setActiveParticles([]), 2200);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    triggerEmojiBurst(inputText);

    const replyPayload = replyingTo ? {
      id: replyingTo.id,
      senderName: replyingTo.senderName,
      text: replyingTo.text
    } : undefined;

    sendMessage(activeRoomId, inputText, undefined, replyPayload);
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    if (aiRoastModeActive && peerUser?.isOnline) {
      setTimeout(() => setIsPeerTyping(true), 600);
      setTimeout(() => setIsPeerTyping(false), 2400);
    }
  };

  const startReply = (msg: Message) => {
    setReplyingTo(msg);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-message');
      setTimeout(() => el.classList.remove('highlight-message'), 1600);
    }
  };

  // Screen edge swipe-to-back state for mobile & tablet viewports
  const [edgeSwipeX, setEdgeSwipeX] = useState<number>(0);
  const [isSwipingBackScreen, setIsSwipingBackScreen] = useState<boolean>(false);
  const edgeStartXRef = useRef<number>(0);

  const handleScreenTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0].clientX <= 65) {
      edgeStartXRef.current = e.touches[0].clientX;
      setIsSwipingBackScreen(true);
      setEdgeSwipeX(0);
    }
  };

  const handleScreenTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingBackScreen) return;
    const deltaX = e.touches[0].clientX - edgeStartXRef.current;
    if (deltaX > 0) {
      setEdgeSwipeX(Math.min(180, deltaX));
    }
  };

  const handleScreenTouchEnd = () => {
    if (isSwipingBackScreen) {
      if (edgeSwipeX >= 65 && onBackToInbox) {
        onBackToInbox();
      }
      setIsSwipingBackScreen(false);
      setEdgeSwipeX(0);
    }
  };

  // Touch and Mouse Swipe Gestures for Swipe-to-Reply
  const handleTouchStart = (e: React.TouchEvent, msgId: string) => {
    swipeStartXRef.current = e.touches[0].clientX;
    setSwipingMessageId(msgId);
    setSwipeOffset(0);
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent, msg: Message) => {
    if (!isDraggingRef.current || swipingMessageId !== msg.id) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - swipeStartXRef.current;
    if (deltaX > 0) {
      setSwipeOffset(Math.min(75, deltaX));
    }
  };

  const handleTouchEnd = (msg: Message) => {
    if (swipeOffset >= 35) {
      startReply(msg);
    }
    isDraggingRef.current = false;
    setSwipeOffset(0);
    setSwipingMessageId(null);
  };

  const handleMouseDown = (e: React.MouseEvent, msgId: string) => {
    swipeStartXRef.current = e.clientX;
    setSwipingMessageId(msgId);
    setSwipeOffset(0);
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent, msg: Message) => {
    if (!isDraggingRef.current || swipingMessageId !== msg.id) return;
    const deltaX = e.clientX - swipeStartXRef.current;
    if (deltaX > 0) {
      setSwipeOffset(Math.min(75, deltaX));
    }
  };

  const handleMouseUp = (msg: Message) => {
    if (isDraggingRef.current) {
      if (swipeOffset >= 35) {
        startReply(msg);
      }
      isDraggingRef.current = false;
      setSwipeOffset(0);
      setSwipingMessageId(null);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
    triggerEmojiBurst(emoji);
    setShowEmojiPicker(false); // Disappear popover immediately after selection!
  };

  const handleStickerSend = (stk: { name: string; url: string }) => {
    sendMessage(activeRoomId, `🎨 Sticker: ${stk.name}`, 'image');
    setShowEmojiPicker(false); // Disappear popover immediately!
  };

  const handleSaveFavorite = (item: string) => {
    if (!savedFavorites.includes(item)) {
      setSavedFavorites(prev => [...prev, item]);
    }
  };

  const handleStickerCreate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newStk = {
            id: `stk_custom_${Date.now()}`,
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: ev.target.result as string
          };
          setCustomStickers(prev => [newStk, ...prev]);
          handleStickerSend(newStk);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          sendMessage(activeRoomId, '📷 Photo captured & shared', 'image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Real Audio Recording & Playback Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const activeAudioElemRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthOscRef = useRef<any>(null);

  const handleStartVoiceRecording = async () => {
    setIsRecordingVoice(true);
    setIsVoicePaused(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            audioChunksRef.current.push(ev.data);
          }
        };
        recorder.start(250);
      }
    } catch (err) {
      console.warn('Microphone permission or hardware note:', err);
    }
  };

  const handleSendVoiceNote = () => {
    const duration = recordingSeconds || 3;
    const effectLabel = voiceEffect !== 'normal' ? ` [Effect: ${voiceEffect.toUpperCase()}]` : '';

    const finalizeAndSend = (audioDataUrl?: string) => {
      sendMessage(
        activeRoomId,
        `🎤 Voice Note (${duration}s)${effectLabel}`,
        'audio',
        undefined,
        { audioUrl: audioDataUrl, voiceNoteDuration: duration }
      );
      setIsRecordingVoice(false);
      setIsVoicePaused(false);
      setRecordingSeconds(0);
      setVoiceEffect('normal');
      triggerToast('🎤 Voice note encrypted & sent!');
    };

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            finalizeAndSend(dataUrl);
          };
          reader.readAsDataURL(blob);
        } catch {
          finalizeAndSend();
        }
        mediaStreamRef.current?.getTracks().forEach(t => t.stop());
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
      };
      mediaRecorderRef.current.stop();
    } else {
      finalizeAndSend();
    }
  };

  const playWebAudioVoiceSimulation = (msg: Message) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        setTimeout(() => setPlayingAudioId(null), 3000);
        return;
      }
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      audioContextRef.current = ctx;

      const duration = msg.voiceNoteDuration || 4;
      const now = ctx.currentTime;

      // Realistic speech audio synthesis with formant filters
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(340, now + 0.3);
      osc.frequency.linearRampToValueAtTime(260, now + 0.8);
      osc.frequency.linearRampToValueAtTime(360, now + 1.4);
      osc.frequency.linearRampToValueAtTime(220, now + duration - 0.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gain.gain.setValueAtTime(0.25, now + duration - 0.3);
      gain.gain.linearRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
      synthOscRef.current = osc;

      osc.onended = () => {
        setPlayingAudioId(null);
        synthOscRef.current = null;
      };
    } catch {
      setTimeout(() => setPlayingAudioId(null), 3000);
    }
  };

  const handleTogglePlayAudio = (msg: Message) => {
    if (playingAudioId === msg.id) {
      if (activeAudioElemRef.current) {
        activeAudioElemRef.current.pause();
        activeAudioElemRef.current = null;
      }
      if (synthOscRef.current) {
        try { synthOscRef.current.stop(); } catch(e) {}
        synthOscRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElemRef.current) {
      activeAudioElemRef.current.pause();
      activeAudioElemRef.current = null;
    }
    if (synthOscRef.current) {
      try { synthOscRef.current.stop(); } catch(e) {}
      synthOscRef.current = null;
    }

    setPlayingAudioId(msg.id);

    if (msg.audioUrl && (msg.audioUrl.startsWith('data:') || msg.audioUrl.startsWith('http') || msg.audioUrl.startsWith('blob:'))) {
      try {
        const audio = new Audio(msg.audioUrl);
        activeAudioElemRef.current = audio;
        audio.onended = () => {
          setPlayingAudioId(null);
          activeAudioElemRef.current = null;
        };
        audio.onerror = () => {
          playWebAudioVoiceSimulation(msg);
        };
        audio.play().catch(() => {
          playWebAudioVoiceSimulation(msg);
        });
        return;
      } catch {
        playWebAudioVoiceSimulation(msg);
      }
    } else {
      playWebAudioVoiceSimulation(msg);
    }
  };

  const handleDeleteMsg = (msgId: string) => {
    deleteMessage(activeRoomId, msgId);
    setShowPoofToast(true);
    setTimeout(() => setShowPoofToast(false), 2200);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          sendMessage(
            activeRoomId,
            `📍 Live Location: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° W`,
            'location'
          );
        },
        () => {
          sendMessage(
            activeRoomId,
            `📍 Live Location: Market St & 4th St, San Francisco, CA (37.7749° N, 122.4194° W)`,
            'location'
          );
        }
      );
    } else {
      sendMessage(
        activeRoomId,
        `📍 Live Location: Market St & 4th St, San Francisco, CA (37.7749° N, 122.4194° W)`,
        'location'
      );
    }
    setShowAttachMenu(false); // Disappear popover!
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const triggerToast = (msg: string) => {
    setCustomToast(msg);
    setTimeout(() => setCustomToast(null), 2400);
  };

  const currentWallpaper = roomWallpapers[activeRoomId] || globalWallpaper || 'default';

  const getWallpaperBackground = (wp: string): React.CSSProperties => {
    if (!wp || wp === 'default') {
      return {
        backgroundColor: '#0b141a',
        backgroundImage: `radial-gradient(rgba(0, 168, 132, 0.05) 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      };
    }
    if (wp === 'emerald') {
      return {
        background: 'linear-gradient(145deg, #05231c 0%, #02120e 100%)',
        backgroundImage: 'radial-gradient(rgba(0, 168, 132, 0.15) 1px, transparent 1px), linear-gradient(145deg, #05231c 0%, #02120e 100%)',
        backgroundSize: '28px 28px, 100% 100%'
      };
    }
    if (wp === 'cyberpunk') {
      return {
        background: 'linear-gradient(145deg, #160829 0%, #081226 100%)',
        backgroundImage: 'radial-gradient(rgba(165, 94, 234, 0.15) 1px, transparent 1px), linear-gradient(145deg, #160829 0%, #081226 100%)',
        backgroundSize: '30px 30px, 100% 100%'
      };
    }
    if (wp === 'space') {
      return {
        background: 'linear-gradient(145deg, #090e21 0%, #1b0c2a 100%)',
        backgroundImage: 'radial-gradient(rgba(83, 189, 235, 0.15) 1px, transparent 1px), linear-gradient(145deg, #090e21 0%, #1b0c2a 100%)',
        backgroundSize: '26px 26px, 100% 100%'
      };
    }
    if (wp === 'sunset') {
      return {
        background: 'linear-gradient(145deg, #24131e 0%, #1a162b 100%)',
      };
    }
    if (wp === 'minimal') {
      return {
        backgroundColor: '#0f171d',
      };
    }
    if (wp === 'hex') {
      return {
        backgroundColor: '#081216',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 168, 132, 0.12) 2px, transparent 3px)`,
        backgroundSize: '32px 32px'
      };
    }
    if (wp.startsWith('http') || wp.startsWith('data:')) {
      return {
        backgroundImage: `linear-gradient(rgba(11, 20, 26, ${wallpaperDimming}), rgba(11, 20, 26, ${wallpaperDimming})), url("${wp}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: wallpaperBlur > 0 ? `blur(${wallpaperBlur}px)` : 'none',
        transform: wallpaperBlur > 0 ? 'scale(1.04)' : 'none',
        transition: 'filter 0.2s ease, opacity 0.2s ease'
      };
    }
    if (wp.startsWith('linear-gradient') || wp.startsWith('#')) {
      return { background: wp };
    }
    return { backgroundColor: '#0b141a' };
  };

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        handleApplyWallpaper(dataUrl);
        triggerToast(`🎨 Personal image set as wallpaper for ${activeRoom.title}!`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyWallpaper = (wpKey: string) => {
    if (wallpaperScope === 'this') {
      setRoomWallpaper(activeRoomId, wpKey);
      triggerToast(`🎨 Wallpaper updated for ${activeRoom.title}!`);
    } else {
      setGlobalWallpaper(wpKey);
      triggerToast(`🎨 Wallpaper applied to All Chats!`);
    }
    setShowWallpaperModal(false);
  };

  const handleResetWallpaper = () => {
    if (wallpaperScope === 'this') {
      setRoomWallpaper(activeRoomId, 'default');
      triggerToast(`Reset wallpaper for ${activeRoom.title}`);
    } else {
      setGlobalWallpaper('');
      triggerToast(`Reset global wallpaper to default`);
    }
    setShowWallpaperModal(false);
  };

  // Mention Suggestions Data
  const availableMentions = [
    {
      id: 'all',
      tag: '@everyone',
      display: '📢 @everyone',
      sub: 'Notify everyone in this room',
      type: 'all'
    },
    {
      id: 'group_all',
      tag: '@all',
      display: '👥 @all',
      sub: 'Broadcast tag to entire group',
      type: 'all'
    },
    ...(peerUser ? [
      {
        id: `pub_${peerUser.id}`,
        tag: `@${peerUser.displayName}`,
        display: `👤 @${peerUser.displayName}`,
        sub: 'Public mention in chat',
        type: 'user'
      },
      {
        id: `priv_${peerUser.id}`,
        tag: `@private:${peerUser.displayName}`,
        display: `🔒 Whisper to ${peerUser.displayName}`,
        sub: 'Private whisper mention (highlighted only for them)',
        type: 'private'
      }
    ] : []),
    {
      id: 'u_marcus',
      tag: '@Marcus Vance',
      display: '👤 @Marcus Vance',
      sub: 'Hardware Engineer • Core Peer',
      type: 'user'
    },
    {
      id: 'u_aris',
      tag: '@Dr. Aris Thorne',
      display: '👤 @Dr. Aris Thorne',
      sub: 'Quantum Crypto Lead',
      type: 'user'
    },
    {
      id: 'u_elena',
      tag: '@Elena Rostova',
      display: '👤 @Elena Rostova',
      sub: 'Security Architect',
      type: 'user'
    }
  ];

  const filteredMentions = availableMentions.filter(m => {
    if (!mentionQuery) return true;
    const q = mentionQuery.toLowerCase();
    return m.tag.toLowerCase().includes(q) || m.display.toLowerCase().includes(q) || m.sub.toLowerCase().includes(q);
  });

  const handleSelectMention = (tag: string) => {
    const input = inputRef.current;
    if (!input) {
      setInputText(prev => prev + tag + ' ');
      setShowMentionMenu(false);
      return;
    }
    const val = inputText;
    const cursor = input.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    if (lastAt !== -1) {
      const newVal = val.slice(0, lastAt) + tag + ' ' + val.slice(cursor);
      setInputText(newVal);
    } else {
      setInputText(val + (val.endsWith(' ') ? '' : ' ') + tag + ' ');
    }
    setShowMentionMenu(false);
    setTimeout(() => {
      input.focus();
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);
    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBeforeCursor[lastAt - 1]))) {
      const q = textBeforeCursor.slice(lastAt + 1);
      setMentionQuery(q);
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
      setMentionQuery('');
    }
  };

  const renderMessageTextWithMentions = (text: string) => {
    const parts = text.split(/(@everyone|@all|@private:[^\s]+|@[\w\s.]+(?=\b|[.,!?]|$))/g);
    return parts.map((part, pIdx) => {
      if (part === '@everyone' || part === '@all') {
        return (
          <span 
            key={pIdx} 
            style={{ 
              background: 'rgba(0, 168, 132, 0.25)', 
              color: '#38ef7d', 
              padding: '1px 6px', 
              borderRadius: '4px', 
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              margin: '0 2px'
            }}
          >
            📢 {part}
          </span>
        );
      }
      if (part.startsWith('@private:')) {
        const name = part.replace('@private:', '');
        return (
          <span 
            key={pIdx} 
            style={{ 
              background: 'rgba(165, 94, 234, 0.25)', 
              color: '#c084fc', 
              padding: '1px 6px', 
              borderRadius: '4px', 
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              border: '1px solid rgba(165, 94, 234, 0.35)',
              margin: '0 2px'
            }}
          >
            🔒 Whisper to {name}
          </span>
        );
      }
      if (part.startsWith('@') && part.length > 1) {
        return (
          <span 
            key={pIdx} 
            style={{ 
              background: 'rgba(83, 189, 235, 0.25)', 
              color: '#53bdeb', 
              padding: '1px 6px', 
              borderRadius: '4px', 
              fontWeight: 700,
              margin: '0 2px'
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Camera Capture Simulation Action
  const handleSnapPhoto = () => {
    setIsCapturingAnimation(true);
    setTimeout(() => {
      setIsCapturingAnimation(false);
      const photoUrl = cameraFacing === 'front' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80';
      setCapturedPhoto(photoUrl);
    }, 350);
  };

  const handleSendCapturedPhoto = () => {
    if (!capturedPhoto) return;
    const textToSend = photoCaption.trim() 
      ? `📷 ${photoCaption.trim()}` 
      : '📷 Encrypted Hardware Snapshot (SHA-256 Verified)';
    sendMessage(activeRoomId, textToSend, 'image');
    setCapturedPhoto(null);
    setPhotoCaption('');
    setShowCameraModal(false);
    triggerToast('📷 Encrypted photo transmitted to chat');
  };

  const emojiList = ['😀', '😂', '😍', '🔥', '👍', '❤️', '🙏', '🎉', '😎', '🙌', '✨', '💯', '⚡', '🚀', '🤡', '🥑', '💩', '🥳', '🤔', '👏', '⭐', '🌟', '💡', '🎯', '🏆', '📌'];

  return (
    <div className="chat-wallpaper" 
      onTouchStart={handleScreenTouchStart}
      onTouchMove={handleScreenTouchMove}
      onTouchEnd={handleScreenTouchEnd}
      style={{
        backgroundColor: '#0b141a',
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Edge Swipe-to-Back Indicator & Contact Peek Card */}
      {isSwipingBackScreen && (
        <div style={{
          position: 'fixed',
          left: `${Math.min(edgeSwipeX - 40, 24)}px`,
          top: '90px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(31, 44, 52, 0.96)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid var(--accent-whatsapp)',
          borderRadius: '30px',
          padding: '8px 16px',
          boxShadow: '0 8px 32px rgba(0, 168, 132, 0.4)',
          pointerEvents: 'none',
          transition: 'transform 0.05s ease',
          transform: `scale(${edgeSwipeX >= 65 ? 1.08 : 0.95})`
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--accent-whatsapp)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            <ArrowLeft size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>All Chats</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-whatsapp)', fontWeight: 600 }}>
              {edgeSwipeX >= 65 ? 'Release to return' : 'Slide to return'}
            </span>
          </div>
        </div>
      )}

      {/* Dedicated Wallpaper Backdrop Layer (ensures blur & dimming don't affect chat text) */}
      <div 
        style={{
          position: 'absolute',
          top: -8,
          left: -8,
          right: -8,
          bottom: -8,
          zIndex: 0,
          pointerEvents: 'none',
          ...getWallpaperBackground(currentWallpaper)
        }} 
      />

      {/* Hidden File Inputs */}
      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handleCameraCapture} style={{ display: 'none' }} />
      <input type="file" ref={stickerInputRef} accept="image/*" onChange={handleStickerCreate} style={{ display: 'none' }} />
      <input type="file" ref={customWallpaperFileInputRef} accept="image/*" onChange={handleCustomWallpaperUpload} style={{ display: 'none' }} />

      {/* FLOATING EMOJI PARTICLE CANNON ANIMATION */}
      {activeParticles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: '2.2rem',
            zIndex: 999,
            pointerEvents: 'none',
            animation: 'bounce 1.5s ease-out forwards',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.7))'
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* POOF DELETE TOAST */}
      {showPoofToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(234, 134, 143, 0.95)',
          color: '#ffffff',
          padding: '8px 18px',
          borderRadius: '20px',
          fontSize: '0.825rem',
          fontWeight: 700,
          zIndex: 1000,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💨 Message Poofed & Deleted!
        </div>
      )}

      {/* CUSTOM ACTION TOAST */}
      {customToast && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--accent-whatsapp)',
          color: '#ffffff',
          padding: '8px 20px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 700,
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(0, 168, 132, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {customToast}
        </div>
      )}

      {/* Active Conversation Chat Header */}
      {peerUser && (
        <div style={{
          padding: '10px 24px',
          background: 'var(--bg-header)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onBackToInbox && (
              <button
                onClick={onBackToInbox}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: '8px'
                }}
                title="Back to all contacts"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div 
              onClick={onToggleContactInfo}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative' }}>
                <img 
                  src={peerUser.avatar || activeRoom.avatar}
                  alt={peerUser.displayName}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                {peerUser.isOnline && (
                  <span style={{
                    position: 'absolute',
                    bottom: '1px',
                    right: '1px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--accent-whatsapp)',
                    border: '2px solid var(--bg-header)'
                  }} />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeRoom.title}
                  {activeRoom.isPinned && (
                    <Pin size={13} style={{ color: 'var(--accent-whatsapp)', transform: 'rotate(45deg)' }} />
                  )}
                  {activeRoom.keySafetyVerified && (
                    <ShieldCheck size={15} style={{ color: 'var(--accent-whatsapp)' }} />
                  )}
                </h3>
                <p style={{ fontSize: '0.75rem', color: isPeerTyping ? 'var(--accent-whatsapp)' : 'var(--text-muted)', margin: 0, fontWeight: isPeerTyping ? 700 : 400 }}>
                  {isPeerTyping ? 'typing...' : (peerUser.isOnline ? 'online • E2EE verified' : peerUser.lastSeen)}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Real-time Pin Chat Toggle */}
            <button
              onClick={() => {
                togglePinRoom(activeRoomId);
                triggerToast(activeRoom.isPinned ? 'Chat unpinned' : '📌 Chat pinned to top');
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: activeRoom.isPinned ? 'rgba(0, 168, 132, 0.25)' : 'rgba(255,255,255,0.06)',
                color: activeRoom.isPinned ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: activeRoom.isPinned ? '1px solid var(--accent-whatsapp)' : '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer'
              }}
              title={activeRoom.isPinned ? 'Unpin chat' : 'Pin chat to top in real-time'}
            >
              <Pin size={16} style={{ color: activeRoom.isPinned ? 'var(--accent-whatsapp)' : 'var(--text-muted)' }} />
              <span className="hide-on-mobile">{activeRoom.isPinned ? 'Pinned' : 'Pin'}</span>
            </button>

            <button
              onClick={() => initiateCall(peerUser, false)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
              title={`Start real-time voice call with ${peerUser.displayName}`}
            >
              <Phone size={16} style={{ color: 'var(--accent-whatsapp)' }} />
              <span className="hide-on-mobile">Audio</span>
            </button>

            <button
              onClick={() => initiateCall(peerUser, true)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0, 168, 132, 0.25) 0%, rgba(5, 150, 105, 0.25) 100%)',
                color: 'var(--accent-whatsapp)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid rgba(0, 168, 132, 0.4)',
                boxShadow: '0 2px 8px rgba(0, 168, 132, 0.15)'
              }}
              title={`Start real-time video call with ${peerUser.displayName}`}
            >
              <Video size={16} />
              <span className="hide-on-mobile">Video</span>
            </button>

            <button
              onClick={() => setShowWallpaperModal(true)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer'
              }}
              title={`Change Wallpaper Theme for ${activeRoom.title}`}
            >
              <Palette size={16} style={{ color: '#a55eea' }} />
              <span className="hide-on-mobile">Theme</span>
            </button>

            <button 
              onClick={onToggleContactInfo} 
              style={{ color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }} 
              title="Contact Info & Security"
            >
              <User size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Real-time Sticky Pinned Message Banner */}
      {activeRoom.pinnedMessage && (
        <div 
          onClick={() => scrollToMessage(activeRoom.pinnedMessage!.id)}
          style={{
            padding: '8px 20px',
            background: 'rgba(0, 168, 132, 0.15)',
            borderBottom: '1px solid rgba(0, 168, 132, 0.3)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 9,
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <Pin size={15} style={{ color: 'var(--accent-whatsapp)', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ fontWeight: 700, color: 'var(--accent-whatsapp)' }}>
                Pinned ({activeRoom.pinnedMessage.senderName}):{' '}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>
                {activeRoom.pinnedMessage.text}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePinMessage(activeRoomId, null);
              triggerToast('Message unpinned');
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            title="Unpin message"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Date Divider Pill */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <span className="date-pill">TODAY</span>
        </div>

        {activeMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isScam = msg.scamAnalysis?.isSuspicious;
          const isAudio = msg.mediaType === 'audio';
          const isHovered = hoveredMessageId === msg.id;

          const isSwipingThis = swipingMessageId === msg.id;

          return (
            <div 
              key={msg.id}
              id={`msg-${msg.id}`}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => {
                setHoveredMessageId(null);
                setActiveReactionMenuMsgId(null);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                position: 'relative',
                transition: 'background 0.3s ease'
              }}
            >
              {/* Sender Name if Group */}
              {!isMe && activeRoom.roomType !== 'direct' && (
                <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--accent-whatsapp)', marginBottom: '2px', marginLeft: '6px' }}>
                  {msg.senderName}
                </span>
              )}

              {/* Message Bubble Container with Swipe & Drag */}
              <div 
                onTouchStart={(e) => handleTouchStart(e, msg.id)}
                onTouchMove={(e) => handleTouchMove(e, msg)}
                onTouchEnd={() => handleTouchEnd(msg)}
                onMouseDown={(e) => handleMouseDown(e, msg.id)}
                onMouseMove={(e) => handleMouseMove(e, msg)}
                onMouseUp={() => handleMouseUp(msg)}
                style={{
                  maxWidth: '68%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'none',
                  transition: isSwipingThis ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'grab'
                }}
              >
                {/* Swipe Reply Pop Indicator */}
                {isSwipingThis && swipeOffset > 8 && (
                  <div style={{
                    position: 'absolute',
                    left: '-38px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: swipeOffset >= 35 ? 'rgba(0, 168, 132, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                    color: swipeOffset >= 35 ? 'var(--accent-whatsapp)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: swipeOffset >= 35 ? '0 0 12px rgba(0, 168, 132, 0.7)' : 'none',
                    transition: 'all 0.15s ease',
                    zIndex: 20
                  }}>
                    <Reply size={16} style={{ color: swipeOffset >= 35 ? '#38ef7d' : 'var(--text-muted)' }} />
                  </div>
                )}

                {/* Floating Emoji Quick Reactions Bar */}
                {activeReactionMenuMsgId === msg.id && (
                  <div style={{
                    position: 'absolute',
                    top: '-44px',
                    [isMe ? 'right' : 'left']: '0',
                    background: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '24px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    zIndex: 100,
                    animation: 'fadeIn 0.15s ease-out'
                  }}>
                    {['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉'].map((emoji) => {
                      const hasReacted = msg.reactions.some(r => r.emoji === emoji && r.userId === currentUser.id);
                      return (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            addReaction(activeRoomId, msg.id, emoji);
                            setActiveReactionMenuMsgId(null);
                          }}
                          style={{
                            fontSize: '1.25rem',
                            padding: '4px 5px',
                            borderRadius: '50%',
                            background: hasReacted ? 'rgba(0, 168, 132, 0.25)' : 'transparent',
                            border: hasReacted ? '1px solid var(--accent-whatsapp)' : 'none',
                            cursor: 'pointer',
                            lineHeight: 1,
                            transition: 'transform 0.12s ease'
                          }}
                          className="reaction-emoji-btn"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReactionMenuMsgId(null);
                        setShowEmojiPicker(true);
                      }}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="More Emojis"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                {/* Quick Message Actions on Hover (React, Reply, Delete) */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    [isMe ? 'left' : 'right']: '-82px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    zIndex: 15
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveReactionMenuMsgId(activeReactionMenuMsgId === msg.id ? null : msg.id);
                      }}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--bg-header)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title="React with Emoji"
                    >
                      <Smile size={13} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startReply(msg);
                      }}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'var(--bg-header)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title="Reply to message"
                    >
                      <Reply size={13} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinMessage(activeRoomId, msg);
                        triggerToast(activeRoom.pinnedMessage?.id === msg.id ? 'Message unpinned' : '📌 Message pinned in real-time');
                      }}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: activeRoom.pinnedMessage?.id === msg.id ? 'rgba(0, 168, 132, 0.3)' : 'var(--bg-header)',
                        color: activeRoom.pinnedMessage?.id === msg.id ? 'var(--accent-whatsapp)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      title={activeRoom.pinnedMessage?.id === msg.id ? "Unpin message" : "Pin message to top"}
                    >
                      <Pin size={12} />
                    </button>

                    {isMe && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMsg(msg.id);
                        }}
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'rgba(234, 134, 143, 0.2)',
                          color: '#ea868f',
                          border: '1px solid rgba(234, 134, 143, 0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* On-Device AI Scam Radar Warning Badge */}
                {isScam && scamRadarActive && (
                  <div className="badge-scam-high" style={{
                    padding: '10px 14px',
                    borderRadius: '12px 12px 0 0',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <ShieldAlert size={16} /> On-Device AI Scam Radar Warning ({Math.round(msg.scamAnalysis!.riskScore * 100)}% Risk)
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.75rem' }}>
                      {msg.scamAnalysis!.reasoning.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button 
                        onClick={() => openModal('proof_of_human')}
                        style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(229, 142, 38, 0.3)', color: '#e58e26', fontWeight: 700, fontSize: '0.725rem' }}
                      >
                        Challenge Bot
                      </button>
                      <button 
                        onClick={() => blockContact(msg.senderId)}
                        style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(234, 134, 143, 0.4)', color: '#fff', fontWeight: 700, fontSize: '0.725rem' }}
                      >
                        Block & Report
                      </button>
                    </div>
                  </div>
                )}

                {/* Speech Bubble */}
                <div className={isMe ? 'bubble-sent' : 'bubble-received'} style={{
                  padding: '8px 12px',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  position: 'relative'
                }}>
                  {/* QUOTED REPLY PREVIEW INSIDE BUBBLE */}
                  {msg.replyTo && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToMessage(msg.replyTo!.id);
                      }}
                      style={{
                        padding: '5px 10px',
                        marginBottom: '6px',
                        borderRadius: '6px',
                        background: isMe ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                        borderLeft: '3.5px solid var(--accent-whatsapp)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                      title="Click to jump to quoted message"
                    >
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-whatsapp)' }}>
                        {msg.replyTo.senderName}
                      </span>
                      <span style={{
                        fontSize: '0.76rem',
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '280px'
                      }}>
                        {msg.replyTo.text}
                      </span>
                    </div>
                  )}

                  {msg.mediaType === 'location' || msg.text.includes('📍') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(56, 239, 125, 0.2)',
                          color: '#38ef7d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                            Live Location Shared
                          </span>
                          <span style={{ fontSize: '0.675rem', color: '#38ef7d' }}>
                            ● Updating Live
                          </span>
                        </div>
                      </div>

                      {/* Map Card */}
                      <div style={{
                        height: '110px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid var(--border-color)',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '8px'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '35%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}>
                          <MapPin size={26} style={{ color: '#38ef7d', filter: 'drop-shadow(0 0 6px #38ef7d)' }} />
                        </div>

                        <div style={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          backdropFilter: 'blur(8px)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: '0.725rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                            {msg.text.replace('📍 Live Location: ', '')}
                          </span>
                          <a
                            href="https://maps.google.com/?q=37.7749,-122.4194"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: 'var(--accent-whatsapp)',
                              textDecoration: 'none'
                            }}
                          >
                            Open Map ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : isAudio ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '190px' }}>
                      <button
                        onClick={() => handleTogglePlayAudio(msg)}
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'var(--accent-whatsapp)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0, 168, 132, 0.3)'
                        }}
                        title={playingAudioId === msg.id ? "Pause Audio" : "Play Audio Voice Note"}
                      >
                        {playingAudioId === msg.id ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                      </button>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <span style={{ width: '4px', height: playingAudioId === msg.id ? '18px' : '14px', background: '#53bdeb', borderRadius: '2px', transition: 'height 0.15s ease' }} />
                          <span style={{ width: '4px', height: playingAudioId === msg.id ? '24px' : '20px', background: '#53bdeb', borderRadius: '2px', transition: 'height 0.15s ease' }} />
                          <span style={{ width: '4px', height: playingAudioId === msg.id ? '14px' : '10px', background: '#53bdeb', borderRadius: '2px', transition: 'height 0.15s ease' }} />
                          <span style={{ width: '4px', height: playingAudioId === msg.id ? '22px' : '16px', background: '#53bdeb', borderRadius: '2px', transition: 'height 0.15s ease' }} />
                          <span style={{ width: '4px', height: playingAudioId === msg.id ? '16px' : '12px', background: '#53bdeb', borderRadius: '2px', transition: 'height 0.15s ease' }} />
                          <span style={{ width: '4px', height: playingAudioId === msg.id ? '20px' : '14px', background: '#53bdeb', borderRadius: '2px', transition: 'height 0.15s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.72rem', color: playingAudioId === msg.id ? 'var(--accent-whatsapp)' : 'var(--text-muted)', fontWeight: playingAudioId === msg.id ? 700 : 400 }}>
                          {playingAudioId === msg.id ? 'Playing Voice Note... 🔊' : msg.text}
                        </span>
                      </div>
                    </div>
                  ) : (
                    renderMessageTextWithMentions(msg.text)
                  )}

                  {/* Mesh Relay Badge */}
                  {msg.meshRelayed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.675rem', color: '#53bdeb' }}>
                      <Wifi size={12} /> Relayed over BLE Mesh ({msg.meshHopCount} hops)
                    </div>
                  )}

                  {/* WHATSAPP TICK LOGIC (Single Tick for Offline, Double/Blue Tick for Online) */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.675rem',
                    color: isMe ? '#a7f3d0' : 'var(--text-muted)',
                    float: 'right',
                    marginTop: '4px',
                    marginLeft: '12px'
                  }}>
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>
                        {msg.status === 'sent' ? (
                          <span style={{ color: '#8696a0' }} title="Sent (Single Tick • Receiver Offline / No Internet)">✓</span>
                        ) : msg.status === 'delivered' ? (
                          <span style={{ color: '#8696a0' }} title="Delivered (Double Grey Tick)">✓✓</span>
                        ) : (
                          <span style={{ color: '#53bdeb', fontWeight: 700 }} title="Read (Double Blue Tick)">✓✓</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Reactions Pills */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    marginTop: '3px',
                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                  }}>
                    {msg.reactions.map((r, i) => {
                      const isMyReaction = r.userId === currentUser.id;
                      return (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            addReaction(activeRoomId, msg.id, r.emoji);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: isMyReaction ? 'rgba(0, 168, 132, 0.22)' : 'var(--bg-header)',
                            border: isMyReaction ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                            color: isMyReaction ? 'var(--accent-whatsapp)' : 'var(--text-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          title={isMyReaction ? `You reacted with ${r.emoji} (click to remove)` : `React with ${r.emoji}`}
                        >
                          <span>{r.emoji}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>{r.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Peer Typing Indicator */}
        {isPeerTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-whatsapp)', fontWeight: 600 }}>{activeRoom.title} is typing</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* EMOJI, STICKER CREATOR & FAVORITES POPOVER */}
      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          left: '16px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          padding: '14px',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Popover Header Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setPickerTab('emojis')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: pickerTab === 'emojis' ? 'var(--accent-whatsapp)' : 'transparent',
                  color: pickerTab === 'emojis' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Emojis 😊
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('stickers')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: pickerTab === 'stickers' ? 'var(--accent-whatsapp)' : 'transparent',
                  color: pickerTab === 'stickers' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Stickers 🎨
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('saved')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: pickerTab === 'saved' ? 'var(--accent-amber)' : 'transparent',
                  color: pickerTab === 'saved' ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Star size={12} /> Saved ⭐
              </button>
            </div>

            <button onClick={() => setShowEmojiPicker(false)} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', background: 'transparent' }}>✕</button>
          </div>

          {/* TAB 1: EMOJIS */}
          {pickerTab === 'emojis' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {emojiList.map((emoji, idx) => (
                <div key={idx} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    style={{ fontSize: '1.3rem', padding: '6px', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}
                  >
                    {emoji}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: STICKERS & STICKER CREATOR */}
          {pickerTab === 'stickers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Create Sticker Button */}
              <button
                type="button"
                onClick={() => stickerInputRef.current?.click()}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(0, 168, 132, 0.15)',
                  border: '1px dashed var(--accent-whatsapp)',
                  color: 'var(--accent-whatsapp)',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} /> Create Custom Sticker from Image
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {customStickers.map((stk) => (
                  <div
                    key={stk.id}
                    onClick={() => handleStickerSend(stk)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px',
                      borderRadius: '8px',
                      background: 'var(--bg-header)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <img src={stk.url} alt={stk.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70px' }}>
                      {stk.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED FAVORITES */}
          {pickerTab === 'saved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Starred Emojis & Stickers:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {savedFavorites.map((fav, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (fav.includes(' ')) {
                        sendMessage(activeRoomId, `🎨 Sticker: ${fav}`, 'image');
                      } else {
                        handleEmojiSelect(fav);
                      }
                      setShowEmojiPicker(false); // Disappear popover!
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-header)',
                      border: '1px solid var(--accent-amber)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {fav}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTACHMENT MENU (Auto-disappears after click) */}
      {showAttachMenu && (
        <div style={{
          position: 'absolute',
          bottom: '72px',
          left: '24px',
          background: 'var(--bg-header)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          gap: '20px',
          zIndex: 100,
          border: '1px solid var(--border-color)'
        }}>
          <button 
            onClick={handleShareLocation}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#38ef7d', fontSize: '0.725rem' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 239, 125, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={22} />
            </div>
            Location & Map
          </button>

          <button 
            onClick={() => { cameraInputRef.current?.click(); setShowAttachMenu(false); }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#53bdeb', fontSize: '0.725rem' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(83, 189, 235, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={22} />
            </div>
            Camera & Photos
          </button>

          <button 
            onClick={() => {
              setShowAttachMenu(false);
              sendMessage(activeRoomId, '📑 Shared Confidential Document: Double_Ratchet_Spec.pdf (2.4 MB • Hardware Verified)');
            }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#a55eea', fontSize: '0.725rem' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(165, 94, 234, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={22} />
            </div>
            Document
          </button>

          <button 
            onClick={() => {
              setShowAttachMenu(false);
              sendMessage(activeRoomId, '📊 Poll: Zero-Knowledge Verification Mode?\n1️⃣ Hardware Biometrics\n2️⃣ Double Ratchet Key Exchange\n3️⃣ Air-Gapped NFC');
            }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#e58e26', fontSize: '0.725rem' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(229, 142, 38, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={22} />
            </div>
            Poll
          </button>
        </div>
      )}

      {/* VOICE RECORDING BAR (With Pause/Play/Resume Controls) VS STANDARD COMPOSER */}
      {isRecordingVoice ? (
        <div style={{
          padding: '10px 16px',
          background: 'var(--bg-header)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          position: 'sticky',
          bottom: 0,
          zIndex: 50
        }}>
          {/* Left Recording Trash / Cancel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => { setIsRecordingVoice(false); setIsVoicePaused(false); setRecordingSeconds(0); }} 
              style={{ color: '#f43f5e', padding: '6px', background: 'transparent' }} 
              title="Cancel & Trash Recording"
            >
              <Trash2 size={20} />
            </button>

            {/* PAUSE / RESUME RECORDING BUTTON */}
            <button
              onClick={() => setIsVoicePaused(!isVoicePaused)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                background: isVoicePaused ? 'rgba(0, 168, 132, 0.2)' : 'rgba(234, 134, 143, 0.2)',
                color: isVoicePaused ? 'var(--accent-whatsapp)' : '#ea868f',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title={isVoicePaused ? "Resume Recording" : "Pause Recording"}
            >
              {isVoicePaused ? <Play size={14} /> : <Pause size={14} />}
              {isVoicePaused ? "Resume" : "Pause"}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isVoicePaused && <span className="record-pulse" />}
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-whatsapp)', fontFamily: 'var(--font-mono)' }}>
                {formatTime(recordingSeconds)}
              </span>
            </div>
          </div>

          {/* Voice Pitch Modifiers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Voice FX:</span>
            {[
              { id: 'normal', label: '🎙️ Normal' },
              { id: 'chipmunk', label: '🤡 Chipmunk' },
              { id: 'deep', label: '👹 Deep' },
              { id: 'alien', label: '👽 Alien' }
            ].map(fx => (
              <button
                key={fx.id}
                type="button"
                onClick={() => setVoiceEffect(fx.id as any)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  background: voiceEffect === fx.id ? 'var(--accent-whatsapp)' : 'var(--bg-sidebar)',
                  color: voiceEffect === fx.id ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {fx.label}
              </button>
            ))}
          </div>

          {/* Send Voice Note */}
          <button 
            onClick={handleSendVoiceNote}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-whatsapp)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Send Voice Note"
          >
            <Send size={18} />
          </button>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-header)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          bottom: 0,
          zIndex: 50
        }}>
          {/* QUOTED REPLY PREVIEW BANNER ABOVE INPUT */}
          {replyingTo && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid var(--border-color)',
              borderLeft: '4px solid var(--accent-whatsapp)',
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', flex: 1, marginRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Reply size={13} style={{ color: 'var(--accent-whatsapp)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-whatsapp)' }}>
                    Replying to {replyingTo.senderId === currentUser.id ? 'yourself' : replyingTo.senderName}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {replyingTo.text}
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%'
                }}
                title="Cancel reply"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div style={{
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {/* FUNNY AI ROAST MODE TOGGLE BUTTON */}
            <button
              onClick={toggleAiRoastMode}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: aiRoastModeActive ? 'rgba(165, 94, 234, 0.25)' : 'rgba(255,255,255,0.05)',
                border: aiRoastModeActive ? '1px solid #a55eea' : '1px solid var(--border-color)',
                color: aiRoastModeActive ? '#a55eea' : 'var(--text-muted)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              title="Toggle Sarcastic AI Roast Auto-Replies"
            >
              🤡 AI Roast {aiRoastModeActive ? 'ON' : 'OFF'}
            </button>

            {/* Emoji / Sticker Popover Button */}
            <button 
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }} 
              style={{ color: showEmojiPicker ? 'var(--accent-whatsapp)' : 'var(--text-secondary)', background: 'transparent' }} 
              title="Emoji, Sticker & Saved Favorites"
            >
              <Smile size={24} />
            </button>

            {/* QUICK MENTION BUTTON */}
            <button
              type="button"
              onClick={() => {
                setShowMentionMenu(prev => !prev);
                setMentionQuery('');
              }}
              style={{ 
                color: showMentionMenu ? 'var(--accent-whatsapp)' : 'var(--text-secondary)', 
                background: showMentionMenu ? 'rgba(0, 168, 132, 0.15)' : 'transparent',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Mention user, whisper, or @everyone"
            >
              <AtSign size={21} />
            </button>

            {/* DEDICATED CAMERA BUTTON (Opens Live Viewfinder / Snapshot Studio) */}
            <button
              onClick={() => setShowCameraModal(true)}
              style={{ color: 'var(--text-secondary)', background: 'transparent' }}
              title="Open Camera & Instant Encrypted Snapshot"
            >
              <Camera size={22} />
            </button>

            {/* Attachment Menu Button */}
            <button 
              onClick={() => { setShowAttachMenu(prev => !prev); setShowEmojiPicker(false); }} 
              style={{ color: showAttachMenu ? 'var(--accent-whatsapp)' : 'var(--text-secondary)', background: 'transparent' }} 
              title="Attach Media & Location"
            >
              <Paperclip size={22} />
            </button>

            {/* Direct Real-Time Pin Chat Button */}
            <button 
              type="button"
              onClick={() => togglePinRoom(activeRoomId)} 
              style={{ 
                color: activeRoom.isPinned ? 'var(--accent-whatsapp)' : 'var(--text-secondary)', 
                background: activeRoom.isPinned ? 'rgba(0, 168, 132, 0.15)' : 'transparent',
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }} 
              title={activeRoom.isPinned ? "Chat Pinned in Real-Time (Click to Unpin)" : "Pin Chat to Top in Real-Time"}
            >
              <Pin size={21} style={{ transform: 'rotate(45deg)' }} />
            </button>

            <form onSubmit={handleSend} style={{ flex: 1, position: 'relative' }}>
              {/* MENTION AUTO-SUGGEST POPOVER (Floats directly above input) */}
              {showMentionMenu && filteredMentions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  left: 0,
                  width: '320px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '6px'
                }}>
                  <div style={{
                    padding: '8px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--text-muted)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AtSign size={13} style={{ color: 'var(--accent-whatsapp)' }} />
                      Mentions & Whispers
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#53bdeb' }}>ESC or click to dismiss</span>
                  </div>

                  {filteredMentions.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMention(m.tag)}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '2px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: m.type === 'all' ? '#38ef7d' : m.type === 'private' ? '#c084fc' : '#53bdeb'
                        }}>
                          {m.display}
                        </span>
                        {m.type === 'private' && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(165, 94, 234, 0.25)',
                            color: '#c084fc',
                            fontWeight: 700,
                            marginLeft: 'auto'
                          }}>
                            Whisper
                          </span>
                        )}
                        {m.type === 'all' && (
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(56, 239, 125, 0.2)',
                            color: '#38ef7d',
                            fontWeight: 700,
                            marginLeft: 'auto'
                          }}>
                            Notify All
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {m.sub}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <input 
                ref={inputRef}
                type="text"
                placeholder={replyingTo ? `Replying to ${replyingTo.senderName}...` : "Type a message or @ to mention..."}
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={e => {
                  if (e.key === 'Escape' && showMentionMenu) {
                    setShowMentionMenu(false);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'var(--bg-input)',
                  border: 'none',
                  fontSize: '0.925rem',
                  color: 'var(--text-primary)'
                }}
              />
            </form>

            {inputText.trim() ? (
              <button 
                onClick={() => handleSend()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--accent-whatsapp)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Send Message"
              >
                <Send size={18} />
              </button>
            ) : (
              <button 
                onClick={handleStartVoiceRecording}
                style={{ color: 'var(--accent-whatsapp)', background: 'transparent' }} 
                title="Record Voice Note"
              >
                <Mic size={24} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHAT WALLPAPER & THEME CUSTOMIZER MODAL                                   */}
      {/* ========================================================================= */}
      {showWallpaperModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: 'var(--bg-sidebar)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-header)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(165, 94, 234, 0.2)',
                  color: '#a55eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Palette size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Chat Wallpaper & Theme</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Customize background for this contact or across all chats
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWallpaperModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scope Selection Tabs */}
            <div style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => setWallpaperScope('this')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: wallpaperScope === 'this' ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                  background: wallpaperScope === 'this' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
                  color: wallpaperScope === 'this' ? 'var(--accent-whatsapp)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>👤</span>
                <span>This Chat Only ({activeRoom.title})</span>
              </button>

              <button
                type="button"
                onClick={() => setWallpaperScope('all')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: wallpaperScope === 'all' ? '1px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                  background: wallpaperScope === 'all' ? 'rgba(0, 168, 132, 0.2)' : 'transparent',
                  color: wallpaperScope === 'all' ? 'var(--accent-whatsapp)' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>🌐</span>
                <span>All Chats Globally</span>
              </button>
            </div>

            {/* UPLOAD PERSONAL IMAGE FROM DEVICE */}
            <div style={{ padding: '16px 20px 0 20px' }}>
              <div 
                onClick={() => customWallpaperFileInputRef.current?.click()}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(0, 168, 132, 0.16) 0%, rgba(165, 94, 234, 0.16) 100%)',
                  border: '2px dashed var(--accent-whatsapp)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 168, 132, 0.25) 0%, rgba(165, 94, 234, 0.25) 100%)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 168, 132, 0.16) 0%, rgba(165, 94, 234, 0.16) 100%)')}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--accent-whatsapp)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(0, 168, 132, 0.4)'
                }}>
                  <Upload size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Upload Personal Image as Background
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Set any photo from your computer or phone (JPG, PNG, WebP)
                  </p>
                </div>
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--accent-whatsapp)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Choose Photo
                </button>
              </div>
            </div>

            {/* Live Chat Readability Preview Box */}
            <div style={{ padding: '14px 20px 0 20px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Live Chat Readability Preview:
              </span>
              <div style={{
                height: '114px',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                backgroundColor: '#0b141a'
              }}>
                <div 
                  style={{
                    position: 'absolute',
                    top: -6,
                    left: -6,
                    right: -6,
                    bottom: -6,
                    zIndex: 0,
                    pointerEvents: 'none',
                    ...getWallpaperBackground(currentWallpaper)
                  }}
                />
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '6px 12px',
                  borderRadius: '8px 8px 8px 0',
                  background: 'var(--bg-header)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  {peerUser?.displayName || 'Peer'}: Your personal wallpaper looks awesome! 🌟
                </div>
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '6px 12px',
                  borderRadius: '8px 8px 0 8px',
                  background: 'var(--accent-whatsapp)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  alignSelf: 'flex-end',
                  maxWidth: '80%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                }}>
                  Elena: Text is crystal clear and Double Ratchet encrypted. 🔒
                </div>
              </div>
            </div>

            {/* Wallpaper Darkening & Blur Sliders */}
            <div style={{ padding: '12px 20px 0 20px', display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Darkening Dimmer</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-whatsapp)' }}>{Math.round(wallpaperDimming * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.9"
                  step="0.05"
                  value={wallpaperDimming}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setWallpaperDimming(v);
                    localStorage.setItem('nimbus_wallpaper_dimming', String(v));
                  }}
                  style={{ width: '100%', accentColor: 'var(--accent-whatsapp)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>Soft Focus Blur</span>
                  <span style={{ fontWeight: 700, color: '#a55eea' }}>{wallpaperBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={wallpaperBlur}
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    setWallpaperBlur(v);
                    localStorage.setItem('nimbus_wallpaper_blur', String(v));
                  }}
                  style={{ width: '100%', accentColor: '#a55eea', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Wallpapers Presets Grid */}
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '340px', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Curated High-Performance Themes
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { id: 'default', name: 'Default Dark', style: { background: '#0b141a' }, icon: '🖤' },
                  { id: 'emerald', name: 'Emerald Cyber', style: { background: 'linear-gradient(145deg, #062e24 0%, #03140e 100%)' }, icon: '🌿' },
                  { id: 'cyberpunk', name: 'Neon Cyberpunk', style: { background: 'linear-gradient(145deg, #160829 0%, #081226 100%)' }, icon: '⚡' },
                  { id: 'space', name: 'Deep Space', style: { background: 'linear-gradient(145deg, #090e21 0%, #1b0c2a 100%)' }, icon: '🌌' },
                  { id: 'sunset', name: 'Sunset Twilight', style: { background: 'linear-gradient(145deg, #24131e 0%, #1a162b 100%)' }, icon: '🌅' },
                  { id: 'hex', name: 'Hex Matrix', style: { background: '#081216', border: '1px dashed #00a884' }, icon: '⬡' },
                  { 
                    id: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', 
                    name: 'Breeze Ocean', 
                    style: { backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80")', backgroundSize: 'cover' }, 
                    icon: '🌊' 
                  },
                  { 
                    id: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80', 
                    name: 'Tokyo Neon', 
                    style: { backgroundImage: 'url("https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&auto=format&fit=crop&q=80")', backgroundSize: 'cover' }, 
                    icon: '🏙️' 
                  },
                  { 
                    id: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80', 
                    name: 'Nordic Aurora', 
                    style: { backgroundImage: 'url("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80")', backgroundSize: 'cover' }, 
                    icon: '✨' 
                  }
                ].map(wp => {
                  const isSelected = currentWallpaper === wp.id;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => handleApplyWallpaper(wp.id)}
                      style={{
                        height: '90px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--accent-whatsapp)' : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '8px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: isSelected ? '0 0 12px rgba(0, 168, 132, 0.4)' : 'none',
                        transition: 'transform 0.15s ease, border-color 0.15s ease',
                        ...wp.style
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)'
                      }} />
                      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>
                          {wp.icon} {wp.name}
                        </span>
                        {isSelected && (
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-whatsapp)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={10} color="#fff" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Image URL Option */}
              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Or paste custom wallpaper image URL:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={customWallpaperInput}
                    onChange={e => setCustomWallpaperInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customWallpaperInput.trim()) {
                        handleApplyWallpaper(customWallpaperInput.trim());
                      }
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'var(--accent-whatsapp)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              background: 'var(--bg-header)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={handleResetWallpaper}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={14} />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWallpaperModal(false)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIVE CAMERA VIEWFINDER & HARDWARE SNAPSHOT MODAL                         */}
      {/* ========================================================================= */}
      {showCameraModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.88)',
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
            background: '#090d10',
            borderRadius: '20px',
            border: '1px solid rgba(0, 168, 132, 0.3)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.8), 0 0 20px rgba(0, 168, 132, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Viewfinder Top Bar */}
            <div style={{
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.6)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38ef7d', animation: 'pulse 1.5s infinite' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38ef7d', letterSpacing: '0.5px' }}>
                  E2EE CAMERA FEED • 1080P
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Flash Toggle */}
                <button
                  onClick={() => setCameraFlash(f => f === 'auto' ? 'on' : f === 'on' ? 'off' : 'auto')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: cameraFlash === 'on' ? '#f59e0b' : '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Toggle Camera Flash"
                >
                  <Zap size={14} />
                  <span>{cameraFlash.toUpperCase()}</span>
                </button>

                {/* Camera Flip (Front/Back) */}
                <button
                  onClick={() => setCameraFacing(c => c === 'back' ? 'front' : 'back')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Switch Front/Back Lens"
                >
                  <RefreshCw size={14} />
                  <span>{cameraFacing === 'back' ? 'REAR' : 'FRONT'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowCameraModal(false);
                    setCapturedPhoto(null);
                    setPhotoCaption('');
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewfinder Main Frame */}
            <div style={{
              height: '380px',
              position: 'relative',
              background: '#000',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Screen flash effect upon snap */}
              {isCapturingAnimation && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#ffffff',
                  zIndex: 20,
                  animation: 'fadeOut 0.35s forwards'
                }} />
              )}

              {capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured snapshot"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <>
                  {/* Live viewfinder simulation with camera grid and corner reticles */}
                  <img
                    src={cameraFacing === 'front' 
                      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80'}
                    alt="Camera Viewfinder"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                  />

                  {/* Camera Reticle Corners */}
                  <div style={{ position: 'absolute', top: '24px', left: '24px', width: '24px', height: '24px', borderTop: '2px solid #38ef7d', borderLeft: '2px solid #38ef7d' }} />
                  <div style={{ position: 'absolute', top: '24px', right: '24px', width: '24px', height: '24px', borderTop: '2px solid #38ef7d', borderRight: '2px solid #38ef7d' }} />
                  <div style={{ position: 'absolute', bottom: '24px', left: '24px', width: '24px', height: '24px', borderBottom: '2px solid #38ef7d', borderLeft: '2px solid #38ef7d' }} />
                  <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '24px', height: '24px', borderBottom: '2px solid #38ef7d', borderRight: '2px solid #38ef7d' }} />

                  {/* Center Focus Box */}
                  <div style={{
                    position: 'absolute',
                    width: '60px',
                    height: '60px',
                    border: '1px dashed rgba(56, 239, 125, 0.6)',
                    borderRadius: '8px',
                    pointerEvents: 'none'
                  }} />

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '14px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.675rem',
                    color: '#a7f3d0'
                  }}>
                    🔒 SHA-256 Watermark Active
                  </div>
                </>
              )}
            </div>

            {/* Bottom Controls / Action Pad */}
            <div style={{
              padding: '16px 20px',
              background: '#090d10',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {capturedPhoto ? (
                <>
                  <input
                    type="text"
                    placeholder="Add a caption for this encrypted photo..."
                    value={photoCaption}
                    onChange={e => setPhotoCaption(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setCapturedPhoto(null); setPhotoCaption(''); }}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Retake
                    </button>
                    <button
                      onClick={handleSendCapturedPhoto}
                      style={{
                        flex: 2,
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'var(--accent-whatsapp)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Send size={16} />
                      <span>Send Encrypted Photo</span>
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Local file picker fallback */}
                  <button
                    onClick={() => {
                      cameraInputRef.current?.click();
                      setShowCameraModal(false);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ImageIcon size={16} />
                    <span>Upload File</span>
                  </button>

                  {/* SHUTTER BUTTON */}
                  <button
                    onClick={handleSnapPhoto}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '4px solid #fff',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 16px rgba(255,255,255,0.3)',
                      transition: 'transform 0.1s ease'
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    title="Snap Encrypted Photo"
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fff' }} />
                  </button>

                    <div style={{ width: '80px' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

