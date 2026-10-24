const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
// Attach WebSocket server directly to HTTP server instance
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// In-Memory User Store
const users = {
  'usr_me_001': { id: 'usr_me_001', phone: '+1 202 555 0199', name: 'Elena Rostova', trustScore: 96, reputationTier: 2 },
  'usr_marcus_02': { id: 'usr_marcus_02', phone: '+1 415 555 0142', name: 'Marcus Vance', trustScore: 92, reputationTier: 2 }
};

// 1. Health API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), serverTime: Date.now() });
});

// 2. Auth APIs
app.post('/api/auth/otp/request', (req, res) => {
  const { countryCode, phoneNumber, channel } = req.body;
  const fullPhone = `${countryCode} ${phoneNumber}`.trim();
  res.json({
    success: true,
    sessionToken: `st_${Date.now()}`,
    fullPhone,
    expiresInSeconds: 300,
    message: `OTP dispatched to ${fullPhone}`
  });
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { otpCode } = req.body;
  if (otpCode === '849204' || otpCode?.length === 6) {
    res.json({ success: true, requires2SV: true, authTicket: `ticket_${Date.now()}` });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect code' });
  }
});

app.post('/api/auth/2sv/verify', (req, res) => {
  const { password } = req.body;
  if (password && password.length >= 4) {
    res.json({ success: true, accessToken: `jwt_${Date.now()}`, user: users['usr_me_001'] });
  } else {
    res.status(401).json({ success: false, error: 'Invalid 2SV password' });
  }
});

// Connected Clients and User Mapping
const connectedClients = new Map(); // ws -> { userId, displayName, avatar, socketId }
const userSockets = new Map(); // userId -> Set<ws>

function broadcastOnlineUsers() {
  const onlineUserIds = Array.from(userSockets.keys());
  const payload = JSON.stringify({ event: 'users:online_list', payload: { onlineUserIds } });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function sendToUser(userId, event, payload) {
  const sockets = userSockets.get(userId);
  if (sockets && sockets.size > 0) {
    const msg = JSON.stringify({ event, payload });
    sockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    });
    return true;
  }
  return false;
}

// Pinned Rooms and Messages in-memory cache
const pinnedRooms = new Set(['room_marcus']);
const pinnedMessages = new Map();

