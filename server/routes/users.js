const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../database/init');

const router = express.Router();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Check if user exists by phone number
router.get('/check/:phoneNumber', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const result = await pool.query(
      'SELECT id, phone_number, is_active FROM users WHERE phone_number = $1 AND is_active = true',
      [phoneNumber]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        exists: true,
        userId: user.id,
        phoneNumber: user.phone_number
      });
    } else {
      res.json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Check user error:', error);
    res.status(500).json({ error: 'Failed to check user' });
  }
});

// Get user's public key bundle for encryption
router.get('/keys/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      'SELECT identity_key, signed_prekey, prekey_signature, one_time_keys FROM key_bundles WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length > 0) {
      const keyBundle = result.rows[0];
      
      // Remove one one-time key after use
      if (keyBundle.one_time_keys && keyBundle.one_time_keys.length > 0) {
        const oneTimeKey = keyBundle.one_time_keys[0];
        const remainingKeys = keyBundle.one_time_keys.slice(1);
        
        await pool.query(
          'UPDATE key_bundles SET one_time_keys = $1 WHERE user_id = $2',
          [remainingKeys, userId]
        );

        res.json({
          identityKey: keyBundle.identity_key,
          signedPrekey: keyBundle.signed_prekey,
          prekeySignature: keyBundle.prekey_signature,
          oneTimeKey
        });
      } else {
        res.json({
          identityKey: keyBundle.identity_key,
          signedPrekey: keyBundle.signed_prekey,
          prekeySignature: keyBundle.prekey_signature
        });
      }
    } else {
      res.status(404).json({ error: 'Key bundle not found' });
    }
  } catch (error) {
    console.error('Get keys error:', error);
    res.status(500).json({ error: 'Failed to get keys' });
  }
});

// Upload user's public key bundle
router.post('/keys', authenticateToken, async (req, res) => {
  try {
    const { identityKey, signedPrekey, prekeySignature, oneTimeKeys } = req.body;
    const userId = req.user.userId;

    await pool.query(
      `INSERT INTO key_bundles (user_id, identity_key, signed_prekey, prekey_signature, one_time_keys)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         identity_key = $2,
         signed_prekey = $3,
         prekey_signature = $4,
         one_time_keys = $5,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, identityKey, signedPrekey, prekeySignature, oneTimeKeys]
    );

    res.json({ success: true, message: 'Key bundle uploaded successfully' });
  } catch (error) {
    console.error('Upload keys error:', error);
    res.status(500).json({ error: 'Failed to upload keys' });
  }
});

// Batch check registered users (privacy-preserving)
router.post('/check-batch', authenticateToken, async (req, res) => {
  try {
    const { hashedNumbers } = req.body;
    
    // In production, implement proper privacy-preserving contact discovery
    // This is a simplified version
    const registered = hashedNumbers.map(() => Math.random() > 0.7); // Mock 30% registration rate
    const lastSeen = hashedNumbers.map(() => Date.now() - Math.random() * 86400000); // Random last seen
    
    res.json({ registered, lastSeen });
  } catch (error) {
    console.error('Batch check error:', error);
    res.status(500).json({ error: 'Failed to check users' });
  }
});

// Update privacy settings
router.put('/privacy', authenticateToken, async (req, res) => {
  try {
    const { allowContactSync, shareMyNumber, findMeByNumber, lastSeenPrivacy } = req.body;
    const userId = req.user.userId;

    await pool.query(
      `INSERT INTO user_privacy (user_id, allow_contact_sync, share_my_number, find_me_by_number, last_seen_privacy)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         allow_contact_sync = $2,
         share_my_number = $3,
         find_me_by_number = $4,
         last_seen_privacy = $5,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, allowContactSync, shareMyNumber, findMeByNumber, lastSeenPrivacy]
    );

    res.json({ success: true, message: 'Privacy settings updated' });
  } catch (error) {
    console.error('Privacy update error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

module.exports = router;