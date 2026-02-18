import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal
} from 'react-native';
import { useApp } from '../utils/AppContext';
import { SocketService } from '../services/SocketService';
import { CryptoService } from '../services/CryptoService';
import MessageBubble from '../components/MessageBubble';

export default function GroupChatScreen({ route, navigation }) {
  const { groupId, groupName, members } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const { state } = useApp();
  const flatListRef = useRef();

  useEffect(() => {
    navigation.setOptions({ 
      title: groupName,
      headerRight: () => (
        <TouchableOpacity onPress={() => setShowAddMember(true)}>
          <Text style={styles.addButton}>Add</Text>
        </TouchableOpacity>
      )
    });

    SocketService.joinGroupChat(groupId);
    SocketService.onGroupMessage(groupId, handleIncomingMessage);
    SocketService.onGroupTyping(groupId, handleTypingUpdate);

    return () => {
      SocketService.leaveGroupChat(groupId);
    };
  }, []);

  const handleIncomingMessage = async (encryptedMessage) => {
    try {
      const decryptedText = await CryptoService.decryptMessage(
        encryptedMessage.payload,
        encryptedMessage.groupKey
      );

      const message = {
        id: encryptedMessage.id,
        text: decryptedText,
        timestamp: encryptedMessage.timestamp,
        senderId: encryptedMessage.senderId,
        senderName: encryptedMessage.senderName,
        status: 'delivered'
      };

      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Failed to decrypt group message:', error);
    }
  };

  const handleTypingUpdate = (typingData) => {
    setTypingUsers(typingData.users);
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const messageId = CryptoService.generateMessageId();
    const timestamp = Date.now();

    try {
      const encryptedPayload = await CryptoService.encryptGroupMessage(
        inputText.trim(),
        groupId
      );

      const localMessage = {
        id: messageId,
        text: inputText.trim(),
        timestamp,
        senderId: state.user.id,
        senderName: state.user.phoneNumber,
        status: 'sending'
      };

      setMessages(prev => [...prev, localMessage]);
      setInputText('');

      SocketService.sendGroupMessage({
        id: messageId,
        groupId,
        payload: encryptedPayload,
        timestamp,
        senderName: state.user.phoneNumber
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const addMember = async () => {
    if (!newMemberPhone.trim()) return;

    try {
      await SocketService.addGroupMember(groupId, newMemberPhone);
      setNewMemberPhone('');
      setShowAddMember(false);
      Alert.alert('Success', 'Member added to group');
    } catch (error) {
      Alert.alert('Error', 'Failed to add member');
    }
  };

  const renderMessage = ({ item }) => (
    <View>
      {!item.senderId !== state.user.id && (
        <Text style={styles.senderName}>{item.senderName}</Text>
      )}
      <MessageBubble 
        message={item}
        isOwn={item.senderId === state.user.id}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {typingUsers.length > 0 && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showAddMember} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Member</Text>
            <TextInput
              style={styles.modalInput}
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
              placeholder="Phone number"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddMember(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addMemberButton} onPress={addMember}>
                <Text style={styles.addMemberText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  messagesList: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  senderName: { color: '#888', fontSize: 12, marginLeft: 16, marginBottom: 4 },
  typingIndicator: { paddingHorizontal: 20, paddingVertical: 8 },
  typingText: { color: '#666', fontStyle: 'italic', fontSize: 14 },
  inputContainer: { flexDirection: 'row', padding: 16, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#333' },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', backgroundColor: '#2a2a2a', marginRight: 12 },
  sendButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  addButton: { color: '#007AFF', fontSize: 16, marginRight: 16 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#2a2a2a', padding: 20, borderRadius: 12, width: '80%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', backgroundColor: '#1a1a1a', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: '#666', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flex: 1, marginRight: 8 },
  cancelText: { color: '#fff', textAlign: 'center' },
  addMemberButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flex: 1, marginLeft: 8 },
  addMemberText: { color: '#fff', textAlign: 'center' }
});