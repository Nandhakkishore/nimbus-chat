import { User, ChatRoom, Message, DeviceKey, ProofOfHumanChallenge } from '../types';

export const CURRENT_USER: User = {
  id: 'usr_me_001',
  phoneNumber: '+1 202 555 0199',
  displayName: 'Elena Rostova',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  about: 'Building resilient human-first technology 🌐',
  trustScore: 96,
  reputationTier: 2,
  verifiedKeyQR: true,
  isBlocked: false,
  isUnknownSender: false,
  lastSeen: 'Online',
  isOnline: true,
  passkeyEnabled: true,
  has2SV: true
};

export const CURRENT_DEVICE_KEY: DeviceKey = {
  deviceId: 'dev_macbook_m3_01',
  deviceName: 'Elena’s MacBook Pro (Apple Silicon)',
  fingerprint: 'e8f39a04b12c8491a90234f98104ce7732b1a098451f021e3309a4d019f2c811',
  verifiedAt: '2026-09-01T10:30:00Z',
  safetyNumber: '84920 38104 99120 44819 02931 77192'
};

export const MOCK_USERS: Record<string, User> = {
  marcus: {
    id: 'usr_marcus_02',
    phoneNumber: '+1 415 555 0142',
    displayName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    about: 'Cryptography & Mesh Networks lead',
    trustScore: 92,
    reputationTier: 2,
    verifiedKeyQR: true,
    isBlocked: false,
    isUnknownSender: false,
    lastSeen: '2 mins ago',
    isOnline: true,
    passkeyEnabled: true,
    has2SV: true
  },
  dr_aris: {
    id: 'usr_aris_03',
    phoneNumber: '+41 22 555 0188',
    displayName: 'Dr. Aris Thorne',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    about: 'Quantum Security Institute Zurich',
    trustScore: 88,
    reputationTier: 2,
    verifiedKeyQR: true,
    isBlocked: false,
    isUnknownSender: false,
    lastSeen: '1 hour ago',
    isOnline: false,
    passkeyEnabled: true,
    has2SV: true
  },
  unknown_scammer: {
    id: 'usr_scam_04',
    phoneNumber: '+44 7700 900077',
    displayName: '+44 7700 900077 (Unknown Sender)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    about: 'Account Support Officer',
    trustScore: 18,
    reputationTier: 0,
    verifiedKeyQR: false,
    isBlocked: false,
    isUnknownSender: true,
    lastSeen: 'Just now',
    isOnline: true,
    passkeyEnabled: false,
    has2SV: false
  }
};

export const INITIAL_MESSAGES_MARCUS: Message[] = [
  {
    id: 'msg_m1',
    roomId: 'room_marcus',
    senderId: 'usr_marcus_02',
    senderName: 'Marcus Vance',
    senderAvatar: MOCK_USERS.marcus.avatar,
    text: 'Hey Elena! The new Double Ratchet E2EE key exchange benchmarks are looking phenomenal.',
    timestamp: '14:02',
    status: 'read',
    reactions: [{ emoji: '⚡', userId: 'usr_me_001', count: 1 }]
  },
  {
    id: 'msg_m2',
    roomId: 'room_marcus',
    senderId: 'usr_marcus_02',
    senderName: 'Marcus Vance',
    senderAvatar: MOCK_USERS.marcus.avatar,
    text: 'Also verified our device keys via QR scan earlier. Safety number matches perfectly!',
    timestamp: '14:03',
    status: 'read',
    reactions: [{ emoji: '🔒', userId: 'usr_me_001', count: 1 }]
  },
  {
    id: 'msg_m3',
    roomId: 'room_marcus',
    senderId: 'usr_me_001',
    senderName: 'Elena Rostova',
    senderAvatar: CURRENT_USER.avatar,
    text: 'Awesome. Have you tested the Mesh-Fallback mode when internet drops?',
    timestamp: '14:05',
    status: 'read',
    reactions: []
  },
  {
    id: 'msg_m4',
    roomId: 'room_marcus',
    senderId: 'usr_marcus_02',
    senderName: 'Marcus Vance',
    senderAvatar: MOCK_USERS.marcus.avatar,
    text: 'Yes! BLE relay packets were delivered across 3 hops in less than 400ms.',
    timestamp: '14:06',
    status: 'read',
    reactions: [{ emoji: '🔥', userId: 'usr_me_001', count: 1 }]
  }
];

