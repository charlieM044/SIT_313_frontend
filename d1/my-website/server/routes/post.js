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
        });

        return res.status(201).json({ message: 'Saved successfully.', id: docRef.id });
    } catch (error) {
        console.error('Post creation error:', error);
        return res.status(500).json({ error: 'Unable to save the post.' });
    }
});

module.exports = router;
