const Joi = require('joi');

// Schema para crear una propuesta (POST)
const createProposalSchema = Joi.object({
  projectName:         Joi.string().trim().max(100).required().messages({
    'string.empty': 'El nombre del proyecto es requerido',
    'string.max': 'El nombre no puede exceder 100 caracteres'
  }),
  proposerName:        Joi.string().trim().required().messages({
    'string.empty': 'El nombre del proponente es requerido'
  }),
  email:               Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'El correo electrónico es requerido',
    'string.email': 'Ingresa un correo electrónico válido'
  }),
  phoneCode:           Joi.string().trim().allow('').optional(),
  phoneNumber:         Joi.string().trim().allow('').optional(),
  presentationDate:    Joi.date().optional(),
  team:                Joi.string().trim().allow('').optional(),
  projectType:         Joi.string().valid('web_app','mobile','api','data','ai','other').required().messages({
    'any.only': 'Tipo de proyecto no válido'
  }),

  problemDescription:  Joi.string().min(50).required().messages({
    'string.min': 'La descripción del problema debe tener al menos 50 caracteres',
    'string.empty': 'La descripción del problema es requerida'
  }),
  targetUsers:         Joi.string().allow('').optional(),
  existingSolutions:   Joi.boolean().optional(),
  existingDetails:     Joi.string().allow('').optional(),
  urgencyLevel:        Joi.number().min(1).max(5).optional(),

  solutionDescription: Joi.string().required().messages({
    'string.empty': 'La descripción de la solución es requerida'
  }),
  techStack:           Joi.array().items(Joi.string()).optional(),
  keyFeatures:         Joi.array().items(Joi.string()).optional(),
  mvpScope:            Joi.string().allow('').optional(),

  estimatedTime:       Joi.string().valid('1_2_weeks','1_month','3_months','6_plus_months','').optional(),
  teamSize:            Joi.number().min(1).optional(),
  requiredSkills:      Joi.array().items(Joi.string()).optional(),
  identifiedRisks:     Joi.array().items(Joi.string()).optional(),
  expectedBenefit:     Joi.string().valid('high','medium','low','').optional(),
  requiresBudget:      Joi.boolean().optional(),
  budgetAmount:        Joi.number().min(0).optional()
});

// Schema para actualizar (PATCH) — todos los campos opcionales
const updateProposalSchema = Joi.object({
  status:         Joi.string().valid('pending','under_review','approved','rejected').optional(),
  evaluatorNotes: Joi.string().allow('').optional(),
  evaluatedBy:    Joi.string().allow('').optional(),
  score: Joi.object({
    impact:      Joi.number().min(0).max(5),
    feasibility: Joi.number().min(0).max(5),
    innovation:  Joi.number().min(0).max(5),
    resources:   Joi.number().min(0).max(5)
  }).optional()
});

// Middleware factory
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const messages = error.details.map(d => d.message).join('; ');
    return res.status(400).json({ success: false, message: messages });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreate: validate(createProposalSchema),
  validateUpdate: validate(updateProposalSchema)
};
