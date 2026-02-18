import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageBubble({ message, isOwn }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return '○';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.bubble,
        isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          isOwn ? styles.ownText : styles.otherText
        ]}>
          {message.text}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.timestamp,
            isOwn ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {isOwn && (
            <Text style={[
              styles.status,
              message.status === 'read' && styles.readStatus
            ]}>
              {getStatusIcon(message.status)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    minWidth: 60,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  ownText: {
    color: '#ffffff',
  },
  otherText: {
    color: '#ffffff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  status: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  readStatus: {
    color: '#4CAF50',
  },
});