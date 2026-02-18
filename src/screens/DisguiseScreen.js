import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { AIService } from '../services/AIService';

export default function DisguiseScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm Little, your intelligent assistant. How can I help you today?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Check for secret phrase
    if (inputText.trim() === '0302') {
      navigation.navigate('Transition');
      return;
    }

    const userMessage = { id: Date.now(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await AIService.getResponse(inputText);
      const botMessage = { id: Date.now() + 1, text: response, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        text: "I apologize, but I'm having trouble processing your request right now. Please try again.", 
        isBot: true 
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Little</Text>
        <Text style={styles.subtitle}>Built little, but with purpose</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.isBot ? styles.botMessage : styles.userMessage
          ]}>
            <Text style={[
              styles.messageText,
              message.isBot ? styles.botText : styles.userText
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
        {isTyping && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <Text style={styles.typingText}>Little is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything..."
          placeholderTextColor="#666"
          multiline
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    fontStyle: 'italic',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 12,
  },
  botText: {
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  userText: {
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  typingText: {
    color: '#888888',
    fontStyle: 'italic',
    padding: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
});