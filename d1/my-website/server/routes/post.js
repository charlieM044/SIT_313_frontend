const express = require('express');
const { db } = require('../firebaseAdmin');
const { requireAuth } = require('./authUsers');

const router = express.Router();

// POST /api/posts
// Body: { type: 'article' | 'question', title, description, tags }
// Requires an Authorization: Bearer <token> header (checked by requireAuth).
router.post('/', requireAuth, async (req, res) => {
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
        const docRef = await db.collection(collectionName).add({
            type,
            title: title.trim(),
            description: description.trim(),
            tags: tagList,
            authorId: req.user.userId,
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
