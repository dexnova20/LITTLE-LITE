import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS
} from 'react-native';
import { useApp } from '../utils/AppContext';
import { SocketService } from '../services/SocketService';
import { CryptoService } from '../services/CryptoService';
import { MediaService } from '../services/MediaService';
import MessageBubble from '../components/MessageBubble';
import MediaBubble from '../components/MediaBubble';

export default function ChatScreen({ route, navigation }) {
  const { recipientPhone, recipientId } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [session, setSession] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [disappearingTimer, setDisappearingTimer] = useState(0);
  const { state } = useApp();
  const flatListRef = useRef();

  useEffect(() => {
    navigation.setOptions({ 
      title: recipientPhone,
      headerStyle: { backgroundColor: '#1a1a1a' },
      headerTintColor: '#ffffff'
    });

    // Establish encryption session
    establishEncryptionSession();

    // Listen for messages
    SocketService.onMessage(recipientId, handleIncomingMessage);
    SocketService.onTyping(recipientId, setRecipientTyping);
    SocketService.onUserStatus(recipientId, handleStatusUpdate);

    // Join chat room
    SocketService.joinChat(state.user.id, recipientId);
    
    // Request user status
    SocketService.requestUserStatus(recipientId);

    return () => {
      SocketService.leaveChat(state.user.id, recipientId);
    };
  }, []);

  const establishEncryptionSession = async () => {
    try {
      // In a real app, you'd exchange keys through the server
      const myKeys = state.keys;
      const theirKeys = await getRecipientKeys(recipientId);
      
      const newSession = await CryptoService.establishSession(myKeys, theirKeys);
      setSession(newSession);
    } catch (error) {
      console.error('Failed to establish encryption session:', error);
    }
  };

  const getRecipientKeys = async (userId) => {
    // Mock recipient keys - in real app, fetch from server
    return {
      identityKey: 'mock_identity_key',
      preKey: 'mock_pre_key',
      signedPreKey: 'mock_signed_pre_key'
    };
  };

  const handleStatusUpdate = (statusData) => {
    setIsOnline(statusData.isOnline);
    setLastSeen(statusData.lastSeen);
  };

  const handleIncomingMessage = async (encryptedMessage) => {
    try {
      if (!session) return;

      let decryptedContent;
      if (encryptedMessage.type === 'media') {
        decryptedContent = await MediaService.decryptMedia(
          encryptedMessage.payload,
          session.messageKey
        );
      } else {
        decryptedContent = await CryptoService.decryptMessage(
          encryptedMessage.payload, 
          session.messageKey
        );
      }

      const message = {
        id: encryptedMessage.id,
        text: encryptedMessage.type === 'text' ? decryptedContent : null,
        media: encryptedMessage.type === 'media' ? decryptedContent : null,
        type: encryptedMessage.type || 'text',
        timestamp: encryptedMessage.timestamp,
        senderId: encryptedMessage.senderId,
        status: 'delivered',
        disappearAt: encryptedMessage.disappearAt
      };

      setMessages(prev => [...prev, message]);
      
      // Set disappearing timer if applicable
      if (message.disappearAt) {
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== message.id));
        }, message.disappearAt - Date.now());
      }
      
      // Rotate keys for forward secrecy
      const newSession = await CryptoService.rotateKeys(session);
      setSession(newSession);

      // Send delivery confirmation
      SocketService.sendDeliveryConfirmation(encryptedMessage.id);
      
      // Send read receipt when message is viewed
      setTimeout(() => {
        SocketService.sendReadReceipt(encryptedMessage.id);
        setMessages(prev => prev.map(msg => 
          msg.id === encryptedMessage.id ? { ...msg, status: 'read' } : msg
        ));
      }, 1000);
    } catch (error) {
      console.error('Failed to decrypt message:', error);
    }
  };

  const sendMessage = async (messageType = 'text', mediaData = null) => {
    if ((!inputText.trim() && !mediaData) || !session) return;

    const messageId = CryptoService.generateMessageId();
    const timestamp = Date.now();
    const disappearAt = disappearingTimer > 0 ? timestamp + (disappearingTimer * 1000) : null;

    try {
      let encryptedPayload;
      let localMessage;

      if (messageType === 'media' && mediaData) {
        const encryptedMedia = await MediaService.encryptMedia(mediaData, session.messageKey);
        encryptedPayload = encryptedMedia;
        
        localMessage = {
          id: messageId,
          media: mediaData,
          type: 'media',
          timestamp,
          senderId: state.user.id,
          status: 'sending',
          disappearAt
        };
      } else {
        encryptedPayload = await CryptoService.encryptMessage(
          inputText.trim(), 
          session.messageKey
        );
        
        localMessage = {
          id: messageId,
          text: inputText.trim(),
          type: 'text',
          timestamp,
          senderId: state.user.id,
          status: 'sending',
          disappearAt
        };
      }

      setMessages(prev => [...prev, localMessage]);
      setInputText('');

      // Set disappearing timer
      if (disappearAt) {
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== messageId));
        }, disappearingTimer * 1000);
      }

      // Send encrypted message
      SocketService.sendMessage({
        id: messageId,
        recipientId,
        type: messageType,
        payload: encryptedPayload,
        timestamp,
        disappearAt
      });

      // Rotate keys for forward secrecy
      const newSession = await CryptoService.rotateKeys(session);
      setSession(newSession);

      // Update message status
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        ));
      }, 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const showMediaOptions = () => {
    const options = ['Cancel', 'Photo', 'Video', 'Document'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            const media = await MediaService.pickImage();
            if (media) sendMessage('media', media);
          } else if (buttonIndex === 2) {
            const media = await MediaService.pickVideo();
            if (media) sendMessage('media', media);
          } else if (buttonIndex === 3) {
            const media = await MediaService.pickDocument();
            if (media) sendMessage('media', media);
          }
        }
      );
    } else {
      Alert.alert('Share Media', 'Choose media type', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Photo', onPress: async () => {
          const media = await MediaService.pickImage();
          if (media) sendMessage('media', media);
        }},
        { text: 'Video', onPress: async () => {
          const media = await MediaService.pickVideo();
          if (media) sendMessage('media', media);
        }},
        { text: 'Document', onPress: async () => {
          const media = await MediaService.pickDocument();
          if (media) sendMessage('media', media);
        }}
      ]);
    }
  };

  const toggleDisappearingMessages = () => {
    const timers = [0, 5, 30, 300, 3600]; // Off, 5s, 30s, 5m, 1h
    const labels = ['Off', '5 seconds', '30 seconds', '5 minutes', '1 hour'];
    
    Alert.alert('Disappearing Messages', 'Choose timer', 
      timers.map((timer, index) => ({
        text: labels[index],
        onPress: () => setDisappearingTimer(timer)
      }))
    );
  };

  const handleTyping = (text) => {
    setInputText(text);
    
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      SocketService.sendTyping(recipientId, true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      SocketService.sendTyping(recipientId, false);
    }
  };

  const renderMessage = ({ item }) => {
    if (item.type === 'media') {
      return (
        <MediaBubble 
          message={item}
          isOwn={item.senderId === state.user.id}
        />
      );
    }
    return (
      <MessageBubble 
        message={item}
        isOwn={item.senderId === state.user.id}
      />
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          {isOnline ? 'Online' : lastSeen ? `Last seen ${new Date(lastSeen).toLocaleTimeString()}` : 'Offline'}
        </Text>
        <TouchableOpacity onPress={toggleDisappearingMessages}>
          <Text style={styles.timerText}>
            {disappearingTimer > 0 ? `🕐 ${disappearingTimer}s` : '🕐'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {recipientTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Typing...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={showMediaOptions}>
          <Text style={styles.mediaButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  statusText: {
    color: '#888888',
    fontSize: 12,
  },
  timerText: {
    color: '#007AFF',
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  typingIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    color: '#666666',
    fontStyle: 'italic',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  mediaButton: {
    backgroundColor: '#2a2a2a',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  mediaButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#555555',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});