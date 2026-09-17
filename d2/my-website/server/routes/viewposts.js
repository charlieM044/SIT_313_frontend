const express = require('express');
const { db } = require('../firebaseAdmin');
const { optionalAuth } = require('./authUsers');

const router = express.Router();

const MAX_TAGS_PER_QUERY = 10; // Firestore's array-contains-any limit

// Looks up the requester's CURRENT plan directly from Firestore rather than
// trusting the JWT payload. The JWT is issued at login and can live for up
// to 5 days, so if a user upgrades mid-session their token would still say
// "free" -- reading Firestore here keeps access decisions accurate and,
// per the assignment, entirely server-side.
async function getCurrentPlanType(req) {
    if (!req.user || !req.user.userId) return 'free';
    try {
        const userDoc = await db.collection('users').doc(req.user.userId).get();
        if (!userDoc.exists) return 'free';
        return userDoc.data().planType === 'paid' ? 'paid' : 'free';
    } catch (error) {
        console.error('Error loading plan type for Browse Posts:', error);
        return 'free'; // fail closed -- never accidentally grant paid access
    }
}

function toIsoString(value) {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    return value;
}

// GET /api/viewposts
// Optional query params:
//   type      'article' | 'question'   (default: both)
//   tags      comma-separated list, matches ANY tag
//   dateFrom  ISO date string, inclusive lower bound on createdAt
//   dateTo    ISO date string, inclusive upper bound on createdAt
//   plan      'free' | 'paid'  -- only usable by paid users, to narrow
//             their own view down to just the free or just the paid posts
//             they're allowed to see. Ignored for free users/guests.
//   sort      'newest' (default) | 'oldest'
//
// No auth is required to call this route -- guests get the free-plan view.
router.get('/viewposts', optionalAuth, async (req, res) => {
    try {
        const planType = await getCurrentPlanType(req);
        const canSeePaid = planType === 'paid';

        const { type, tags, dateFrom, dateTo, plan, sort } = req.query;

        const collections = [];
        if (type === 'article' || type === 'question') {
            collections.push(type === 'article' ? 'articles' : 'questions');
        } else {
            collections.push('articles', 'questions');
        }

        let requestedTags = [];
        if (typeof tags === 'string' && tags.trim()) {
            requestedTags = tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .slice(0, MAX_TAGS_PER_QUERY);
        }

        let posts = [];
        for (const collectionName of collections) {
            let query = db.collection(collectionName);

            // The access-control decision happens here, in the Firestore
            // query itself: a free user or a guest's query never even
            // retrieves paid documents from the database, let alone sends
            // them to the client.
            if (!canSeePaid) {
                query = query.where('payed', '==', false);
            }
            if (requestedTags.length > 0) {
                query = query.where('tags', 'array-contains-any', requestedTags);
            }

            const snapshot = await query.get();
            snapshot.forEach((doc) => {
                const data = doc.data();
                posts.push({
                    id: doc.id,
                    type: data.type,
                    title: data.title,
                    description: data.description,
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    payed: Boolean(data.payed),
                    author: data.authorUsername || data.authorEmail || 'Unknown',
                    createdAt: toIsoString(data.createdAt),
                });
            });
        }

        // A paid user narrowing their own (already-authorized) view down
        // to just free or just paid posts. Never lets a free user/guest
        // widen their view -- canSeePaid already gated what was fetched.
        if (canSeePaid && (plan === 'free' || plan === 'paid')) {
            posts = posts.filter((p) => (plan === 'paid' ? p.payed : !p.payed));
        }

        if (dateFrom) {
            const from = new Date(dateFrom);
            if (!Number.isNaN(from.getTime())) {
                posts = posts.filter((p) => p.createdAt && new Date(p.createdAt) >= from);
            }
        }
        if (dateTo) {
            const to = new Date(dateTo);
            if (!Number.isNaN(to.getTime())) {
                posts = posts.filter((p) => p.createdAt && new Date(p.createdAt) <= to);
            }
        }

        posts.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return sort === 'oldest' ? aTime - bTime : bTime - aTime;
        });

        return res.status(200).json({
            posts,
            isLoggedIn: Boolean(req.user),
            planType,
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

module.exports = router;