const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/ebookController');

router.post('/',           auth, ctrl.createEbook);
router.get('/',            auth, ctrl.getEbooks);
router.get('/:id',         auth, ctrl.getEbook);
router.put('/:id/chapter', auth, ctrl.updateChapter);
router.delete('/:id',      auth, ctrl.deleteEbook);
router.get('/:id/export',  auth, ctrl.exportPDF);

module.exports = router;

