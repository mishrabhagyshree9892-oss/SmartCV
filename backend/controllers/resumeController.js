const admin = require('firebase-admin');

exports.createResume = async (req, res) => {
    try {
        const { userId, data } = req.body;
        const db = admin.firestore();
        const docRef = await db.collection('resumes').add({
            userId,
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Trigger Notification
        await db.collection('notifications').add({
            userId,
            title: '🎉 Resume Created!',
            message: `Your new resume "${data.name || 'Untitled'}" is ready for blockchain verification.`,
            type: 'success',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ id: docRef.id, message: 'Resume created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getResumes = async (req, res) => {
    try {
        const { userId } = req.params;
        const db = admin.firestore();
        const snapshot = await db.collection('resumes').where('userId', '==', userId).get();
        const resumes = [];
        snapshot.forEach(doc => resumes.push({ id: doc.id, ...doc.data() }));
        res.status(200).json(resumes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.body;
        const db = admin.firestore();
        await db.collection('resumes').doc(id).update({
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ message: 'Resume updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteResume = async (req, res) => {
    try {
        const { id } = req.params;
        const db = admin.firestore();
        await db.collection('resumes').doc(id).delete();
        res.status(200).json({ message: 'Resume deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.viewResume = async (req, res) => {
    try {
        const { id } = req.params;
        const { enterpriseId } = req.body;
        const db = admin.firestore();
        
        const resumeDoc = await db.collection('resumes').doc(id).get();
        if (!resumeDoc.exists) return res.status(404).json({ error: 'Resume not found' });
        
        const resumeData = resumeDoc.data();
        
        // Trigger Notification to User
        await db.collection('notifications').add({
            userId: resumeData.userId,
            title: '👀 Resume Viewed!',
            message: `An enterprise (ID: ${enterpriseId || 'Anonymous'}) just viewed your resume "${resumeData.name || 'Untitled'}".`,
            type: 'info',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.status(200).json({ message: 'View tracked and user notified' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
