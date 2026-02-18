import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MediaService } from '../services/MediaService';

export default function MediaBubble({ message, isOwn }) {
  const { media } = message;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending': return '○';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const handleMediaPress = () => {
    if (media.type === 'document') {
      Alert.alert('Document', `${media.fileName}\nSize: ${MediaService.formatFileSize(media.size || 0)}`);
    }
    // For images/videos, could implement full-screen viewer
  };

  const renderMediaContent = () => {
    switch (media.type) {
      case 'image':
        return (
          <TouchableOpacity onPress={handleMediaPress}>
            <Image 
              source={{ uri: media.base64 ? `data:image/jpeg;base64,${media.base64}` : media.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        );
      
      case 'video':
        return (
          <TouchableOpacity style={styles.videoContainer} onPress={handleMediaPress}>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>▶️</Text>
              <Text style={styles.videoText}>Video</Text>
            </View>
          </TouchableOpacity>
        );
      
      case 'document':
        return (
          <TouchableOpacity style={styles.documentContainer} onPress={handleMediaPress}>
            <Text style={styles.documentIcon}>📄</Text>
            <View style={styles.documentInfo}>
              <Text style={styles.documentName} numberOfLines={1}>
                {media.fileName}
              </Text>
              <Text style={styles.documentSize}>
                {MediaService.formatFileSize(media.size || 0)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      
      default:
        return (
          <Text style={styles.errorText}>Unsupported media type</Text>
        );
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
        {renderMediaContent()}
        
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
    borderRadius: 18,
    overflow: 'hidden',
    minWidth: 120,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  videoContainer: {
    width: 200,
    height: 150,
  },
  videoPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  videoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  videoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 180,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentSize: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    padding: 12,
    textAlign: 'center',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
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