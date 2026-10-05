const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus
} = require('../controllers/applicationController');

// Middleware wrapper to catch and format Multer errors
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('document');
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading document'
      });
    }
    next();
  });
};

// Application API routes
router.post('/', handleUpload, createApplication);
router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.put('/:id/status', updateApplicationStatus);

module.exports = router;
