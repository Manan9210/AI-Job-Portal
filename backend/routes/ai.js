const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  analyzeResume,
  getMatchScore,
  generateCoverLetter,
  generateJobDescription,
} = require('../controllers/aiController');

router.post('/analyze-resume', protect, analyzeResume);
router.post('/match-score', protect, getMatchScore);
router.post('/cover-letter', protect, generateCoverLetter);
router.post('/job-description', protect, generateJobDescription);

module.exports = router;
