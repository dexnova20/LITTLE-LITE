const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/init');

const router = express.Router();

// Generate random OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (in production, use Twilio or similar)
router.post('/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await pool.query(
      'INSERT INTO otp_verifications (phone_number, otp_code, expires_at) VALUES ($1, $2, $3)',
      [phoneNumber, otp, expiresAt]
    );

    // In production, send SMS via Twilio
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // Remove this in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and create/login user
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    // Verify OTP
    const otpResult = await pool.query(
      'SELECT * FROM otp_verifications WHERE phone_number = $1 AND otp_code = $2 AND expires_at > NOW() AND verified = false',
      [phoneNumber, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await pool.query(
      'UPDATE otp_verifications SET verified = true WHERE phone_number = $1 AND otp_code = $2',
      [phoneNumber, otp]
    );

    // Check if user exists
    let userResult = await pool.query(
      'SELECT * FROM users WHERE phone_number = $1',
      [phoneNumber]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Create new user
      const newUserResult = await pool.query(
        'INSERT INTO users (phone_number) VALUES ($1) RETURNING *',
        [phoneNumber]
      );
      user = newUserResult.rows[0];
    } else {
      // Update existing user
      user = userResult.rows[0];
      await pool.query(
        'UPDATE users SET last_seen = CURRENT_TIMESTAMP, is_active = true WHERE id = $1',
        [user.id]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phone_number },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phoneNumber: user.phone_number,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;