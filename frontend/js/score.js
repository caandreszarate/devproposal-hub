/* ============================================================
   score.js — Cálculo de scores en el frontend
   ============================================================ */

/**
 * Calcula score de completitud (0–100) basado en los campos del formulario.
 * Espejo del cálculo en el backend (scoreCalculator.js).
 */
export function calcCompleteness(data) {
  const weights = {
    problemDescription:  15,
    solutionDescription: 15,
    keyFeatures:         10,
    techStack:           10,
    mvpScope:            10,
    identifiedRisks:     10,
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
 * Calcula score de viabilidad (0–100).
 */
export function calcViability(data) {
  const benefitMap = { high: 100, medium: 60, low: 30 };
  const timeMap = {
    '1_2_weeks': 100, '1_month': 80,
    '3_months': 60, '6_plus_months': 30
  };

  const benefitScore  = (benefitMap[data.expectedBenefit] || 0) * 0.30;
  const timeScore     = (timeMap[data.estimatedTime] || 0) * 0.25;
  const urgencyScore  = ((data.urgencyLevel || 0) * 20) * 0.20;
  const riskCount     = Array.isArray(data.identifiedRisks) ? data.identifiedRisks.length : 0;
  const riskScore     = Math.max(0, 100 - riskCount * 15) * 0.15;
  const budgetScore   = (data.requiresBudget ? 50 : 100) * 0.10;

  return Math.round(benefitScore + timeScore + urgencyScore + riskScore + budgetScore);
}

/**
 * Calcula score total de evaluación (0–100).
 */
export function calcEvaluationTotal(scores) {
  const { impact = 0, feasibility = 0, innovation = 0, resources = 0 } = scores;
  const weighted =
    (impact * 0.35) + (feasibility * 0.30) +
    (innovation * 0.20) + (resources * 0.15);
  return Math.round((weighted / 5) * 100);
}

/**
 * Retorna la clase CSS del color basada en el score.
 */
export function getScoreColorClass(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Retorna el color CSS variable basado en el score.
 */
export function getScoreColor(score) {
  if (score >= 70) return 'var(--color-success)';
  if (score >= 40) return 'var(--color-warning)';
  return 'var(--color-error)';
}

/**
 * Retorna una etiqueta descriptiva del score.
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excelente';
  if (score >= 70) return 'Muy bueno';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Regular';
  if (score >= 20) return 'Bajo';
  return 'Incompleto';
}

/**
 * Retorna el HTML de un badge de score.
 */
export function getScoreBadgeHTML(score, label = '') {
  const cls = getScoreColorClass(score);
  return `<span class="badge badge-score-${cls}">${label || getScoreLabel(score)} ${score}%</span>`;
}

/**
 * Anima un número contando desde 0 hasta el valor objetivo.
 */
export function animateNumber(element, target, duration = 800) {
  const start    = performance.now();
  const initial  = parseInt(element.textContent) || 0;

  const update = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const value    = Math.round(initial + (target - initial) * eased);
    element.textContent = value;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
