import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.messageHandlers = new Map();
    this.typingHandlers = new Map();
  }

  connect(userId) {
    this.socket = io('http://localhost:3000', {
      auth: { userId },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('message', (data) => {
      const handler = this.messageHandlers.get(data.senderId);
      if (handler) {
        handler(data);
      }
    });

    this.socket.on('typing', (data) => {
      const handler = this.typingHandlers.get(data.senderId);
      if (handler) {
        handler(data.isTyping);
      }
    });

    this.socket.on('delivery_confirmation', (messageId) => {
      // Handle delivery confirmation
      console.log('Message delivered:', messageId);
    });

    this.socket.on('read_receipt', (messageId) => {
      // Handle read receipt
      console.log('Message read:', messageId);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(userId, recipientId) {
    if (this.socket) {
      this.socket.emit('join_chat', { userId, recipientId });
    }
  }

  leaveChat(userId, recipientId) {
    if (this.socket) {
      this.socket.emit('leave_chat', { userId, recipientId });
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('message', messageData);
    }
  }

  sendTyping(recipientId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { recipientId, isTyping });
    }
  }

  sendDeliveryConfirmation(messageId) {
    if (this.socket) {
      this.socket.emit('delivery_confirmation', messageId);
    }
  }

  sendReadReceipt(messageId) {
    if (this.socket) {
      this.socket.emit('read_receipt', messageId);
    }
  }

  onMessage(senderId, handler) {
    this.messageHandlers.set(senderId, handler);
  }

  onTyping(senderId, handler) {
    this.typingHandlers.set(senderId, handler);
  }

  onNewMessage(handler) {
    if (this.socket) {
      this.socket.on('new_message', handler);
    }
  }

  // Group chat methods
  joinGroupChat(groupId) {
    if (this.socket) {
      this.socket.emit('join_group', { groupId });
    }
  }

  leaveGroupChat(groupId) {
    if (this.socket) {
      this.socket.emit('leave_group', { groupId });
    }
  }

  sendGroupMessage(messageData) {
    if (this.socket) {
      this.socket.emit('group_message', messageData);
    }
  }

  onGroupMessage(groupId, handler) {
    if (this.socket) {
      this.socket.on(`group_message_${groupId}`, handler);
    }
  }

  onGroupTyping(groupId, handler) {
    if (this.socket) {
      this.socket.on(`group_typing_${groupId}`, handler);
    }
  }

  addGroupMember(groupId, phoneNumber) {
    if (this.socket) {
      this.socket.emit('add_group_member', { groupId, phoneNumber });
    }
  }

  // User status methods
  requestUserStatus(userId) {
    if (this.socket) {
      this.socket.emit('request_user_status', userId);
    }
  }

  onUserStatus(userId, handler) {
    if (this.socket) {
      this.socket.on(`user_status_${userId}`, handler);
    }
  }

  offMessage(senderId) {
    this.messageHandlers.delete(senderId);
  }

  offTyping(senderId) {
    this.typingHandlers.delete(senderId);
  }

  offGroupMessage(groupId) {
    if (this.socket) {
      this.socket.off(`group_message_${groupId}`);
    }
  }

  offGroupTyping(groupId) {
    if (this.socket) {
      this.socket.off(`group_typing_${groupId}`);
    }
  }

  offUserStatus(userId) {
    if (this.socket) {
      this.socket.off(`user_status_${userId}`);
    }
  }
}

export default new SocketService();