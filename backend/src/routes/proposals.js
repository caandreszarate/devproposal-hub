const express = require('express');
const router  = express.Router();
const {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  exportProposals,
  getStats
} = require('../controllers/proposalController');
const { validateCreate, validateUpdate } = require('../middleware/validation');

// Ruta de estadísticas (antes de /:id para evitar colisión)
router.get('/stats',  getStats);

// Exportación masiva (antes de /:id)
router.get('/export', exportProposals);

// CRUD principal
router.post('/',     validateCreate, createProposal);
router.get('/',      getProposals);
router.get('/:id',   getProposalById);
router.patch('/:id', validateUpdate, updateProposal);
router.delete('/:id', deleteProposal);

module.exports = router;
