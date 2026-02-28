const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { generateTOC, generateChapter } = require('../controllers/aiController');

router.post('/generate-toc',     auth, generateTOC);
router.post('/generate-chapter', auth, generateChapter);

module.exports = router;

