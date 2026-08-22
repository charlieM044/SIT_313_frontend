const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminAuth, db } = require('../firebaseAdmin');

const router = express.Router();
const JWT_EXPIRES_IN = '5d';
const jwtSecret = process.env.JWT_SECRET;

router.post('/signup', async (req, res) => {
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
    });

    return res.status(201).json({ message: 'Account created.' });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to create account.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
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

    return res.json({ message: 'Signed in.', token });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to sign in.' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Signed out.' });
});

module.exports = router;