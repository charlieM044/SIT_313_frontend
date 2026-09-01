const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminAuth, db } = require('../firebaseAdmin');

const router = express.Router();
const JWT_EXPIRES_IN = '5d';
const jwtSecret = process.env.JWT_SECRET;


if (!jwtSecret) {
  throw new Error('JWT_SECRET is not set in environment variables.');
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

router.post('/signup', async (req, res) => {
  // authUsers.js, near the top

  const { username, email, password } = req.body;

  if (!username || !email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username, email, and a password of at least 6 characters are required.' });
  }

  try {
    const existingUser = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!existingUser.empty) {
      return res.status(409).json({ error: 'That email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await adminAuth.createUser({ email, displayName: username });
    await db.collection('users').doc(user.uid).set({
      username,
      email,
      passwordHash,
      createdAt: new Date(),
      planType: 'free',
      createdAt: new Date(),
    });

    return res.status(201).json({ message: 'Account created.' });
  }  catch (error) {
  console.error('Signup error:', error);
  return res.status(500).json({ error: 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (!jwtSecret) {
  throw new Error('JWT_SECRET is not set in environment variables.');
}

  try {
    const users = await db.collection('users').where('email', '==', email).limit(1).get();
    if (users.empty) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const user = users.docs[0];
    const userData = user.data();
    if (!userData.passwordHash) {
      return res.status(401).json({ error: 'This account needs to be registered again.' });
    }

    const passwordMatches = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: userData.email, username: userData.username },
      jwtSecret,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return res.json({
      message: 'Signed in.',
      token,
      user: {
        userId: user.id,
        email: userData.email,
        username: userData.username,
        planType: userData.planType || 'free', // Default to 'free' if not set
      },
    });
  } catch (error) {
  console.error('Login error:', error);
  return res.status(500).json({ error: 'Unable to sign in.' });
  }
});


router.get('/me', requireAuth, (req, res) => {
  return res.json({
    userId: req.user.userId,
    email: req.user.email,
    username: req.user.username,
    planType: req.user.planType,
  });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Signed out.' });
});


module.exports = router;
module.exports.requireAuth = requireAuth;