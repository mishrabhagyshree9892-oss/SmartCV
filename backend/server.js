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

// Firebase Admin (Conditional Initialization)
console.log("Checking Firebase configuration...");
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
        console.log("Initializing Firebase Admin for project:", process.env.FIREBASE_PROJECT_ID);
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '');
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log("Firebase Admin Initialized Successfully");
    } catch (error) {
        console.error("Firebase Admin Initialization FAILED:", error.message);
    }
} else {
    console.warn("Firebase environment variables missing. Firebase Admin NOT initialized.");
}

// Routes
app.get('/', (req, res) => {
    res.send('Re-Resume_Me API is running');
});

app.get('/api/health', async (req, res) => {
    try {
        const adminStatus = admin.apps.length > 0 ? 'initialized' : 'not initialized';
        const config = {
            projectId: process.env.FIREBASE_PROJECT_ID ? 'present' : 'missing',
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'present' : 'missing',
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'present' : 'missing'
        };
        
        if (admin.apps.length > 0) {
            const collections = await admin.firestore().listCollections();
            res.status(200).json({ 
                status: 'ok', 
                database: 'connected', 
                collections: collections.length,
                adminStatus,
                config 
            });
        } else {
            res.status(500).json({ 
                status: 'error', 
                database: 'disconnected', 
                message: 'Firebase Admin not initialized',
                adminStatus,
                config 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            database: 'disconnected', 
            message: error.message,
            config: {
                projectId: process.env.FIREBASE_PROJECT_ID ? 'present' : 'missing',
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? 'present' : 'missing',
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? 'present' : 'missing'
            }
        });
    }
});

// Import controllers/routes
const otpRoutes = require('./routes/otpRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
app.use('/api/otp', otpRoutes);
app.use('/api/resumes', resumeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
