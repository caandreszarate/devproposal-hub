const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  completeness: { type: Number, min: 0, max: 100, default: 0 },
  viability:    { type: Number, min: 0, max: 100, default: 0 },
  impact:       { type: Number, min: 1, max: 5 },
  feasibility:  { type: Number, min: 1, max: 5 },
  innovation:   { type: Number, min: 1, max: 5 },
  resources:    { type: Number, min: 1, max: 5 },
  total:        { type: Number, min: 0, max: 100, default: 0 }
}, { _id: false });

const proposalSchema = new mongoose.Schema({
  // === Identificación ===
  projectName:       { type: String, required: true, trim: true, maxlength: 100 },
  proposerName:      { type: String, required: true, trim: true },
  email:             { type: String, required: true, trim: true, lowercase: true },
  phoneCode:         { type: String, trim: true, default: '' },
  phoneNumber:       { type: String, trim: true, default: '' },
  presentationDate:  { type: Date },
  team:              { type: String, trim: true, default: '' },
  projectType:       {
    type: String,
    enum: ['web_app', 'mobile', 'api', 'data', 'ai', 'other'],
    required: true
  },

  // === Problema ===
  problemDescription: { type: String, required: true, minlength: 50 },
  targetUsers:        { type: String, default: '' },
  existingSolutions:  { type: Boolean, default: false },
  existingDetails:    { type: String, default: '' },
  urgencyLevel:       { type: Number, min: 1, max: 5, default: 3 },

  // === Solución ===
  solutionDescription: { type: String, required: true },
  techStack:           [{ type: String }],
  keyFeatures:         [{ type: String }],
  mvpScope:            { type: String, default: '' },

  // === Viabilidad ===
  estimatedTime:   {
    type: String,
    enum: ['1_2_weeks', '1_month', '3_months', '6_plus_months', ''],
    default: ''
  },
  teamSize:        { type: Number, min: 1, default: 1 },
  requiredSkills:  [{ type: String }],
  identifiedRisks: [{ type: String }],
  expectedBenefit: { type: String, enum: ['high', 'medium', 'low', ''], default: '' },
  requiresBudget:  { type: Boolean, default: false },
  budgetAmount:    { type: Number, default: 0 },

  // === Estado y evaluación ===
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  score:          { type: scoreSchema, default: () => ({}) },
  evaluatorNotes: { type: String, default: '' },
  evaluatedBy:    { type: String, default: '' },
  evaluatedAt:    { type: Date }

}, {
  timestamps: true
});

// Índices para búsqueda y filtrado eficiente
proposalSchema.index({ status: 1, createdAt: -1 });
proposalSchema.index({ projectType: 1 });
proposalSchema.index({ projectName: 'text', proposerName: 'text' });

module.exports = mongoose.model('Proposal', proposalSchema);
