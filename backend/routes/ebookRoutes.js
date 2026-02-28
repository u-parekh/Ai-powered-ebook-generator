/*const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/ebookController');

router.post('/',           auth, ctrl.createEbook);
router.get('/',            auth, ctrl.getEbooks);
router.get('/:id',         auth, ctrl.getEbook);
router.put('/:id/chapter', auth, ctrl.updateChapter);
router.delete('/:id',      auth, ctrl.deleteEbook);
router.get('/:id/export',  auth, ctrl.exportPDF);

module.exports = router;
*/


const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/ebookController');
const multer = require('multer');
const path = require('path');

// Multer config for cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    require('fs').mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
});

router.post('/',              auth, upload.single('coverImage'), ctrl.createEbook);
router.get('/',               auth, ctrl.getEbooks);
router.get('/:id',            auth, ctrl.getEbook);
router.put('/:id/chapter',    auth, ctrl.updateChapter);
router.delete('/:id',         auth, ctrl.deleteEbook);
router.get('/:id/export/pdf', auth, ctrl.exportPDF);
router.get('/:id/export/docx',auth, ctrl.exportDOCX);

module.exports = router;
