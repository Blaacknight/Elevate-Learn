const express = require('express');
const router = express.Router();
const protect = require('../middlewares/auth');
const { checkCertificateEligibility, downloadCertificate } = require('../controllers/certificate.controller');

router.get('/:courseId/eligibility', protect, checkCertificateEligibility);
router.get('/:courseId/download', protect, downloadCertificate);

module.exports = router;
