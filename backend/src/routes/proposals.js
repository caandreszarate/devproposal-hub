const express   = require('express');
const rateLimit = require('express-rate-limit');
const router    = express.Router();
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  exportProposals,
  getStats
} = require('../controllers/proposalController');
const {
  validateCreate,
  validateUpdate,
  validateObjectId,
  requireAdminKey
} = require('../middleware/validation');

// Rate limiters por operación
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10,
  message: { success: false, message: 'Límite de envíos alcanzado. Intenta en 1 minuto.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 50,
  message: { success: false, message: 'Demasiadas operaciones. Intenta en 15 minutos.' }
});

// Estadísticas (antes de /:id)
router.get('/stats',  getStats);

// Exportación protegida con admin key (antes de /:id)
router.get('/export', adminLimiter, requireAdminKey, exportProposals);

// CRUD principal
router.post('/',      writeLimiter, validateCreate, createProposal);
router.get('/',       getProposals);
router.get('/:id',    validateObjectId, getProposalById);
router.patch('/:id',  adminLimiter, validateObjectId, validateUpdate, updateProposal);
router.delete('/:id', adminLimiter, validateObjectId, requireAdminKey, deleteProposal);

module.exports = router;