// 3. WebSocket Real-Time Gateway with WebRTC Signaling
wss.on('connection', (ws) => {
  const socketId = `sock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  console.log(`[WebSocket Gateway] Client connected: ${socketId}`);

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      const { event, payload } = parsed;

      switch (event) {
        // Register user socket
        case 'signal:register': {
          const { userId, displayName, avatar } = payload || {};
          if (userId) {
            connectedClients.set(ws, { userId, displayName, avatar, socketId });
            if (!userSockets.has(userId)) {
              userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(ws);
            console.log(`[WebSocket Gateway] User registered: ${userId} (${displayName || 'Unknown'})`);
            
            // Send acknowledgement & current online list and pin state
            ws.send(JSON.stringify({
              event: 'signal:registered',
              payload: { 
                socketId, 
                userId, 
                onlineUserIds: Array.from(userSockets.keys()),
                pinnedRoomIds: Array.from(pinnedRooms),
                pinnedMessages: Object.fromEntries(pinnedMessages)
              }
            }));

            broadcastOnlineUsers();
          }
          break;
        }

        // WebRTC: Initiate call (Offer)
        case 'call:initiate': {
          const { toUserId, offerSdp, isVideo, callId, caller } = payload;
          console.log(`[Call Signal] Call initiated by ${caller?.displayName || 'Unknown'} to ${toUserId}`);
          
          const delivered = sendToUser(toUserId, 'call:incoming', {
            callId,
            fromUserId: caller?.id || connectedClients.get(ws)?.userId,
            caller: caller || users[connectedClients.get(ws)?.userId] || { displayName: 'Peer' },
            offerSdp,
            isVideo
          });

          if (!delivered) {
            console.log(`[Call Signal] Recipient ${toUserId} is offline or in solo test mode`);
            ws.send(JSON.stringify({
              event: 'call:user_offline',
              payload: { toUserId, callId, message: 'User is not currently reachable in another active tab.' }
            }));
          }
          break;
        }

        // WebRTC: Accept call (Answer)
        case 'call:accept': {
          const { toUserId, answerSdp, callId } = payload;
          console.log(`[Call Signal] Call ${callId} accepted, relaying answer to ${toUserId}`);
          sendToUser(toUserId, 'call:accepted', {
            callId,
            fromUserId: connectedClients.get(ws)?.userId,
            answerSdp
          });
          break;
        }

        // WebRTC: ICE Candidate exchange
        case 'call:ice_candidate': {
          const { toUserId, candidate, callId } = payload;
          if (toUserId && candidate) {
            sendToUser(toUserId, 'call:ice_candidate', {
              callId,
              fromUserId: connectedClients.get(ws)?.userId,
              candidate
            });
          }
          break;
        }

        // In-call media state updates (mute, camera off, screen share)
        case 'call:media_state': {
          const { toUserId, isMuted, isCameraOn, isScreenSharing, callId } = payload;
          if (toUserId) {
            sendToUser(toUserId, 'call:media_state', {
              callId,
              fromUserId: connectedClients.get(ws)?.userId,
              isMuted,
              isCameraOn,
              isScreenSharing
            });
          }
          break;
        }

        // Reject call
        case 'call:reject': {
          const { toUserId, callId, reason } = payload;
          console.log(`[Call Signal] Call ${callId} rejected for ${toUserId}`);
          if (toUserId) {
            sendToUser(toUserId, 'call:rejected', {
              callId,
              reason: reason || 'declined'
            });
          }
          break;
        }

        // End call
        case 'call:end': {
          const { toUserId, callId } = payload;
          console.log(`[Call Signal] Call ${callId} ended`);
          if (toUserId) {
            sendToUser(toUserId, 'call:ended', { callId });
          }
          break;
        }

        // Chat message relay
        case 'chat:send_message': {
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                event: 'chat:inbound_message',
                payload: payload
              }));
            }
          });
          break;
        }

        // Chat room pin relay (real-time pinning across devices)
        case 'chat:pin_room': {
          const { roomId, isPinned } = payload || {};
          if (roomId) {
            if (isPinned) pinnedRooms.add(roomId);
            else pinnedRooms.delete(roomId);
            console.log(`[Pin Signal] Room ${roomId} pin state: ${isPinned}`);
          }
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                event: 'chat:room_pinned',
                payload: payload
              }));
            }
          });
          break;
        }

        // Chat message pin relay (real-time message pin across devices)
        case 'chat:pin_message': {
          const { roomId, pinnedMessage } = payload || {};
          if (roomId) {
            if (pinnedMessage) pinnedMessages.set(roomId, pinnedMessage);
            else pinnedMessages.delete(roomId);
            console.log(`[Pin Signal] Message in ${roomId} pinned: ${!!pinnedMessage}`);
          }
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                event: 'chat:message_pinned',
                payload: payload
              }));
            }
          });
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('[WebSocket Error]', err);
    }
  });

  ws.on('close', () => {
    const clientData = connectedClients.get(ws);
    if (clientData) {
      const { userId } = clientData;
      console.log(`[WebSocket Gateway] Client disconnected: ${userId} (${socketId})`);
      connectedClients.delete(ws);
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
      broadcastOnlineUsers();
    }
  });

  ws.send(JSON.stringify({ 
    event: 'system:ready', 
    status: 'connected', 
    socketId,
    serverTime: Date.now() 
  }));
});

// Port Fallback Handling
function startServer(port) {
  server.listen(port, () => {
    console.log(`[HumanLink Mobile Backend Server] Listening on http://localhost:${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(4000);
