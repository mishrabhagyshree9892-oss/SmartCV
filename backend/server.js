const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Initialization
let firebaseError = null;
console.log("Checking Firebase configuration...");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log("FIREBASE_PROJECT_ID:", projectId ? "present" : "MISSING");
console.log("FIREBASE_CLIENT_EMAIL:", clientEmail ? "present" : "MISSING");
console.log("FIREBASE_PRIVATE_KEY:", privateKey ? `present (length: ${privateKey.length})` : "MISSING");

if (projectId && privateKey && clientEmail) {
    try {
        // Fix private key - handle all escape variations from Render/env
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }
        // Remove surrounding quotes if present
        privateKey = privateKey.replace(/^"|"$/g, '');

        console.log("Private key starts with:", privateKey.substring(0, 30));

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
        console.log("✅ Firebase Admin Initialized Successfully");
    } catch (error) {
        firebaseError = error.message;
        console.error("❌ Firebase Admin Initialization FAILED:", error.message);
    }
} else {
    firebaseError = "Missing environment variables";
    console.warn("⚠️ Firebase environment variables missing. Firebase Admin NOT initialized.");
    console.warn("Missing:", {
        projectId: !projectId,
        clientEmail: !clientEmail,
        privateKey: !privateKey
    });
}

// Routes
app.get('/', (req, res) => {
    res.send('SmartCV API is running');
});

// Health check with detailed debug info
app.get('/api/health', async (req, res) => {
    const config = {
        projectId: process.env.FIREBASE_PROJECT_ID ? 'present' : 'MISSING',
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? `present (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'MISSING',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'present' : 'MISSING',
        emailUser: process.env.EMAIL_USER ? 'present' : 'MISSING',
        emailPass: process.env.EMAIL_PASS ? 'present' : 'MISSING',
        lyzrKey: process.env.LYZR_API_KEY ? 'present' : 'MISSING',
        firebaseInitialized: admin.apps.length > 0,
        firebaseError: firebaseError || null,
        nodeEnv: process.env.NODE_ENV,
    };

    if (admin.apps.length > 0) {
        try {
            const collections = await admin.firestore().listCollections();
            res.status(200).json({
                status: 'ok',
                database: 'connected',
                collections: collections.length,
                config
            });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                database: 'firestore_error',
                message: err.message,
                config
            });
        }
    } else {
        res.status(500).json({
            status: 'error',
            database: 'not_initialized',
            message: firebaseError || 'Firebase Admin not initialized',
            config
        });
    }
});

// Import routes
const otpRoutes = require('./routes/otpRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const templateRoutes = require('./routes/templateRoutes');
const agentRoutes = require('./routes/agentRoutes');
app.use('/api/otp', otpRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/agents', agentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
