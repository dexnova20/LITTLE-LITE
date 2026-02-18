import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { CryptoService } from './CryptoService';

export class MediaService {
  static async pickImage() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true
      });

      if (!result.canceled) {
        return {
          type: 'image',
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
          fileName: `image_${Date.now()}.jpg`
        };
      }
      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      return null;
    }
  }

  static async pickVideo() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera roll permission is required');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5
      });

      if (!result.canceled) {
        return {
          type: 'video',
          uri: result.assets[0].uri,
          fileName: `video_${Date.now()}.mp4`
        };
      }
      return null;
    } catch (error) {
      console.error('Video picker error:', error);
      return null;
    }
  }

  static async pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        return {
          type: 'document',
          uri: result.assets[0].uri,
          fileName: result.assets[0].name,
          size: result.assets[0].size
        };
      }
      return null;
    } catch (error) {
      console.error('Document picker error:', error);
      return null;
    }
  }

  static async encryptMedia(mediaData, sharedSecret) {
    try {
      if (mediaData.base64) {
        const encrypted = await CryptoService.encryptMessage(mediaData.base64, sharedSecret);
        return {
          ...mediaData,
          encryptedData: encrypted,
          base64: null // Remove unencrypted data
        };
      }
      return mediaData;
    } catch (error) {
      throw new Error('Media encryption failed');
    }
  }

  static async decryptMedia(encryptedMedia, sharedSecret) {
    try {
      if (encryptedMedia.encryptedData) {
        const decrypted = await CryptoService.decryptMessage(encryptedMedia.encryptedData, sharedSecret);
        return {
          ...encryptedMedia,
          base64: decrypted,
          encryptedData: null
        };
      }
      return encryptedMedia;
    } catch (error) {
      throw new Error('Media decryption failed');
    }
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}