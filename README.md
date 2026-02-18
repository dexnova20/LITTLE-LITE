# Little AI - Privacy-First Encrypted Messenger

A cross-platform encrypted messaging application with an AI chatbot disguise, built for maximum privacy and security.

## 🎭 What is Little AI?

Little AI appears to be a professional AI assistant, but when you enter the secret code "0302", it reveals itself as a fully-featured encrypted messaging app. This unique disguise provides an extra layer of privacy protection.

## ✨ Key Features

- **🎭 AI Chatbot Disguise** - Professional assistant interface
- **🔐 End-to-End Encryption** - Signal Protocol implementation
- **💬 Real-Time Messaging** - Instant WebSocket communication
- **👥 Group Chats** - Secure multi-user conversations
- **📱 Cross-Platform** - Android, iOS, Desktop, Web
- **🛡️ Zero Server Storage** - Messages never stored on server
- **📞 Phone Authentication** - OTP-based secure login
- **🎨 Dark Theme** - Eye-friendly professional design

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
PostgreSQL 12+
Expo CLI
```

### Installation
```bash
# Clone and install
cd "Little AI"
npm install
cd server && npm install && cd ..

# Setup database
createdb little_messenger
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# Start application
npm run dev
```

### Usage
1. App opens in AI chatbot mode
2. Type "0302" to reveal messenger
3. Enter phone number and verify with OTP "123456"
4. Start secure messaging!

## 🏗️ Architecture

- **Frontend**: React Native/Expo
- **Backend**: Node.js + Express + Socket.IO
- **Database**: PostgreSQL (metadata only)
- **Encryption**: AES-256 + ECDH key exchange
- **Real-time**: WebSocket messaging

## 🔒 Security

- Client-side encryption only
- Automatic key rotation
- Forward secrecy
- No message storage on server
- Privacy-first design

## 📄 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

This is a hackathon project. For production use, additional security auditing is recommended.