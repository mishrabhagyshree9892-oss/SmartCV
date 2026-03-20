const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

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

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔐 SmartCV Verification Code',
            text: `Welcome to SmartCV!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share this code with anyone.\n\nThank you for choosing SmartCV to build your professional future!\n\nBest regards,\nThe SmartCV Team`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('OTP Send error:', error);
        res.status(500).json({ error: 'Failed to send OTP. Check server logs.' });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    
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
        console.error('OTP Verify error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
};