export const INITIAL_MESSAGES_SCAMMER: Message[] = [
  {
    id: 'msg_s1',
    roomId: 'room_scammer',
    senderId: 'usr_scam_04',
    senderName: '+44 7700 900077',
    senderAvatar: MOCK_USERS.unknown_scammer.avatar,
    text: 'URGENT: Your HumanLink bank transfer requires immediate verification! Claim your $5,000 crypto bonus at http://paypa1-security-claim.com before your account is blocked.',
    timestamp: '14:10',
    status: 'delivered',
    reactions: [],
    scamAnalysis: {
      riskScore: 0.94,
      category: 'phishing',
      isSuspicious: true,
      reasoning: [
        'Contains urgent financial keyword: "urgent", "bank transfer", "claim prize"',
        'Detected spoofed homoglyph domain: "paypa1"',
        'Sender has low Trust Graph rating (18/100)'
      ],
      recommendedAction: 'block'
    }
  }
];

export const INITIAL_ROOMS: ChatRoom[] = [
  {
    id: 'room_marcus',
    title: 'Marcus Vance',
    roomType: 'direct',
    avatar: MOCK_USERS.marcus.avatar,
    members: [CURRENT_USER, MOCK_USERS.marcus],
    lastMessage: INITIAL_MESSAGES_MARCUS[3],
    unreadCount: 0,
    isEphemeral: false,
    keySafetyVerified: true
  },
  {
    id: 'room_scammer',
    title: '+44 7700 900077 (Unknown)',
    roomType: 'direct',
    avatar: MOCK_USERS.unknown_scammer.avatar,
    members: [CURRENT_USER, MOCK_USERS.unknown_scammer],
    lastMessage: INITIAL_MESSAGES_SCAMMER[0],
    unreadCount: 1,
    isEphemeral: false,
    keySafetyVerified: false
  },
  {
    id: 'room_ephemeral_sf',
    title: '⚡ Ephemeral: Quantum Tech Meetup SF',
    roomType: 'ephemeral',
    avatar: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=150&auto=format&fit=crop&q=80',
    members: [CURRENT_USER, MOCK_USERS.marcus, MOCK_USERS.dr_aris],
    lastMessage: {
      id: 'msg_e1',
      roomId: 'room_ephemeral_sf',
      senderId: 'usr_aris_03',
      senderName: 'Dr. Aris Thorne',
      senderAvatar: MOCK_USERS.dr_aris.avatar,
      text: 'Room set to self-destruct in 45 minutes. All message keys will be hard purged.',
      timestamp: '14:00',
      status: 'read',
      reactions: []
    },
    unreadCount: 0,
    isEphemeral: true,
    ephemeralTtlSeconds: 2700,
    ephemeralExpiresAt: Date.now() + 2700 * 1000
  },
  {
    id: 'room_channel_announcements',
    title: '📢 HumanLink Security & Product Updates',
    roomType: 'channel',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    members: [CURRENT_USER],
    lastMessage: {
      id: 'msg_c1',
      roomId: 'room_channel_announcements',
      senderId: 'sys_admin',
      senderName: 'HumanLink Official',
      senderAvatar: '',
      text: 'v1.0 Released: Device-bound QR Key Verification, On-Device Scam Radar, and Mesh-Fallback Messaging now active globally!',
      timestamp: 'Yesterday',
      status: 'read',
      reactions: [{ emoji: '🚀', userId: 'usr_me_001', count: 124 }]
    },
    unreadCount: 0,
    isEphemeral: false
  }
];

export const MOCK_PROOF_CHALLENGE: ProofOfHumanChallenge = {
  challengeId: 'ch_88192',
  senderId: 'usr_scam_04',
  puzzleType: 'pattern_match',
  question: 'Select the HumanLink security icon that completes the encrypted pattern:',
  options: ['🔒 Shield Key', '🤖 Bot Icon', '⚡ Lightning Bolt', '🌐 Public Mesh'],
  correctIndex: 0,
  isSolved: false
};
