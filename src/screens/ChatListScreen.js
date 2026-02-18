import React, { useState, useEffect } from 'react';
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
import { AuthService } from '../services/AuthService';
import { SocketService } from '../services/SocketService';
import { ContactService } from '../services/ContactService';

export default function ChatListScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [syncedContacts, setSyncedContacts] = useState(false);
  const { state, dispatch } = useApp();

  useEffect(() => {
    SocketService.connect(state.user.id);
    dispatch({ type: 'SET_SOCKET', payload: SocketService.socket });

    SocketService.onNewMessage((message) => {
      console.log('New message received:', message);
    });

    loadContacts();

    return () => {
      SocketService.disconnect();
    };
  }, []);

  const loadContacts = async () => {
    try {
      const result = await ContactService.syncContacts({
        allowSync: true,
        shareMyNumber: false,
        findMeByNumber: true
      });
      
      if (result.synced) {
        setContacts(result.contacts);
        setSyncedContacts(true);
      }
    } catch (error) {
      console.log('Contact sync failed:', error);
    }
  };

  const handleStartChat = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const userExists = await AuthService.checkUserExists(phoneNumber);
      
      if (userExists.exists) {
        navigation.navigate('Chat', { 
          recipientPhone: phoneNumber,
          recipientId: userExists.userId 
        });
      } else {
        Alert.alert(
          'User Not Found', 
          'This phone number is not registered with Little Messenger.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check user. Please try again.');
    }
    
    setLoading(false);
    setPhoneNumber('');
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedContacts.length === 0) {
      Alert.alert('Error', 'Please enter group name and select contacts');
      return;
    }

    try {
      const groupId = Date.now().toString();
      const members = selectedContacts.map(c => c.phoneNumber);
      
      navigation.navigate('GroupChat', {
        groupId,
        groupName: groupName.trim(),
        members
      });
      
      setShowGroupModal(false);
      setGroupName('');
      setSelectedContacts([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const toggleContactSelection = (contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.phoneNumber === contact.phoneNumber);
      if (isSelected) {
        return prev.filter(c => c.phoneNumber !== contact.phoneNumber);
      } else {
        return [...prev, contact];
      }
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { 
        recipientPhone: item.phone,
        recipientId: item.id 
      })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.phone.slice(-2)}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.phone}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Little Messenger</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('PrivacySettings')}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.groupButton}
            onPress={() => setShowGroupModal(true)}
          >
            <Text style={styles.groupButtonText}>+ Group</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.newChatContainer}>
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number to chat"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
        />
        <TouchableOpacity 
          style={[styles.startChatButton, loading && styles.buttonDisabled]}
          onPress={handleStartChat}
          disabled={loading}
        >
          <Text style={styles.startChatText}>
            {loading ? '...' : 'Chat'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No chats yet</Text>
            <Text style={styles.emptySubtext}>
              Enter a phone number above to start messaging
            </Text>
            {syncedContacts && contacts.length > 0 && (
              <View style={styles.contactsSection}>
                <Text style={styles.contactsTitle}>Your Contacts on Little:</Text>
                {contacts.slice(0, 3).map(contact => (
                  <TouchableOpacity 
                    key={contact.phoneNumber}
                    style={styles.contactItem}
                    onPress={() => {
                      navigation.navigate('Chat', {
                        recipientPhone: contact.phoneNumber,
                        recipientId: contact.phoneNumber
                      });
                    }}
                  >
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        }
      />

      <Modal visible={showGroupModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Group</Text>
            
            <TextInput
              style={styles.modalInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
              placeholderTextColor="#666"
            />
            
            <Text style={styles.contactsLabel}>Select Contacts:</Text>
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.phoneNumber}
              style={styles.contactsList}
              renderItem={({ item }) => {
                const isSelected = selectedContacts.find(c => c.phoneNumber === item.phoneNumber);
                return (
                  <TouchableOpacity 
                    style={[styles.contactSelectItem, isSelected && styles.selectedContact]}
                    onPress={() => toggleContactSelection(item)}
                  >
                    <Text style={styles.contactSelectName}>{item.name}</Text>
                    <Text style={styles.contactSelectPhone}>{item.phoneNumber}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowGroupModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton} 
                onPress={createGroupChat}
              >
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  settingsButtonText: {
    fontSize: 16,
  },
  groupButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  groupButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  newChatContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
    marginRight: 12,
  },
  startChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#555555',
  },
  startChatText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#888888',
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },
  contactsSection: {
    marginTop: 30,
    width: '100%',
  },
  contactsTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  contactItem: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  contactPhone: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    marginBottom: 16,
  },
  contactsLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  contactSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#1a1a1a',
  },
  selectedContact: {
    backgroundColor: '#007AFF20',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  contactSelectName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  contactSelectPhone: {
    color: '#888888',
    fontSize: 12,
    marginRight: 8,
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#666666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cancelText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  createText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
});