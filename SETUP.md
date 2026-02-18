# Little AI - Quick Setup Guide

## 🚀 Immediate Setup (5 Minutes)

### Prerequisites
```bash
# Install Node.js 18+ and npm
# Install Expo CLI globally
npm install -g @expo/cli

# Install PostgreSQL (or use Docker)
# For Windows: Download from postgresql.org
# For macOS: brew install postgresql
```

### 1. Install Dependencies
```bash
cd "Little AI"

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb little_messenger

# Copy environment file
cp server/.env.example server/.env

# Edit server/.env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=little_messenger
# DB_USER=your_username
# DB_PASSWORD=your_password
```

### 3. Start the Application
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start React Native app
cd ..
npm start
```

### 4. Run on Platforms
```bash
# Android (requires Android Studio/emulator)
npm run android

# iOS (macOS only, requires Xcode)
npm run ios

# Web browser
npm run web

# Desktop (via Expo)
# Use Expo Go app on mobile to scan QR code
```

## 📱 Testing the App

1. **Launch**: App opens in AI chatbot disguise mode
2. **Test AI**: Ask questions like "Help me learn Python" or "Plan my day"
3. **Secret Access**: Type exactly "0302" to reveal messenger
4. **Transition**: Watch the gradient transition screen
5. **Authentication**: Enter phone number (any format) and use OTP "123456" (dev mode)
6. **Messaging**: Enter any phone number to start chatting
7. **Group Chat**: Tap "+ Group" to create group chats
8. **Privacy**: Tap settings gear icon for privacy controls

## 🔧 Production Deployment

### Environment Variables (.env)
```bash
# Required for production
JWT_SECRET=your-super-secret-jwt-key-256-bits-minimum
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Database Migration
```bash
# The app auto-creates tables on first run
# For production, run migrations manually:
node -e "require('./server/database/init').initializeDatabase()"
```

### Build for Production
```bash
# Build Android APK
expo build:android

# Build iOS IPA (macOS only)
expo build:ios

# Build web version
expo build:web
```

## 🎯 Demo Script (2 Minutes)

1. **"This looks like a professional AI assistant..."**
   - Show AI capabilities: "Help me understand blockchain"
   - Demonstrate step-by-step reasoning

2. **"But watch what happens when I type 0302..."**
   - Enter secret phrase
   - Show beautiful transition

3. **"It's actually a privacy-first encrypted messenger!"**
   - Show phone authentication
   - Demonstrate real-time messaging
   - Show encryption indicators

4. **"Zero server storage, Signal Protocol encryption"**
   - Show privacy settings
   - Explain disappearing messages
   - Demonstrate group chat

5. **"Cross-platform, production-ready, hackathon-winning!"**
   - Show responsive design
   - Highlight security features

## 🏆 Hackathon Judging Points

- **Innovation**: Unique AI disguise concept
- **Technical**: Signal Protocol, real-time WebSockets
- **Privacy**: Zero server storage, client-side encryption
- **UX**: Professional design, intuitive interface
- **Completeness**: Full messaging app with all features
- **Security**: Industry-standard encryption practices

## 🔍 Troubleshooting

### Common Issues:
1. **Metro bundler errors**: Clear cache with `expo start -c`
2. **Database connection**: Check PostgreSQL is running
3. **Port conflicts**: Change server port in server/index.js
4. **Expo errors**: Update Expo CLI: `npm install -g @expo/cli@latest`

### Quick Fixes:
```bash
# Clear all caches
expo start -c
npm start -- --reset-cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**The app is ready for immediate demonstration! 🚀**