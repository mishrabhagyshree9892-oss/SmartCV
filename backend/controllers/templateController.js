const admin = require('firebase-admin');

const templates = [
    {
        id: 'professional-01',
        name: 'Professional Slate',
        category: 'Professional',
        hasPhoto: false,
        hasGraphics: false,
        columns: 1,
        recommended: true,
        previewImage: '/templates/professional-01.png',
        description: 'A clean, minimalist 1-column layout for experienced professionals.'
    },
    {
        id: 'modern-02',
        name: 'Modern Edge',
        category: 'Modern',
        hasPhoto: true,
        hasGraphics: true,
        columns: 2,
        recommended: false,
        previewImage: '/templates/modern-02.png',
        description: 'A stylish 2-column layout with a side profile photo and skills bars.'
    },
    {
        id: 'creative-03',
        name: 'Creative Impact',
        category: 'Creative',
        hasPhoto: true,
        hasGraphics: true,
        columns: 1,
        recommended: true,
        previewImage: '/templates/creative-03.png',
        description: 'Bold typography and icons for designers and artists.'
    },
    {
        id: 'executive-04',
        name: 'Executive Classic',
        category: 'Professional',
        hasPhoto: false,
        hasGraphics: false,
        columns: 1,
        recommended: false,
        previewImage: '/templates/executive-04.png',
        description: 'Traditional serif-based design for C-suite roles.'
    },
    {
        id: 'minimal-05',
        name: 'Minimalist Airy',
        category: 'Modern',
        hasPhoto: false,
        hasGraphics: false,
        columns: 1,
        recommended: false,
        previewImage: '/templates/minimal-05.png',
        description: 'Maximum whitespace for a high-end feel.'
    },
    {
        id: 'grid-06',
        name: 'Grid Master',
        category: 'Creative',
        hasPhoto: true,
        hasGraphics: true,
        columns: 2,
        recommended: false,
        previewImage: '/templates/grid-06.png',
        description: 'Structured grid layout for technical project managers.'
    }
];

exports.getAllTemplates = (req, res) => {
    res.status(200).json(templates);
};

exports.getTemplateById = (req, res) => {
    const { id } = req.params;
    const template = templates.find(t => t.id === id);
    if (template) {
        res.status(200).json(template);
    } else {
        res.status(404).json({ message: 'Template not found' });
    }
};

exports.notifyNewTemplate = async (req, res) => {
    try {
        const { templateId } = req.body;
        const db = admin.firestore();
        
        // Notify all users (or general broadcast)
        await db.collection('notifications').add({
            userId: 'broadcast',
            title: '✨ New Template Added!',
            message: `Checkout our latest resume template: "${templateId}".`,
            type: 'info',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.status(200).json({ message: 'Template notification broadcasted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkUpdates = async (req, res) => {
    try {
        const db = admin.firestore();
        // Mocking a system update notification
        await db.collection('notifications').add({
            userId: 'broadcast',
            title: '🚀 System Update',
            message: 'SmartCV version 2.0 is now live with Dark Mode and real-time notifications!',
            type: 'success',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ message: 'System update notification triggered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
