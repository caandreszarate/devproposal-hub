const Proposal = require('../models/Proposal');
const { calcCompleteness, calcViability, calcEvaluationTotal } = require('../utils/scoreCalculator');

// POST /api/proposals
const createProposal = async (req, res, next) => {
  try {
    const data = req.body;
    const completeness = calcCompleteness(data);
    const viability    = calcViability(data);

    const proposal = await Proposal.create({
      ...data,
      score: { completeness, viability, total: 0 }
    });

    res.status(201).json({
      success: true,
      message: 'Propuesta creada exitosamente',
      data: proposal
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/proposals
const getProposals = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 12);
    const skip   = (page - 1) * limit;

    // Whitelist de estados y tipos válidos
    const VALID_STATUSES = ['pending', 'under_review', 'approved', 'rejected'];
    const VALID_TYPES    = ['web_app', 'mobile', 'api', 'data', 'ai', 'other'];
    const VALID_SORT     = ['createdAt', 'updatedAt', 'projectName', 'score.viability', 'score.total'];

    const filter = {};
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.type && VALID_TYPES.includes(req.query.type)) {
      filter.projectType = req.query.type;
    }
    if (req.query.search) {
      // Limitar longitud de búsqueda y escapar regex
      const raw     = String(req.query.search).slice(0, 100);
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { projectName:  new RegExp(escaped, 'i') },
        { proposerName: new RegExp(escaped, 'i') },
      ];
    }

    // Whitelist del campo de ordenamiento
    const sortField = VALID_SORT.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const [proposals, total] = await Promise.all([
      Proposal.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Proposal.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: proposals,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/proposals/export  (debe ir ANTES de /:id)
const exportProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({}).lean();
    res.setHeader('Content-Disposition', 'attachment; filename="proposals.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json(proposals);
  } catch (err) {
    next(err);
  }
};

// GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const [byStatus, byType, totals, recent] = await Promise.all([
      Proposal.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Proposal.aggregate([{ $group: { _id: '$projectType', count: { $sum: 1 } } }]),
      Proposal.aggregate([{
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgViability: { $avg: '$score.viability' },
          avgCompleteness: { $avg: '$score.completeness' }
        }
      }]),
      Proposal.find({}).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    const byStatusObj = {};
    byStatus.forEach(s => { byStatusObj[s._id] = s.count; });

    const byTypeObj = {};
    byType.forEach(t => { byTypeObj[t._id] = t.count; });

    const summary = totals[0] || { total: 0, avgViability: 0, avgCompleteness: 0 };

    res.json({
      success: true,
      data: {
        total: summary.total,
        byStatus: byStatusObj,
        byType: byTypeObj,
        avgViabilityScore: Math.round(summary.avgViability || 0),
        avgCompleteness:   Math.round(summary.avgCompleteness || 0),
        recentProposals: recent
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/proposals/:id
const getProposalById = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id).lean();
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Propuesta no encontrada' });
    }
    res.json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/proposals/:id
const updateProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Propuesta no encontrada' });
    }

    const { status, evaluatorNotes, evaluatedBy, score } = req.body;

    if (status)         proposal.status         = status;
    if (evaluatorNotes !== undefined) proposal.evaluatorNotes = evaluatorNotes;
    if (evaluatedBy)    proposal.evaluatedBy    = evaluatedBy;

    if (score) {
      proposal.score.impact      = score.impact      ?? proposal.score.impact;
      proposal.score.feasibility = score.feasibility ?? proposal.score.feasibility;
      proposal.score.innovation  = score.innovation  ?? proposal.score.innovation;
      proposal.score.resources   = score.resources   ?? proposal.score.resources;
      proposal.score.total       = calcEvaluationTotal({
        impact:      proposal.score.impact,
        feasibility: proposal.score.feasibility,
        innovation:  proposal.score.innovation,
        resources:   proposal.score.resources
      });
      proposal.evaluatedAt = new Date();
    }

    await proposal.save();
    res.json({ success: true, message: 'Propuesta actualizada', data: proposal });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/proposals/:id — auth ya verificada por requireAdminKey en el router
const deleteProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Propuesta no encontrada' });
    }

    res.json({ success: true, message: 'Propuesta eliminada correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProposal,
  getProposals,
  getProposalById,
  updateProposal,
  deleteProposal,
  exportProposals,
  getStats
};
