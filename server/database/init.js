const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'little_messenger',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
  try {
    // Users table - minimal data storage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        public_key TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // OTP verification table - temporary storage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Message metadata only - NO content storage
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_metadata (
        id VARCHAR(50) PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        recipient_id INTEGER REFERENCES users(id),
        timestamp BIGINT NOT NULL,
        delivered_at TIMESTAMP,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Key exchange table for Signal Protocol
    await pool.query(`
      CREATE TABLE IF NOT EXISTS key_bundles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        identity_key TEXT NOT NULL,
        signed_prekey TEXT NOT NULL,
        prekey_signature TEXT NOT NULL,
        one_time_keys TEXT[], -- Array of one-time keys
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Groups table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_by INTEGER REFERENCES users(id),
        group_key TEXT NOT NULL, -- Encrypted group key
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Group members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS group_members (
        group_id INTEGER REFERENCES groups(id),
        user_id INTEGER REFERENCES users(id),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin BOOLEAN DEFAULT false,
        PRIMARY KEY (group_id, user_id)
      )
    `);

    // User privacy settings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_privacy (
        user_id INTEGER PRIMARY KEY REFERENCES users(id),
        allow_contact_sync BOOLEAN DEFAULT false,
        share_my_number BOOLEAN DEFAULT false,
        find_me_by_number BOOLEAN DEFAULT true,
        last_seen_privacy VARCHAR(20) DEFAULT 'everyone', -- everyone, contacts, nobody
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Clean up expired OTPs
    await pool.query(`
      DELETE FROM otp_verifications 
      WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL '1 hour'
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = { pool, initializeDatabase };