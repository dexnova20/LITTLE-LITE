const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { initializeDatabase } = require('./database/init');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
const activeUsers = new Map();
const chatRooms = new Map();
const groupRooms = new Map();
const userStatus = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Update user status
    userStatus.set(userId, {
      isOnline: true,
      lastSeen: Date.now(),
      socketId: socket.id
    });
    
    // Broadcast status to contacts
    broadcastUserStatus(userId);
  });

  socket.on('join_chat', ({ userId, recipientId }) => {
    const roomId = [userId, recipientId].sort().join('-');
    socket.join(roomId);
    
    if (!chatRooms.has(roomId)) {
      chatRooms.set(roomId, new Set());
    }
    chatRooms.get(roomId).add(userId);
  });

  socket.on('leave_chat', ({ userId, recipientId }) => {
    const roomId = [userId, recipientId].sort().join('-');
    socket.leave(roomId);
    
    if (chatRooms.has(roomId)) {
      chatRooms.get(roomId).delete(userId);
      if (chatRooms.get(roomId).size === 0) {
        chatRooms.delete(roomId);
      }
    }
  });

  socket.on('message', (messageData) => {
    const { recipientId } = messageData;
    const roomId = [socket.userId, recipientId].sort().join('-');
    
    // Broadcast to room (excluding sender)
    socket.to(roomId).emit('message', {
      ...messageData,
      senderId: socket.userId
    });

    // Store message metadata (not content for privacy)
    storeMessageMetadata(messageData);
  });

  // Group chat events
  socket.on('join_group', ({ groupId }) => {
    socket.join(`group_${groupId}`);
    if (!groupRooms.has(groupId)) {
      groupRooms.set(groupId, new Set());
    }
    groupRooms.get(groupId).add(socket.userId);
  });

  socket.on('leave_group', ({ groupId }) => {
    socket.leave(`group_${groupId}`);
    if (groupRooms.has(groupId)) {
      groupRooms.get(groupId).delete(socket.userId);
    }
  });

  socket.on('group_message', (messageData) => {
    const { groupId } = messageData;
    socket.to(`group_${groupId}`).emit(`group_message_${groupId}`, {
      ...messageData,
      senderId: socket.userId
    });
  });

  socket.on('add_group_member', ({ groupId, phoneNumber }) => {
    // Add member logic here
    socket.to(`group_${groupId}`).emit('member_added', { phoneNumber });
  });

  // User status events
  socket.on('request_user_status', (userId) => {
    const status = userStatus.get(userId) || { isOnline: false, lastSeen: null };
    socket.emit(`user_status_${userId}`, status);
  });

  socket.on('typing', ({ recipientId, isTyping }) => {
    const roomId = [socket.userId, recipientId].sort().join('-');
    socket.to(roomId).emit('typing', {
      senderId: socket.userId,
      isTyping
    });
  });

  socket.on('delivery_confirmation', (messageId) => {
    // Handle delivery confirmation
    console.log('Delivery confirmed for message:', messageId);
  });

  socket.on('read_receipt', (messageId) => {
    // Handle read receipt
    console.log('Read receipt for message:', messageId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      
      // Update user status to offline
      userStatus.set(socket.userId, {
        isOnline: false,
        lastSeen: Date.now(),
        socketId: null
      });
      
      // Broadcast offline status
      broadcastUserStatus(socket.userId);
    }
  });
});

// Store only message metadata for delivery tracking
function storeMessageMetadata(messageData) {
  // In production, store in Redis or database
  // Only store: messageId, senderId, recipientId, timestamp, deliveryStatus
  // NEVER store message content for privacy
  console.log('Storing message metadata:', {
    id: messageData.id,
    senderId: messageData.senderId || 'unknown',
    recipientId: messageData.recipientId,
    timestamp: messageData.timestamp,
    type: messageData.type || 'text',
    disappearAt: messageData.disappearAt
  });
}

// Broadcast user status to their contacts
function broadcastUserStatus(userId) {
  const status = userStatus.get(userId);
  if (status) {
    // In production, get user's contacts from database
    // For now, broadcast to all active users
    activeUsers.forEach((socketId, contactId) => {
      if (contactId !== userId) {
        io.to(socketId).emit(`user_status_${userId}`, {
          isOnline: status.isOnline,
          lastSeen: status.lastSeen
        });
      }
    });
  }
}

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Little Messenger server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();