import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { ContactService } from '../services/ContactService';

export default function PrivacySettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    allowContactSync: false,
    shareMyNumber: false,
    findMeByNumber: true,
    lastSeenPrivacy: 'everyone'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'Privacy Settings',
      headerStyle: { backgroundColor: '#1a1a1a' },
      headerTintColor: '#ffffff'
    });
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await ContactService.updatePrivacySettings(settings);
      Alert.alert('Success', 'Privacy settings updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
    setLoading(false);
  };

  const showLastSeenOptions = () => {
    const options = ['everyone', 'contacts', 'nobody'];
    const labels = ['Everyone', 'My Contacts', 'Nobody'];
    
    Alert.alert('Last Seen Privacy', 'Who can see when you were last online?', 
      options.map((option, index) => ({
        text: labels[index],
        onPress: () => updateSetting('lastSeenPrivacy', option)
      }))
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Discovery</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Sync Contacts</Text>
            <Text style={styles.settingDescription}>
              Allow Little to access your contacts to find friends
            </Text>
          </View>
          <Switch
            value={settings.allowContactSync}
            onValueChange={(value) => updateSetting('allowContactSync', value)}
            trackColor={{ false: '#333333', true: '#007AFF' }}
            thumbColor={settings.allowContactSync ? '#ffffff' : '#cccccc'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Share My Number</Text>
            <Text style={styles.settingDescription}>
              Let others find you by your phone number
            </Text>
          </View>
          <Switch
            value={settings.shareMyNumber}
            onValueChange={(value) => updateSetting('shareMyNumber', value)}
            trackColor={{ false: '#333333', true: '#007AFF' }}
            thumbColor={settings.shareMyNumber ? '#ffffff' : '#cccccc'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Find Me By Number</Text>
            <Text style={styles.settingDescription}>
              Allow others to find you using your phone number
            </Text>
          </View>
          <Switch
            value={settings.findMeByNumber}
            onValueChange={(value) => updateSetting('findMeByNumber', value)}
            trackColor={{ false: '#333333', true: '#007AFF' }}
            thumbColor={settings.findMeByNumber ? '#ffffff' : '#cccccc'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Online Status</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={showLastSeenOptions}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Last Seen</Text>
            <Text style={styles.settingDescription}>
              Who can see when you were last online
            </Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>
              {settings.lastSeenPrivacy === 'everyone' ? 'Everyone' :
               settings.lastSeenPrivacy === 'contacts' ? 'My Contacts' : 'Nobody'}
            </Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>End-to-End Encryption</Text>
          <Text style={styles.infoDescription}>
            All your messages are secured with end-to-end encryption. 
            Only you and the recipient can read them.
          </Text>
          <Text style={styles.infoStatus}>✓ Always Enabled</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoTitle}>Zero Server Storage</Text>
          <Text style={styles.infoDescription}>
            Your messages are never stored on our servers. 
            They exist only on your device and during transmission.
          </Text>
          <Text style={styles.infoStatus}>✓ Always Enabled</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={saveSettings}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 18,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
  },
  arrow: {
    fontSize: 18,
    color: '#666666',
  },
  infoItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 18,
    marginBottom: 8,
  },
  infoStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#555555',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});