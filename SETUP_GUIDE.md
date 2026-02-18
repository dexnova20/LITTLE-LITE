# Little AI - Step-by-Step Setup Guide

## 📋 Prerequisites Installation

### 1. Install Node.js
```bash
# Download from nodejs.org (version 18 or higher)
# Verify installation:
node --version
npm --version
```

### 2. Install PostgreSQL
```bash
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Verify installation:
psql --version
```

### 3. Install Expo CLI
```bash
npm install -g @expo/cli
expo --version
```

## 🛠️ Project Setup

### Step 1: Download Project
```bash
# Navigate to project directory
cd "Little AI"
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Database Setup
```bash
# Create PostgreSQL database
createdb little_messenger

# Copy environment file
cp server/.env.example server/.env
```

### Step 4: Configure Environment
Edit `server/.env` file:
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=little_messenger
DB_USER=postgres
DB_PASSWORD=your_password

# Application Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key
```

## 🚀 Running the Application

### Method 1: Development Mode
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start React Native app
cd ..
npm start
```

### Method 2: Using Docker
```bash
# Start with Docker Compose
docker-compose up
```

## 📱 Platform-Specific Setup

### Android
```bash
# Install Android Studio
# Set up Android emulator or connect device
npm run android
```

### iOS (macOS only)
```bash
# Install Xcode
# Set up iOS simulator
npm run ios
```

### Web Browser
```bash
npm run web
```

### Desktop
```bash
# Use Expo Go app to scan QR code
# Or run in web browser
```

## 🧪 Testing the Application

### Step 1: Launch App
- App opens in AI chatbot disguise mode
- Interface shows "Little" with black background

### Step 2: Test AI Features
```bash
# Try these prompts:
"Help me learn Python"
"Plan my daily routine"
"Explain blockchain technology"
```

### Step 3: Access Secret Messenger
```bash
# Type exactly: 0302
# Watch gradient transition screen
# App reveals "Little messenger"
```

### Step 4: Authentication
```bash
# Enter any phone number (e.g., +1234567890)
# Use OTP: 123456 (development mode)
# Access granted to messaging interface
```

### Step 5: Test Messaging
```bash
# Enter another phone number to chat
# Send messages (encrypted automatically)
# Test group chat creation
# Check privacy settings
```

## 🔧 Troubleshooting

### Common Issues

#### Metro Bundler Errors
```bash
# Clear cache
expo start -c
npm start -- --reset-cache
```

#### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Verify database exists
psql -l | grep little_messenger
```

#### Port Conflicts
```bash
# Change server port in server/.env
PORT=3001

# Or kill process using port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

#### Expo CLI Issues
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Clear Expo cache
expo r -c
```

### Development Tips

#### Hot Reload
- Changes to React Native code reload automatically
- Server changes require restart
- Database schema changes need manual migration

#### Debugging
```bash
# Enable debug mode
DEBUG=* npm run dev

# View logs
tail -f server/logs/app.log
```

#### Testing Different Platforms
```bash
# Test responsive design
npm run web

# Test mobile features
npm run android
npm run ios
```

## 📊 Verification Checklist

- [ ] App launches in disguise mode
- [ ] AI chatbot responds intelligently
- [ ] Secret code "0302" works
- [ ] Transition screen appears
- [ ] Phone authentication works
- [ ] Messaging interface loads
- [ ] Real-time messaging works
- [ ] Group chat creation works
- [ ] Privacy settings accessible
- [ ] Media sharing functional

## 🎯 Demo Script (2 Minutes)

1. **Show AI Assistant** (30s)
   - "This looks like a professional AI assistant"
   - Ask: "Help me understand machine learning"
   - Show step-by-step response

2. **Reveal Secret** (30s)
   - "But watch what happens when I type 0302"
   - Show gradient transition
   - "It's actually an encrypted messenger!"

3. **Demonstrate Features** (60s)
   - Phone authentication
   - Real-time messaging
   - Group chat creation
   - Privacy settings
   - "Zero server storage, Signal Protocol encryption"

Your Little AI application is now ready for demonstration! 🚀