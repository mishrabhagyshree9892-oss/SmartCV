const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

// Temporary storage for OTPs (In-memory for simplicity, but for production consider Redis or Firestore)
const otps = new Map();

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(email, { otp, expires: Date.now() + 300000 }); // 5 min expiry

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Re-Resume_Me OTP',
        text: `Your OTP for signup is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const stored = otps.get(email);

    if (!stored) return res.status(400).json({ error: 'OTP not found' });
    if (stored.expires < Date.now()) {
        otps.delete(email);
        return res.status(400).json({ error: 'OTP expired' });
    }

    if (stored.otp === otp) {
        otps.delete(email);
        try {
            const customToken = await admin.auth().createCustomToken(email);
            res.status(200).json({ message: 'OTP verified successfully', token: customToken });
        } catch (error) {
            console.error('Firebase token error:', error);
            res.status(500).json({ error: 'Failed to create authentication token' });
        }
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
};
