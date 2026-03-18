/**
 * Calcula el score de completitud de una propuesta (0–100)
 * Basado en el peso de cada campo según spec.md
 */
function calcCompleteness(data) {
  const weights = {
    problemDescription:  15,
    solutionDescription: 15,
    keyFeatures:         10,  // array con al menos 1 item
    techStack:           10,  // array con al menos 1 item
    mvpScope:            10,
    identifiedRisks:     10,  // array con al menos 1 item
    estimatedTime:       10,
    teamSize:             5,
    targetUsers:         10,
    urgencyLevel:         5
  };

  let total = 0;
  for (const [field, weight] of Object.entries(weights)) {
    const val = data[field];
    if (Array.isArray(val) && val.length > 0) {
      total += weight;
    } else if (val !== undefined && val !== null && val !== '' && val !== 0) {
      total += weight;
    }
  }
  return Math.round(total);
}

/**
 * Calcula el score de viabilidad de una propuesta (0–100)
 * Basado en los campos de viabilidad según spec.md
 */
function calcViability(data) {
  let score = 0;

  // Beneficio esperado (30%)
  const benefitMap = { high: 100, medium: 60, low: 30 };
  const benefitScore = (benefitMap[data.expectedBenefit] || 0) * 0.30;

  // Tiempo estimado (25%)
  const timeMap = {
    '1_2_weeks': 100,
    '1_month': 80,
    '3_months': 60,
    '6_plus_months': 30
  };
  const timeScore = (timeMap[data.estimatedTime] || 0) * 0.25;

  // Urgencia (20%)
  const urgencyScore = ((data.urgencyLevel || 0) * 20) * 0.20;

  // Riesgos (15%) — menos riesgos = mejor score
  const riskCount = Array.isArray(data.identifiedRisks) ? data.identifiedRisks.length : 0;
  const riskScore = Math.max(0, 100 - riskCount * 15) * 0.15;

  // Presupuesto (10%)
  const budgetScore = (data.requiresBudget ? 50 : 100) * 0.10;

  score = benefitScore + timeScore + urgencyScore + riskScore + budgetScore;
  return Math.round(score);
}

/**
 * Calcula el score total de evaluación (0–100)
 * Ponderado por criterio según spec.md
 */
function calcEvaluationTotal(scores) {
  const { impact = 0, feasibility = 0, innovation = 0, resources = 0 } = scores;
  const weighted =
    (impact * 0.35) +
    (feasibility * 0.30) +
    (innovation * 0.20) +
    (resources * 0.15);
  return Math.round((weighted / 5) * 100);
}

module.exports = { calcCompleteness, calcViability, calcEvaluationTotal };
