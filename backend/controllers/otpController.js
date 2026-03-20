const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Create transporter inside function so env vars are always fresh
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Check Firebase is initialized
    if (admin.apps.length === 0) {
        console.error('Firebase Admin not initialized when sendOTP called');
        return res.status(500).json({ error: 'Database not initialized. Contact support.' });
    }

    // Check email config
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email credentials missing:', {
            user: process.env.EMAIL_USER ? 'present' : 'MISSING',
            pass: process.env.EMAIL_PASS ? 'present' : 'MISSING'
        });
        return res.status(500).json({ error: 'Email service not configured.' });
    }

    try {
        const db = admin.firestore();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 600000)); // 10 min

        // Store OTP in Firestore
        await db.collection('otps').doc(email).set({
            otp,
            expiresAt,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`OTP stored in Firestore for ${email}`);

        const transporter = createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔐 SmartCV Verification Code',
            text: `Welcome to SmartCV!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.\n\nThank you for choosing SmartCV to build your professional future!\n\nBest regards,\nThe SmartCV Team`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('OTP Send error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ error: `Failed to send OTP: ${error.message}` });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (admin.apps.length === 0) {
        return res.status(500).json({ error: 'Database not initialized.' });
    }

    try {
        const db = admin.firestore();
        const otpDoc = await db.collection('otps').doc(email).get();

        if (!otpDoc.exists) return res.status(400).json({ error: 'OTP not found. Please request a new one.' });

        const data = otpDoc.data();
        const now = admin.firestore.Timestamp.now();

        if (data.expiresAt.toMillis() < now.toMillis()) {
            await db.collection('otps').doc(email).delete();
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (data.otp === otp) {
            await db.collection('otps').doc(email).delete();
            const customToken = await admin.auth().createCustomToken(email);
            res.status(200).json({ message: 'OTP verified successfully', token: customToken });
        } else {
            res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('OTP Verify error:', error.message);
        res.status(500).json({ error: `Server error during verification: ${error.message}` });
    }
};
