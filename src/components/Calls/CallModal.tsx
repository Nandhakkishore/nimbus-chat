import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PhoneOff, Phone, Mic, MicOff, Video, VideoOff, Monitor, 
  ShieldAlert, ShieldCheck, UserX, Globe, Users, Network,
  Maximize2, Minimize2, Activity, Wifi, Volume2, Sparkles, ChevronDown, ChevronUp, Lock
} from 'lucide-react';

export const CallModal: React.FC = () => {
  const { 
    activeCall, endCall, acceptCall, declineCall, 
    toggleMute, toggleCamera, toggleScreenShare, toggleCallMinimize,
    blockContact 
  } = useApp();

  const [showTrustDetails, setShowTrustDetails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pipPosition, setPipPosition] = useState<'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'>('top-right');
  const [isSelfViewEnlarged, setIsSelfViewEnlarged] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const miniVideoRef = useRef<HTMLVideoElement>(null);

  const { 
    active, status, caller, targetUser, isIncoming, isVideo, 
    isMuted, isCameraOn, isScreenSharing, isMinimized, durationSeconds,
    localStream, remoteStream, trustContext, deepfakeRiskScore, callQuality 
  } = activeCall;

  // Active peer user object
  const peerUser = isIncoming ? caller : (targetUser || caller);
  const isHighDeepfakeRisk = (deepfakeRiskScore || 0) > 50;

  // Attach local media stream to self-view video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(e => console.warn('Local play error:', e));
    }
  }, [localStream, status, isMinimized, isSelfViewEnlarged]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn('Remote play error:', e));
    }
  }, [remoteStream, status, isMinimized, isSelfViewEnlarged]);

  // Attach stream to minimized PiP widget
  useEffect(() => {
    if (miniVideoRef.current && isMinimized) {
      miniVideoRef.current.srcObject = remoteStream || localStream || null;
      miniVideoRef.current.play().catch(e => console.warn('Mini play error:', e));
    }
  }, [remoteStream, localStream, isMinimized]);

  if (!active || !peerUser) return null;

  // Format call duration MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle browser fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // 1. MINIMIZED PICTURE-IN-PICTURE WIDGET (floating in bottom corner)
  if (isMinimized) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '280px',
          height: '180px',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 168, 132, 0.4)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={toggleCallMinimize}
        title="Click to expand video call"
      >
        {/* Video feed or avatar */}
        <div style={{ position: 'relative', flex: 1, background: '#090d16', overflow: 'hidden' }}>
          {(remoteStream || localStream) ? (
            <video 
              ref={miniVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <img 
                src={peerUser.avatar} 
                alt={peerUser.displayName} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-whatsapp)' }} 
              />
            </div>
          )}

          {/* Overlay Status Bar */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.65)',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            color: '#fff',
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
              {peerUser.displayName}
            </span>
            <span style={{ color: 'var(--accent-whatsapp)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              {formatTime(durationSeconds)}
            </span>
          </div>
        </div>

        {/* Mini Controls Footer */}
        <div 
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(11, 20, 26, 0.95)',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={toggleMute}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: isMuted ? 'rgba(234, 134, 143, 0.25)' : 'rgba(255,255,255,0.1)',
              color: isMuted ? '#ea868f' : '#fff'
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          <button 
            onClick={toggleCallMinimize}
            style={{
              padding: '6px 12px',
              borderRadius: '14px',
              background: 'rgba(0, 168, 132, 0.2)',
              color: 'var(--accent-whatsapp)',
              fontSize: '0.725rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Maximize call"
          >
            <Maximize2 size={13} /> Expand
          </button>

          <button 
            onClick={endCall}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: 'rgba(234, 134, 143, 0.3)',
              color: '#ea868f'
            }}
            title="End Call"
          >
            <PhoneOff size={15} />
          </button>
        </div>
      </div>
    );
  }

  // 2. INCOMING CALL SCREEN (with accept/decline buttons and audible ringing)
  if (status === 'ringing_incoming') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(6, 11, 20, 0.92)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '520px',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          border: isHighDeepfakeRisk ? '1.5px solid rgba(244, 63, 94, 0.6)' : '1.5px solid rgba(0, 168, 132, 0.35)',
          borderRadius: '24px',
          position: 'relative'
        }}>
          {/* Header Pill */}
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: isHighDeepfakeRisk ? '#f43f5e' : 'var(--accent-whatsapp)',
            background: isHighDeepfakeRisk ? 'rgba(244, 63, 94, 0.15)' : 'rgba(0, 168, 132, 0.15)',
            padding: '6px 14px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
            {isVideo ? 'Incoming HD Video Call...' : 'Incoming E2EE Voice Call...'}
          </div>

          {/* Pulsing Avatar */}
          <div style={{ position: 'relative', margin: '8px 0' }}>
            <div style={{
              position: 'absolute',
              inset: '-14px',
              borderRadius: '50%',
              border: `2px solid ${isHighDeepfakeRisk ? '#f43f5e' : 'var(--accent-whatsapp)'}`,
              opacity: 0.6,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <img 
              src={peerUser.avatar} 
              alt={peerUser.displayName} 
              style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${isHighDeepfakeRisk ? '#f43f5e' : 'var(--accent-whatsapp)'}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
            />
            {isHighDeepfakeRisk && (
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                padding: '6px',
                borderRadius: '50%',
                background: '#f43f5e',
                color: '#fff',
                boxShadow: '0 0 12px rgba(244, 63, 94, 0.8)'
              }} title="High Synthetic Deepfake Warning">
                <ShieldAlert size={20} />
              </div>
            )}
          </div>

          {/* Caller Details */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
              {peerUser.displayName}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              {peerUser.phoneNumber}
            </p>
          </div>

          {/* Trust Context Card */}
          {trustContext && (
            <div style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Caller Trust & Origin
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '10px',
                  background: trustContext.trustScore > 60 ? 'rgba(0, 168, 132, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  color: trustContext.trustScore > 60 ? 'var(--accent-whatsapp)' : '#f43f5e'
                }}>
                  Trust Score: {trustContext.trustScore}/100
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Network size={14} style={{ color: 'var(--accent-whatsapp)' }} />
                  <span>Degree: <strong>{trustContext.connectionDegree === 1 ? 'Direct' : '2nd Degree'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span>Origin: <strong>{trustContext.country}</strong></span>
                </div>
              </div>

              {isHighDeepfakeRisk && (
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fca5a5',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0, color: '#f43f5e' }} />
                  <span><strong>AI Deepfake Flag:</strong> Video/voice stream has {deepfakeRiskScore}% synthetic risk score.</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons: Accept & Decline */}
          <div style={{ display: 'flex', gap: '20px', width: '100%', marginTop: '8px' }}>
            <button
              onClick={declineCall}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '16px',
                background: 'rgba(244, 63, 94, 0.18)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#f43f5e',
                fontWeight: 700,
                fontSize: '0.925rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <PhoneOff size={18} /> Decline
            </button>

            <button
              onClick={acceptCall}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00a884 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.925rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 168, 132, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <Phone size={18} /> Accept Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. OUTGOING RINGING SCREEN
  if (status === 'ringing_outgoing') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(6, 11, 20, 0.94)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          border: '1px solid rgba(0, 168, 132, 0.3)',
          borderRadius: '24px'
        }}>
          <div style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--accent-whatsapp)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-whatsapp)' }} />
            Ringing {peerUser.displayName}...
          </div>

          <div style={{ position: 'relative', margin: '12px 0' }}>
            <div style={{
              position: 'absolute',
              inset: '-16px',
              borderRadius: '50%',
              border: '2px solid var(--accent-whatsapp)',
              opacity: 0.5,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <img 
              src={peerUser.avatar} 
              alt={peerUser.displayName} 
              style={{
                width: '108px',
                height: '108px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-whatsapp)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>
              {peerUser.displayName}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              End-to-End Encrypted WebRTC Session Establishing...
            </p>
          </div>

          {/* Quick Mute / Video Toggles while ringing */}
          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              onClick={toggleMute}
              style={{
                padding: '12px',
                borderRadius: '50%',
                background: isMuted ? 'rgba(234, 134, 143, 0.25)' : 'rgba(255,255,255,0.08)',
                color: isMuted ? '#ea868f' : '#fff'
              }}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={toggleCamera}
              style={{
                padding: '12px',
                borderRadius: '50%',
                background: !isCameraOn ? 'rgba(234, 134, 143, 0.25)' : 'rgba(255,255,255,0.08)',
                color: !isCameraOn ? '#ea868f' : '#fff'
              }}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {!isCameraOn ? <VideoOff size={20} /> : <Video size={20} />}
            </button>
          </div>

          {/* End / Cancel Call Button */}
          <button
            onClick={endCall}
            style={{
              padding: '14px 32px',
              borderRadius: '20px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#f43f5e',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px'
            }}
          >
            <PhoneOff size={18} /> Cancel Call
          </button>
        </div>
      </div>
    );
  }

  // 4. CONNECTED REAL-TIME ACTIVE CALL SCREEN
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: '#04070e',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      {/* MAIN VIDEO STAGE */}
      <div style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
        overflow: 'hidden'
      }}>
        {/* Remote Video Stream (Main View) */}
        {remoteStream && (
          <video 
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              inset: 0
            }}
          />
        )}

        {/* Fallback if remote video is disabled / audio-only */}
        {!remoteStream && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            zIndex: 2
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: '-12px',
                borderRadius: '50%',
                border: '2px solid var(--accent-whatsapp)',
                opacity: 0.4,
                animation: 'pulse 2.5s infinite'
              }} />
              <img 
                src={peerUser.avatar} 
                alt={peerUser.displayName} 
                style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--accent-whatsapp)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
                }}
              />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              {peerUser.displayName}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-whatsapp)', fontWeight: 600 }}>
              Audio Streaming • Connected
            </span>
          </div>
        )}

        {/* FLOATING LOCAL SELF-VIEW (Picture-in-Picture) */}
        <div 
          style={{
            position: 'absolute',
            top: pipPosition.includes('top') ? '24px' : 'auto',
            bottom: pipPosition.includes('bottom') ? '100px' : 'auto',
            right: pipPosition.includes('right') ? '24px' : 'auto',
            left: pipPosition.includes('left') ? '24px' : 'auto',
            width: isSelfViewEnlarged ? '320px' : '200px',
            height: isSelfViewEnlarged ? '240px' : '140px',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
            border: '2px solid rgba(0, 168, 132, 0.6)',
            background: '#0a0f1d',
            zIndex: 10,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'pointer'
          }}
          onClick={() => setIsSelfViewEnlarged(!isSelfViewEnlarged)}
          title="Click to toggle self-view size"
        >
          {isCameraOn && localStream ? (
            <video 
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)' // Mirror flip for natural self-view
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111b27',
              color: 'var(--text-secondary)',
              gap: '6px'
            }}>
              <VideoOff size={24} style={{ color: '#ea868f' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>Camera Off</span>
            </div>
          )}

          {/* Self-view Badge Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            background: 'rgba(0,0,0,0.65)',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span>You</span>
            {isMuted && <MicOff size={10} style={{ color: '#ea868f' }} />}
            {isScreenSharing && <Monitor size={10} style={{ color: 'var(--accent-whatsapp)' }} />}
          </div>
        </div>

        {/* TOP FLOATING HEADS-UP DISPLAY (HUD) */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '24px',
          right: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 8,
          pointerEvents: 'none'
        }}>
          {/* Peer Info & Duration Timer */}
          <div style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(16px)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}>
            <img 
              src={peerUser.avatar} 
              alt={peerUser.displayName} 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                  {peerUser.displayName}
                </span>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-whatsapp)',
                  boxShadow: '0 0 8px var(--accent-whatsapp)'
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-whatsapp)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {formatTime(durationSeconds)}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} style={{ color: 'var(--accent-whatsapp)' }} /> E2EE
                </span>
              </div>
            </div>
          </div>

          {/* Quality Stats & Trust Inspection Badge */}
          <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            {/* Live WebRTC Connection Quality */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(16px)',
              padding: '6px 14px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.75rem',
              color: '#fff'
            }}>
              <Activity size={14} style={{ color: 'var(--accent-whatsapp)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-whatsapp)', fontWeight: 700 }}>
                {callQuality?.latencyMs || 14}ms
              </span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {isVideo ? (callQuality?.resolution || '720p') : 'Audio'} ({callQuality?.fps || 30}fps)
              </span>
            </div>

            {/* AI Deepfake & Trust Score Inspector Pill */}
            {trustContext && (
              <div 
                onClick={() => setShowTrustDetails(!showTrustDetails)}
                style={{
                  background: isHighDeepfakeRisk ? 'rgba(244, 63, 94, 0.85)' : 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(16px)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: isHighDeepfakeRisk ? '1px solid #f43f5e' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {isHighDeepfakeRisk ? <ShieldAlert size={14} /> : <ShieldCheck size={14} style={{ color: 'var(--accent-whatsapp)' }} />}
                <span>AI Risk: {deepfakeRiskScore}%</span>
                {showTrustDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </div>
            )}

            {/* Expanded Trust Details Popover */}
            {showTrustDetails && trustContext && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(20px)',
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
                width: '240px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#fff',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Trust Score</span>
                  <strong style={{ color: 'var(--accent-whatsapp)' }}>{trustContext.trustScore}/100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Network Degree</span>
                  <strong>{trustContext.connectionDegree === 1 ? '1st Degree' : '2nd Degree'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Origin</span>
                  <strong>{trustContext.country}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mutual Contacts</span>
                  <strong>{trustContext.mutualContactsCount}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FLOATING GLASS CONTROL DOCK */}
      <div style={{
        padding: '20px 24px 32px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to top, rgba(4, 7, 14, 0.95) 0%, rgba(4, 7, 14, 0.4) 70%, transparent 100%)',
        zIndex: 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          padding: '12px 24px',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)'
        }}>
          {/* Mute / Unmute Button */}
          <button
            onClick={toggleMute}
            style={{
              padding: '14px',
              borderRadius: '50%',
              background: isMuted ? 'rgba(234, 134, 143, 0.3)' : 'rgba(255,255,255,0.08)',
              color: isMuted ? '#ea868f' : '#fff',
              border: isMuted ? '1px solid #ea868f' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Camera On / Off Button */}
          <button
            onClick={toggleCamera}
            style={{
              padding: '14px',
              borderRadius: '50%',
              background: !isCameraOn ? 'rgba(234, 134, 143, 0.3)' : 'rgba(255,255,255,0.08)',
              color: !isCameraOn ? '#ea868f' : '#fff',
              border: !isCameraOn ? '1px solid #ea868f' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {!isCameraOn ? <VideoOff size={22} /> : <Video size={22} />}
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            style={{
              padding: '14px',
              borderRadius: '50%',
              background: isScreenSharing ? 'rgba(0, 168, 132, 0.3)' : 'rgba(255,255,255,0.08)',
              color: isScreenSharing ? 'var(--accent-whatsapp)' : '#fff',
              border: isScreenSharing ? '1px solid var(--accent-whatsapp)' : '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
          >
            <Monitor size={22} />
          </button>

          {/* Minimize to PiP Widget */}
          <button
            onClick={toggleCallMinimize}
            style={{
              padding: '14px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Minimize call to Picture-in-Picture"
          >
            <Minimize2 size={22} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            style={{
              padding: '14px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <Maximize2 size={22} />
          </button>

          {/* END CALL BUTTON */}
          <button
            onClick={endCall}
            style={{
              padding: '14px 28px',
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 24px rgba(244, 63, 94, 0.5)',
              transition: 'all 0.2s ease',
              marginLeft: '8px'
            }}
            title="End Call"
          >
            <PhoneOff size={20} /> End Call
          </button>
        </div>
      </div>
    </div>
  );
};
