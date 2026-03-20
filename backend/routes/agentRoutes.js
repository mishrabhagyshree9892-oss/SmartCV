const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/resume', agentController.generateResume);
router.post('/analyze-jd', agentController.analyzeJD);
router.post('/coach', agentController.interviewCoach);
router.post('/skill-gap', agentController.skillGapAnalysis);
router.post('/assessment', agentController.testAssessment);

module.exports = router;
