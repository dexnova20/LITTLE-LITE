import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';
import { AuthService } from './AuthService';

export class ContactService {
  static async requestPermission() {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Contact permission error:', error);
      return false;
    }
  }

  static async syncContacts(userControlledOptions = {}) {
    const {
      allowSync = false,
      shareMyNumber = false,
      findMeByNumber = false
    } = userControlledOptions;

    if (!allowSync) {
      return { contacts: [], synced: false };
    }

    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Contact access is required for syncing');
        return { contacts: [], synced: false };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      // Extract phone numbers and check which ones are registered
      const phoneNumbers = [];
      data.forEach(contact => {
        if (contact.phoneNumbers) {
          contact.phoneNumbers.forEach(phone => {
            const cleanNumber = this.cleanPhoneNumber(phone.number);
            if (cleanNumber) {
              phoneNumbers.push({
                name: contact.name,
                phoneNumber: cleanNumber,
                contactId: contact.id
              });
            }
          });
        }
      });

      // Check which contacts are registered users (privacy-preserving)
      const registeredContacts = await this.checkRegisteredUsers(phoneNumbers);

      return {
        contacts: registeredContacts,
        synced: true,
        totalContacts: phoneNumbers.length,
        registeredCount: registeredContacts.length
      };
    } catch (error) {
      console.error('Contact sync error:', error);
      return { contacts: [], synced: false, error: error.message };
    }
  }

  static async checkRegisteredUsers(contacts) {
    try {
      // Send hashed phone numbers to preserve privacy
      const hashedContacts = contacts.map(contact => ({
        ...contact,
        hashedNumber: this.hashPhoneNumber(contact.phoneNumber)
      }));

      const response = await fetch('http://localhost:3000/api/users/check-batch', {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({ hashedNumbers: hashedContacts.map(c => c.hashedNumber) })
      });

      const result = await response.json();
      
      // Match results back to original contacts
      const registeredContacts = [];
      hashedContacts.forEach((contact, index) => {
        if (result.registered[index]) {
          registeredContacts.push({
            name: contact.name,
            phoneNumber: contact.phoneNumber,
            isRegistered: true,
            lastSeen: result.lastSeen[index]
          });
        }
      });

      return registeredContacts;
    } catch (error) {
      console.error('Batch check error:', error);
      return [];
    }
  }

  static cleanPhoneNumber(phoneNumber) {
    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Basic validation
    if (cleaned.length < 10) return null;
    
    // Add country code if missing
    if (!cleaned.startsWith('+')) {
      return '+1' + cleaned; // Default to US
    }
    
    return cleaned;
  }

  static hashPhoneNumber(phoneNumber) {
    // Simple hash for privacy (in production, use proper cryptographic hash)
    let hash = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
      const char = phoneNumber.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  static async updatePrivacySettings(settings) {
    try {
      const response = await fetch('http://localhost:3000/api/users/privacy', {
        method: 'PUT',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      return await response.json();
    } catch (error) {
      console.error('Privacy settings update error:', error);
      throw error;
    }
  }
}