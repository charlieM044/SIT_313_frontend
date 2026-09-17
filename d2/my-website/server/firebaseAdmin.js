const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

if (!getApps().length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './adminsdk.json';

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Firebase service account file not found: ${serviceAccountPath}`);
  }

  initializeApp({
    credential: cert(require(path.resolve(serviceAccountPath))),
  });
}

module.exports = {
  adminAuth: getAuth(),
  db: getFirestore(),
};