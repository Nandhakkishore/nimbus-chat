// HumanLink Core Domain Model Definitions

export type RoomType = 'direct' | 'group' | 'channel' | 'ephemeral';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type RiskCategory = 'low' | 'moderate' | 'high' | 'suspicious';
export type ReputationTier = 0 | 1 | 2; // 0=New/Low Trust, 1=Standard, 2=High Trust

export interface User {
  id: string;
  phoneNumber: string;
  displayName: string;
  avatar: string;
  about: string;
  trustScore: number;
  reputationTier: ReputationTier;
  verifiedKeyQR: boolean;
  isBlocked: boolean;
  isUnknownSender: boolean;
  lastSeen: string;
  isOnline: boolean;
  passkeyEnabled: boolean;
  has2SV: boolean;
}

export interface DeviceKey {
  deviceId: string;
  deviceName: string;
  fingerprint: string;
  verifiedAt?: string;
  safetyNumber: string;
}

export interface TrustContext {
  trustScore: number; // 0 - 100
  connectionDegree: 1 | 2 | 3;
  sharedGroups: number;
  country: string;
  mutualContactsCount: number;
  riskCategory: RiskCategory;
}

export interface ScamScanResult {
  riskScore: number; // 0.0 to 1.0
  category: 'phishing' | 'financial_fraud' | 'impersonation' | 'deepfake_risk' | 'clean';
  isSuspicious: boolean;
  reasoning: string[];
  recommendedAction: 'allow' | 'warn' | 'block' | 'challenge';
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  count: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  mediaUrl?: string;
  audioUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document' | 'location';
  locationData?: {
    latitude: number;
    longitude: number;
    address: string;
    isLive?: boolean;
  };
  voiceNoteDuration?: number; // seconds
  timestamp: string;
  status: MessageStatus;
  reactions: MessageReaction[];
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  isEdited?: boolean;
  scamAnalysis?: ScamScanResult;
  meshRelayed?: boolean;
  meshHopCount?: number;
}

export interface ChatRoom {
  id: string;
  title: string;
  roomType: RoomType;
  avatar: string;
  members: User[];
  lastMessage?: Message;
  unreadCount: number;
  isEphemeral: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  pinnedMessage?: Message | null;
  ephemeralTtlSeconds?: number;
  ephemeralExpiresAt?: number; // Unix timestamp
  isMeshOnly?: boolean;
  keySafetyVerified?: boolean;
}

export type CallStatus = 'idle' | 'ringing_outgoing' | 'ringing_incoming' | 'connected' | 'ended';

export interface CallQualityStats {
  latencyMs: number;
  resolution: string;
  packetLoss: number;
  fps: number;
}

export interface CallState {
  active: boolean;
  status: CallStatus;
  callId?: string;
  caller?: User;
  targetUser?: User;
  isVideo: boolean;
  isIncoming: boolean;
  trustContext?: TrustContext;
  deepfakeRiskScore?: number; // 0 - 100%
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isMinimized: boolean;
  durationSeconds: number;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  callQuality?: CallQualityStats;
  localAudioLevel?: number; // 0 to 100
  peerAudioLevel?: number; // 0 to 100
}

export interface CallHistoryItem {
  id: string;
  user: User;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo: boolean;
  timestamp: string;
  durationSeconds: number;
  deepfakeRiskScore?: number;
}

export interface MeshNode {
  nodeId: string;
  name: string;
  signalStrengthDbm: number;
  isRelayActive: boolean;
  batteryPercent: number;
  distanceMeters: number;
  queuedPackets: number;
}

export interface ProofOfHumanChallenge {
  challengeId: string;
  senderId: string;
  puzzleType: 'pattern_match' | 'rotation' | 'math_check';
  question: string;
  options: string[];
  correctIndex: number;
  isSolved: boolean;
}
