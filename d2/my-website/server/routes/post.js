const express = require('express');
const { db } = require('../firebaseAdmin');
const { requireAuth } = require('./authUsers');

const router = express.Router();

// POST /api/posts
// Body: { type: 'article' | 'question', title, description, tags }
// Requires an Authorization: Bearer <token> header (checked by requireAuth).
router.post('/', requireAuth, async (req, res) => {  // This route handles the creation of new posts (articles or questions).
// // It requires the user to be authenticated, which is enforced by the requireAuth middleware. The request body should contain the type of post, title, description, and tags.
// // The user's ID and email are extracted from the JWT token and used to associate the post with the author.
    const { type, title, description, tags } = req.body;

    if (type !== 'article' && type !== 'question') {
        return res.status(400).json({ error: 'Post type must be "article" or "question".' });
    }
    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({ error: 'Please provide a title and description.' });
    }

    const collectionName = type === 'article' ? 'articles' : 'questions';
    const tagList = typeof tags === 'string'
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

    try {
        const docRef = await db.collection(collectionName).add({  // Add a new document to the appropriate collection (articles or questions) in Firestore.
            type,
            title: title.trim(),
            description: description.trim(),
            tags: tagList,
            authorId: req.user.userId,  // The author's ID is taken from the authenticated user's information (set by requireAuth).
            authorEmail: req.user.email,
            createdAt: new Date(),
            payed: req.body.payed,  // The payed property is included in the post document to indicate whether the post is paid or not. This value is expected to be provided in the request body.
        });

        return res.status(201).json({ message: 'Saved successfully.', id: docRef.id });
    } catch (error) {
        console.error('Post creation error:', error);
        return res.status(500).json({ error: 'Unable to save the post.' });
    }
});

// different content to guests vs. logged-in users (e.g. Browse Posts)
// use this so a missing/expired token just means "treat as guest"
// instead of a 401. req.user is either the decoded JWT payload or null.
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
    } catch (error) {
        req.user = null;
    }
    next();
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
    } catch (error) {
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
        const users = await db.collection('users').where('email', '==', email).limit(1).get(); // Query Firestore for the user with the provided email
        if (users.empty) {
            return res.status(401).json({ error: 'Incorrect email or password.' });
        }

        const user = users.docs[0];
        const userData = user.data(); // Get the user data from the Firestore document
        if (!userData.passwordHash) { // Check if the passwordHash field exists 
            return res.status(401).json({ error: 'This account needs to be registered again.' });
        }

        const passwordMatches = await bcrypt.compare(password, userData.passwordHash); // hash the provided password and compare it with the stored hash
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Incorrect email or password.' }); // If the password doesn't match, return an error
        }

        const token = jwt.sign( // Create a JWT token with the user's ID, email, and username
            { userId: user.id, email: userData.email, username: userData.username },
            jwtSecret,
            { expiresIn: JWT_EXPIRES_IN },
        );

        return res.json({  // Return a success response with the token and user information
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
        return res.status(500).json({ error: 'Unable to sign in.' }); // Return a 500 error if something goes wrong during the login process
    }
});


router.get('/me', requireAuth, async (req, res) => { // This route is protected by the requireAuth middleware, which checks for a valid JWT token in the request headers. If the token is valid, it adds the user information to req.user and allows access to this route.
    try {
        const userDoc = await db.collection('users').doc(req.user.userId).get(); // Fetch the user's document from Firestore using the userId extracted from the JWT token. If the document doesn't exist, return a 404 error.

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const userData = userDoc.data(); // Extract the user data from the Firestore document and return it in the response, including the user's ID, email, username, and plan type (defaulting to 'free' if not set).

        return res.json({ // Return the user data in the response
            userId: req.user.userId,
            email: userData.email,
            username: userData.username,
            planType: userData.planType || 'free', // Default to 'free' if not set
        });
    } catch (error) {
        console.error('Load user error:', error);
        return res.status(500).json({ error: 'Unable to load user.' }); // Return a 500 error if something goes wrong while fetching the user data from Firestore
    }
});

router.post('/logout', (req, res) => { // This route handles user logout. Since JWTs are stateless, the server doesn't need to do anything to "log out" the user. The client should simply discard the token on their side.
    res.json({ message: 'Signed out.' });
});


router.post('/upgrade', requireAuth, async (req, res) => { // This route handles upgrading the user's plan. It requires authentication and expects payment details in the request body.
    const { planType, payment } = req.body;

    if (planType !== 'paid') {
        return res.status(400).json({ error: 'Invalid plan type.' });
    }

    if (!payment) {
        return res.status(400).json({ error: 'Payment details are required.' });
    }

    // Basic server-side validation of the payment shape. Never trust the
    // client to have already validated this before it reaches the backend.
    const { cardNumber, expiry, cvc } = payment;
    const digitsOnly = typeof cardNumber === 'string' ? cardNumber.replace(/\s+/g, '') : '';
    if (!/^\d{13,19}$/.test(digitsOnly)) {
        return res.status(400).json({ error: 'Enter a valid card number.' });
    }
    if (typeof expiry !== 'string' || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) {
        return res.status(400).json({ error: 'Enter a valid expiry date (MM/YY).' });
    }
    if (typeof cvc !== 'string' || !/^\d{3,4}$/.test(cvc.trim())) {
        return res.status(400).json({ error: 'Enter a valid security code.' });
    }

    try {
        // Here you would normally validate the payment details and process the payment.
        // For this example, we'll assume the payment is always successful.
        await db.collection('users').doc(req.user.userId).update({ planType: 'paid' }); // Update the user's plan type in Firestore to 'paid'.

        return res.json({ message: 'Plan upgraded to Paid.' });
    }
    catch (error) {
        console.error('Upgrade error:', error);
        return res.status(500).json({ error: 'Unable to upgrade plan.' });
    }
});

module.exports = router; // Export the router so it can be used in server.js
module.exports.requireAuth = requireAuth; // Export the requireAuth middleware so it can be used in other routes that need authentication
module.exports.optionalAuth = optionalAuth; // Export the optionalAuth middleware so guest-accessible routes (e.g. Browse Posts) can still tell logged-in users apart from guests

