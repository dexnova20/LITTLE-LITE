import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useApp } from '../utils/AppContext';
import { AuthService } from '../services/AuthService';
import { CryptoService } from '../services/CryptoService';

export default function AuthScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const { dispatch } = useApp();

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await AuthService.sendOTP(phoneNumber);
      setStep('otp');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.verifyOTP(phoneNumber, otp);
      const keys = await CryptoService.generateKeyPair();
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_KEYS', payload: keys });
      
      navigation.replace('ChatList');
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Little Messenger</Text>
        <Text style={styles.subtitle}>
          {step === 'phone' 
            ? 'Enter your phone number to get started' 
            : 'Enter the verification code sent to your phone'
          }
        </Text>

        {step === 'phone' ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+1 234 567 8900"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              autoFocus
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send Code'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setStep('phone')}
            >
              <Text style={styles.backButtonText}>Change Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#ffffff',
    backgroundColor: '#2a2a2a',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#555555',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});