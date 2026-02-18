# Little AI - Deployment Guide

## 🚀 Production Deployment

### Environment Setup

1. **Server Environment Variables**
```bash
# Required for production
PORT=3000
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-key
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=little_messenger

# Optional: SMS OTP (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### Docker Deployment

1. **Using Docker Compose**
```bash
# Start with database
docker-compose up -d

# Or build and deploy separately
docker build -t little-ai-server ./server
docker run -p 3000:3000 little-ai-server
```

2. **Database Migration**
```bash
# Auto-creates tables on first run
# Or run manually:
node -e "require('./server/database/init').initializeDatabase()"
```

### Cloud Deployment Options

#### Heroku
```bash
# Install Heroku CLI
heroku create little-ai-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

#### AWS/DigitalOcean
```bash
# Use provided Dockerfile
# Set environment variables in cloud console
# Configure PostgreSQL database
# Deploy with container service
```

### Mobile App Deployment

#### Android
```bash
# Build APK
expo build:android

# Or create AAB for Play Store
expo build:android --type app-bundle
```

#### iOS
```bash
# Build IPA (macOS only)
expo build:ios

# Submit to App Store
expo upload:ios
```

### Security Checklist

- [ ] Change JWT secret to cryptographically secure key
- [ ] Enable HTTPS/TLS with valid certificates
- [ ] Configure production database with encryption
- [ ] Set up rate limiting and DDoS protection
- [ ] Enable monitoring and logging
- [ ] Configure backup and disaster recovery
- [ ] Audit dependencies for vulnerabilities

### Performance Optimization

- [ ] Enable Redis for session storage
- [ ] Configure CDN for static assets
- [ ] Set up load balancer for multiple instances
- [ ] Enable database connection pooling
- [ ] Configure WebSocket scaling with Redis adapter

### Monitoring

- [ ] Set up application monitoring (New Relic, DataDog)
- [ ] Configure error tracking (Sentry)
- [ ] Enable performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

## 🔧 Scaling Considerations

### Horizontal Scaling
- Load balancer with multiple server instances
- Redis adapter for Socket.IO multi-server support
- Database read replicas for user lookups
- CDN for static asset delivery

### Database Optimization
- Indexing on frequently queried fields
- Connection pooling for efficient connections
- Partitioning message metadata by date
- Regular cleanup of expired OTP records

### WebSocket Optimization
- Redis adapter for cross-server communication
- Connection limits and rate limiting
- Efficient room management
- Message queuing for offline users

This deployment guide ensures your Little AI application is production-ready and scalable.