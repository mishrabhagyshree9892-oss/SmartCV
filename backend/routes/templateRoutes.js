const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

router.get('/', templateController.getAllTemplates);
router.get('/:id', templateController.getTemplateById);
router.post('/notify-new', templateController.notifyNewTemplate);
router.post('/check-updates', templateController.checkUpdates);

module.exports = router;
