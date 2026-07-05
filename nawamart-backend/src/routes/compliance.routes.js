const express = require('express');
const router = express.Router();
const {
  recordConsent, getConsentHistory, getConsentTypes,
  requestDataExport, requestDataDeletion, getDataRequests, getDataRequestById, downloadExport,
  getLegalPages, createLegalPage, updateLegalPage, generateFromTemplate,
  getStoreLegalPageTypes, getLegalPageTypes,
} = require('../controllers/compliance.controller');
const { verifyToken, requireRole } = require('../middleware/verifyToken');

// ─── Public routes ────────────────────────────────────────────────────────────

router.post('/consent', recordConsent);
router.get('/consent/types', getConsentTypes);
router.get('/legal-types', getLegalPageTypes);

// ─── Consent (authenticated) ─────────────────────────────────────────────────

router.get('/consent/history', verifyToken, getConsentHistory);

// ─── Data Requests (GDPR/CCPA) ────────────────────────────────────────────────

router.post('/data/export', verifyToken, requestDataExport);
router.post('/data/deletion', verifyToken, requestDataDeletion);
router.get('/data/requests', verifyToken, getDataRequests);
router.get('/data/requests/:id', verifyToken, getDataRequestById);
router.get('/data/export/:id/download', verifyToken, downloadExport);

// ─── Legal Pages (Merchant) ──────────────────────────────────────────────────

router.get('/pages/:storeId', verifyToken, requireRole('merchant'), getLegalPages);
router.get('/pages/:storeId/published', getStoreLegalPageTypes);
router.post('/pages/:storeId', verifyToken, requireRole('merchant'), createLegalPage);
router.post('/pages/:storeId/from-template', verifyToken, requireRole('merchant'), generateFromTemplate);
router.put('/pages/:id', verifyToken, requireRole('merchant'), updateLegalPage);

module.exports = router;
