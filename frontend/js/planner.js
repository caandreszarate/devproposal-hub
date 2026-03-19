/* ============================================================
   planner.js — Generador de Plan de Proyecto (reglas estáticas)
   ============================================================ */
import { escapeHtml, getTimeLabel, getTypeLabel, getBenefitLabel } from './ui.js';

// ── MATRICES DE REGLAS ────────────────────────────────────

const ROLE_MATRIX = {
  web_app: [
    { role: 'Gerente de Proyecto',      qty: 1 },
    { role: 'Diseñador UI/UX',           qty: 1 },
    { role: 'Desarrollador Frontend',    qty: 2 },
    { role: 'Desarrollador Backend',     qty: 2 },
    { role: 'QA / Tester',              qty: 1 },
  ],
  mobile: [
    { role: 'Gerente de Proyecto',                qty: 1 },
    { role: 'Diseñador UI/UX',                    qty: 1 },
    { role: 'Desarrollador Mobile (iOS/Android)', qty: 2 },
    { role: 'Desarrollador Backend',              qty: 1 },
    { role: 'QA / Tester',                        qty: 1 },
  ],
  api: [
    { role: 'Arquitecto de Software',  qty: 1 },
    { role: 'Desarrollador Backend',   qty: 2 },
    { role: 'Ingeniero DevOps',        qty: 1 },
    { role: 'QA / Tester',             qty: 1 },
  ],
  data: [
    { role: 'Gerente de Proyecto',    qty: 1 },
    { role: 'Científico de Datos',    qty: 2 },
    { role: 'Ingeniero de Datos',     qty: 1 },
    { role: 'Analista de Datos',      qty: 1 },
    { role: 'Desarrollador Backend',  qty: 1 },
  ],
  ai: [
    { role: 'Gerente de Proyecto',               qty: 1 },
    { role: 'Científico de Datos / ML Engineer', qty: 2 },
    { role: 'Ingeniero de Datos',                qty: 1 },
    { role: 'Investigador en IA',                qty: 1 },
    { role: 'Desarrollador Backend',             qty: 1 },
  ],
  other: [
    { role: 'Gerente de Proyecto',      qty: 1 },
    { role: 'Desarrollador Full Stack', qty: 2 },
    { role: 'Diseñador UI/UX',           qty: 1 },
    { role: 'QA / Tester',              qty: 1 },
  ],
};

const TECH_ROLE_ADDITIONS = {
  'Docker':     { role: 'Ingeniero DevOps / Infraestructura', qty: 1 },
  'AWS':        { role: 'Ingeniero Cloud / DevOps',           qty: 1 },
  'Firebase':   { role: 'Ingeniero Cloud / DevOps',           qty: 1 },
  'MongoDB':    { role: 'Administrador de Base de Datos',     qty: 1 },
  'PostgreSQL': { role: 'Administrador de Base de Datos',     qty: 1 },
  'MySQL':      { role: 'Administrador de Base de Datos',     qty: 1 },
  'Redis':      { role: 'Administrador de Base de Datos',     qty: 1 },
};

const KPI_MATRIX = {
  web_app: [
    'Disponibilidad del sistema ≥ 99.5%',
    'Tiempo de carga de página < 3 segundos',
    'Tasa de adopción de usuarios ≥ 70% en los primeros 3 meses',
    'Tasa de errores en producción < 1%',
    'Net Promoter Score (NPS) ≥ 40',
    'Tiempo de respuesta de API < 500ms',
  ],
  mobile: [
    'Calificación en tiendas de aplicaciones ≥ 4.0 / 5.0',
    'Tasa de retención de usuarios al mes 1 ≥ 40%',
    'Tiempo de carga inicial de la app < 3 segundos',
    'Tasa de crashes < 0.1%',
    'Tasa de adopción ≥ 60% de usuarios objetivo en 3 meses',
  ],
  api: [
    'Latencia promedio de endpoints < 200ms',
    'Disponibilidad del servicio ≥ 99.9%',
    'Tasa de errores 5xx < 0.5%',
    'Throughput ≥ 1,000 requests por minuto',
    'Cobertura de pruebas automatizadas ≥ 80%',
    'Tiempo de despliegue < 10 minutos (CI/CD)',
  ],
  data: [
    'Precisión del modelo / análisis ≥ 85%',
    'Tiempo de procesamiento de datos < 5 minutos por lote',
    'Cobertura de datos ≥ 95% de registros requeridos',
    'Latencia de consultas < 2 segundos',
    'Reducción de tiempo en toma de decisiones ≥ 30%',
  ],
  ai: [
    'Precisión del modelo ≥ 90% en conjunto de prueba',
    'Tiempo de inferencia < 1 segundo por predicción',
    'Tasa de falsos positivos < 5%',
    'Mejora medible vs. proceso manual ≥ 40%',
    'Disponibilidad del servicio de IA ≥ 99%',
    'Reentrenamiento del modelo cada 30 días con nuevos datos',
  ],
  other: [
    'Cumplimiento de requerimientos funcionales ≥ 95%',
    'Satisfacción del usuario final ≥ 80% (encuesta post-lanzamiento)',
    'Tiempo de respuesta del sistema < 2 segundos',
    'Tasa de defectos en producción < 2%',
    'Entrega dentro del tiempo estimado (variación < 20%)',
  ],
};

const PHASE_MATRIX = {
  '1_2_weeks': [
    { name: 'Análisis y Diseño',      duration: '2–3 días',  desc: 'Levantamiento de requisitos, diseño de arquitectura y prototipos' },
    { name: 'Desarrollo y Entrega',   duration: '7–10 días', desc: 'Implementación, pruebas funcionales y despliegue' },
  ],
  '1_month': [
    { name: 'Análisis y Planificación',  duration: '1 semana',  desc: 'Requisitos, diseño de arquitectura y configuración de entorno' },
    { name: 'Desarrollo Core',           duration: '2 semanas', desc: 'Implementación de funcionalidades principales' },
    { name: 'Pruebas y Lanzamiento',     duration: '1 semana',  desc: 'QA, corrección de bugs, despliegue y documentación' },
  ],
  '3_months': [
    { name: 'Descubrimiento y Diseño',   duration: '2 semanas', desc: 'Investigación, requisitos detallados, arquitectura y diseño UX/UI' },
    { name: 'Desarrollo Sprint 1 — MVP', duration: '4 semanas', desc: 'Implementación de funcionalidades core del MVP' },
    { name: 'Desarrollo Sprint 2',       duration: '3 semanas', desc: 'Funcionalidades secundarias, integraciones y optimizaciones' },
    { name: 'Pruebas y Lanzamiento',     duration: '3 semanas', desc: 'QA integral, pruebas de usuario, despliegue y handover' },
  ],
  '6_plus_months': [
    { name: 'Iniciación y Descubrimiento',  duration: '3 semanas', desc: 'Definición de alcance, arquitectura empresarial y diseño de sistema' },
    { name: 'Desarrollo — Sprint 1',        duration: '6 semanas', desc: 'Módulos base, autenticación, estructura de datos e integraciones principales' },
    { name: 'Desarrollo — Sprint 2',        duration: '6 semanas', desc: 'Funcionalidades avanzadas, dashboards, reportes y optimizaciones' },
    { name: 'Integración y Pruebas',        duration: '4 semanas', desc: 'QA integral, pruebas de carga, seguridad y compatibilidad' },
    { name: 'Lanzamiento y Estabilización', duration: '5 semanas', desc: 'Despliegue productivo, capacitación, monitoreo y soporte inicial' },
  ],
  '': [
    { name: 'Análisis y Diseño',   duration: 'Por definir', desc: 'Levantamiento de requisitos y diseño de arquitectura' },
    { name: 'Desarrollo',          duration: 'Por definir', desc: 'Implementación de funcionalidades' },
    { name: 'Pruebas y Entrega',   duration: 'Por definir', desc: 'QA, corrección de errores y despliegue' },
  ],
};

// ── ESTADO ────────────────────────────────────────────────
const planState = {
  proposal:   null,
  evaluation: null,
  team:       [],
  phases:     [],
  kpis:       [],
};

// ── GENERAR PLAN ──────────────────────────────────────────
function generatePlan(proposal, evaluation) {
  const type     = proposal.projectType || 'other';
  const baseRoles = (ROLE_MATRIX[type] || ROLE_MATRIX.other).map(r => ({ ...r }));

  // Roles extra según stack tecnológico
  const addedNames = new Set(baseRoles.map(r => r.role));
  (proposal.techStack || []).forEach(tech => {
    const extra = TECH_ROLE_ADDITIONS[tech];
    if (extra && !addedNames.has(extra.role)) {
      baseRoles.push({ ...extra });
      addedNames.add(extra.role);
    }
  });

  planState.proposal   = proposal;
  planState.evaluation = evaluation;
  planState.team       = baseRoles;
  planState.phases     = (PHASE_MATRIX[proposal.estimatedTime] || PHASE_MATRIX['']).map(p => ({ ...p }));
  planState.kpis       = [...(KPI_MATRIX[type] || KPI_MATRIX.other)];
}

// ── ABRIR / CERRAR MODAL ──────────────────────────────────
export function openPlanModal(proposal, evaluation) {
  generatePlan(proposal, evaluation);
  renderPlanModal();
  const modal = document.getElementById('plan-modal');
  if (modal) {
    // Update title with project name
    const titleEl = document.getElementById('plan-modal-project-name');
    if (titleEl) titleEl.textContent = proposal.projectName;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

export function closePlanModal() {
  const modal = document.getElementById('plan-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// ── RENDERIZAR MODAL ──────────────────────────────────────
function renderPlanModal() {
  const body = document.getElementById('plan-modal-body');
  if (!body) return;
  const p = planState.proposal;

  body.innerHTML = `
    <!-- EQUIPO PROPUESTO -->
    <section class="plan-section">
      <div class="plan-section__header">
        <h3 class="plan-section__title">👥 Equipo propuesto</h3>
        <p class="plan-section__desc">Roles sugeridos según el tipo de proyecto y stack tecnológico. Ajusta cantidades o agrega roles personalizados.</p>
      </div>
      <div id="plan-team-list"></div>
      <button class="plan-add-btn" id="btn-add-role">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar rol
      </button>
    </section>

    <!-- PLAN DE TRABAJO -->
    <section class="plan-section">
      <div class="plan-section__header">
        <h3 class="plan-section__title">📅 Plan de trabajo</h3>
        <p class="plan-section__desc">Fases generadas según el tiempo estimado. Edita nombres y duraciones según necesites.</p>
      </div>
      <div id="plan-phases-list"></div>
      <button class="plan-add-btn" id="btn-add-phase">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar fase
      </button>
    </section>

    <!-- KPIs -->
    <section class="plan-section">
      <div class="plan-section__header">
        <h3 class="plan-section__title">📊 KPIs / Métricas de éxito</h3>
        <p class="plan-section__desc">Indicadores clave para medir el éxito del proyecto. Edita o añade métricas específicas.</p>
      </div>
      <div id="plan-kpis-list"></div>
      <button class="plan-add-btn" id="btn-add-kpi">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar KPI
      </button>
    </section>

    ${p.requiresBudget ? `
    <!-- PRESUPUESTO -->
    <section class="plan-section">
      <div class="plan-section__header">
        <h3 class="plan-section__title">💰 Presupuesto estimado</h3>
      </div>
      <div class="plan-budget-box">
        <span class="plan-budget-label">Monto total estimado</span>
        <span class="plan-budget-amount">$${(p.budgetAmount || 0).toLocaleString('es-CO')} USD</span>
      </div>
    </section>` : ''}
  `;

  renderTeamList();
  renderPhasesList();
  renderKpisList();
  setupPlanListeners();
}

// ── RENDER TEAM ───────────────────────────────────────────
function renderTeamList() {
  const container = document.getElementById('plan-team-list');
  if (!container) return;
  container.innerHTML = planState.team.map((item, i) => `
    <div class="plan-team-row" data-index="${i}">
      <span class="plan-row-num">${i + 1}</span>
      <input class="plan-input plan-input--role" type="text" value="${escapeHtml(item.role)}"
        placeholder="Nombre del rol" data-field="role" data-index="${i}" aria-label="Rol ${i + 1}">
      <div class="plan-qty-ctrl" aria-label="Cantidad">
        <button class="plan-qty-btn" data-action="dec" data-index="${i}" aria-label="Disminuir cantidad">−</button>
        <span class="plan-qty-val" id="qty-${i}">${item.qty}</span>
        <button class="plan-qty-btn" data-action="inc" data-index="${i}" aria-label="Aumentar cantidad">+</button>
      </div>
      <button class="plan-remove-btn" data-type="team" data-index="${i}" aria-label="Eliminar rol">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');
}

// ── RENDER PHASES ─────────────────────────────────────────
function renderPhasesList() {
  const container = document.getElementById('plan-phases-list');
  if (!container) return;
  container.innerHTML = planState.phases.map((ph, i) => `
    <div class="plan-phase-row" data-index="${i}">
      <div class="plan-phase-badge">Fase ${i + 1}</div>
      <div class="plan-phase-fields">
        <input class="plan-input" type="text" value="${escapeHtml(ph.name)}"
          placeholder="Nombre de la fase" data-field="name" data-phase="${i}" aria-label="Nombre fase ${i + 1}">
        <input class="plan-input plan-input--duration" type="text" value="${escapeHtml(ph.duration)}"
          placeholder="Duración" data-field="duration" data-phase="${i}" aria-label="Duración fase ${i + 1}">
        <input class="plan-input plan-input--desc" type="text" value="${escapeHtml(ph.desc)}"
          placeholder="Descripción de la fase" data-field="desc" data-phase="${i}" aria-label="Descripción fase ${i + 1}">
      </div>
      <button class="plan-remove-btn" data-type="phase" data-index="${i}" aria-label="Eliminar fase">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');
}

// ── RENDER KPIs ───────────────────────────────────────────
function renderKpisList() {
  const container = document.getElementById('plan-kpis-list');
  if (!container) return;
  container.innerHTML = planState.kpis.map((kpi, i) => `
    <div class="plan-kpi-row" data-index="${i}">
      <span class="plan-kpi-num">${i + 1}</span>
      <input class="plan-input plan-input--kpi" type="text" value="${escapeHtml(kpi)}"
        placeholder="Métrica o indicador de éxito" data-kpi="${i}" aria-label="KPI ${i + 1}">
      <button class="plan-remove-btn" data-type="kpi" data-index="${i}" aria-label="Eliminar KPI">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');
}

// ── LISTENERS DEL MODAL ───────────────────────────────────
function setupPlanListeners() {
  document.getElementById('plan-modal-close')?.addEventListener('click', closePlanModal);
  document.getElementById('plan-modal-close-footer')?.addEventListener('click', closePlanModal);
  document.getElementById('plan-modal-overlay')?.addEventListener('click', closePlanModal);
  document.getElementById('btn-download-pdf')?.addEventListener('click', downloadPDF);

  // --- Team: qty + edit + remove ---
  document.getElementById('plan-team-list')?.addEventListener('click', e => {
    const qtyBtn = e.target.closest('[data-action]');
    if (qtyBtn) {
      const i = parseInt(qtyBtn.dataset.index);
      if (qtyBtn.dataset.action === 'inc') planState.team[i].qty = Math.min(10, planState.team[i].qty + 1);
      if (qtyBtn.dataset.action === 'dec') planState.team[i].qty = Math.max(1,  planState.team[i].qty - 1);
      const el = document.getElementById(`qty-${i}`);
      if (el) el.textContent = planState.team[i].qty;
    }
    const remBtn = e.target.closest('[data-type="team"]');
    if (remBtn) {
      planState.team.splice(parseInt(remBtn.dataset.index), 1);
      renderTeamList();
    }
  });
  document.getElementById('plan-team-list')?.addEventListener('input', e => {
    const input = e.target.closest('[data-field="role"]');
    if (input) planState.team[parseInt(input.dataset.index)].role = input.value;
  });

  // --- Phases: edit + remove ---
  document.getElementById('plan-phases-list')?.addEventListener('input', e => {
    const input = e.target.closest('[data-phase]');
    if (input) planState.phases[parseInt(input.dataset.phase)][input.dataset.field] = input.value;
  });
  document.getElementById('plan-phases-list')?.addEventListener('click', e => {
    const remBtn = e.target.closest('[data-type="phase"]');
    if (remBtn) {
      planState.phases.splice(parseInt(remBtn.dataset.index), 1);
      renderPhasesList();
    }
  });

  // --- KPIs: edit + remove ---
  document.getElementById('plan-kpis-list')?.addEventListener('input', e => {
    const input = e.target.closest('[data-kpi]');
    if (input) planState.kpis[parseInt(input.dataset.kpi)] = input.value;
  });
  document.getElementById('plan-kpis-list')?.addEventListener('click', e => {
    const remBtn = e.target.closest('[data-type="kpi"]');
    if (remBtn) {
      planState.kpis.splice(parseInt(remBtn.dataset.index), 1);
      renderKpisList();
    }
  });

  // --- Add buttons ---
  document.getElementById('btn-add-role')?.addEventListener('click', () => {
    planState.team.push({ role: '', qty: 1 });
    renderTeamList();
    const inputs = document.querySelectorAll('#plan-team-list .plan-input--role');
    inputs[inputs.length - 1]?.focus();
  });
  document.getElementById('btn-add-phase')?.addEventListener('click', () => {
    planState.phases.push({ name: '', duration: '', desc: '' });
    renderPhasesList();
    const inputs = document.querySelectorAll('#plan-phases-list .plan-input');
    inputs[inputs.length - 3]?.focus();
  });
  document.getElementById('btn-add-kpi')?.addEventListener('click', () => {
    planState.kpis.push('');
    renderKpisList();
    const inputs = document.querySelectorAll('#plan-kpis-list .plan-input--kpi');
    inputs[inputs.length - 1]?.focus();
  });
}

// ── SINCRONIZAR ESTADO DESDE INPUTS ──────────────────────
function syncStateFromInputs() {
  document.querySelectorAll('#plan-team-list [data-field="role"]').forEach(input => {
    const i = parseInt(input.dataset.index);
    if (planState.team[i]) planState.team[i].role = input.value;
  });
  document.querySelectorAll('#plan-phases-list [data-phase]').forEach(input => {
    const i = parseInt(input.dataset.phase);
    if (planState.phases[i]) planState.phases[i][input.dataset.field] = input.value;
  });
  document.querySelectorAll('#plan-kpis-list [data-kpi]').forEach(input => {
    const i = parseInt(input.dataset.kpi);
    if (planState.kpis[i] !== undefined) planState.kpis[i] = input.value;
  });
}

// ── CONSTRUIR CONTENIDO DEL REPORTE PDF ──────────────────
function buildPrintContent() {
  const p   = planState.proposal;
  const now = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  const STATUS_LABELS = { pending: 'Pendiente', under_review: 'En revisión', approved: 'Aprobado', rejected: 'Rechazado' };
  const TYPE_EMOJI    = { web_app: '🌐', mobile: '📱', api: '⚡', data: '📊', ai: '🤖', other: '💡' };
  const CRITERIA      = [
    { key: 'impact',      label: 'Impacto',      icon: '🚀' },
    { key: 'feasibility', label: 'Factibilidad', icon: '⚙️' },
    { key: 'innovation',  label: 'Innovación',   icon: '💡' },
    { key: 'resources',   label: 'Recursos',     icon: '👥' },
  ];

  const scores     = p.score || {};
  const totalScore = p.score?.total || Math.round(
    ['impact','feasibility','innovation','resources']
      .reduce((s, k) => s + (scores[k] || 0), 0) * 5
  );

  const presDate    = p.presentationDate
    ? new Date(p.presentationDate + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;
  const totalPeople = planState.team.reduce((s, r) => s + r.qty, 0);

  const printEl = document.getElementById('print-report');
  if (!printEl) return;

  // Helper: sección header
  const sectionHeader = (num, title) => `
    <div class="pr-section-header">
      <div class="pr-num">${num}</div>
      <div class="pr-section-title">${title}</div>
    </div>`;

  printEl.innerHTML = `
  <div class="pr-doc">

    <!-- ══ PORTADA ══ -->
    <div class="pr-cover">
      <div class="pr-cover-top">
        <div class="pr-cover-brand">
          <img src="${base}assets/Favicon.png" class="pr-logo-img" alt="InnovaHub" style="width:44pt;height:44pt;border-radius:10pt;object-fit:cover;flex-shrink:0;">
          <div>
            <div class="pr-brand-name">Innova<span style="color:#00D4AA;">Hub</span></div>
            <div class="pr-brand-sub">WBL Inteligencia Artificial</div>
          </div>
        </div>
        <div class="pr-cover-meta">
          <div class="pr-report-label">Reporte de Proyecto</div>
          <div class="pr-report-date">${now}</div>
        </div>
      </div>

      <div class="pr-cover-title-block">
        <div class="pr-cover-eyebrow">Propuesta de Desarrollo de Software</div>
        <div class="pr-cover-project-name">${escapeHtml(p.projectName)}</div>
        <div class="pr-cover-proposer">Proponente: ${escapeHtml(p.proposerName)}${presDate ? ' &nbsp;·&nbsp; ' + presDate : ''}</div>
        <div class="pr-cover-chips">
          <span class="pr-cover-chip">${TYPE_EMOJI[p.projectType] || ''} ${getTypeLabel(p.projectType)}</span>
          <span class="pr-cover-chip">⏱ ${getTimeLabel(p.estimatedTime)}</span>
          <span class="pr-cover-chip">👥 ${p.teamSize || 1} persona${(p.teamSize || 1) > 1 ? 's' : ''}</span>
          ${p.expectedBenefit ? `<span class="pr-cover-chip">📈 Beneficio ${getBenefitLabel(p.expectedBenefit)}</span>` : ''}
          ${p.requiresBudget ? `<span class="pr-cover-chip">💰 $${(p.budgetAmount || 0).toLocaleString('es-CO')} USD</span>` : ''}
        </div>
        <div class="pr-status-cover pr-status-cover--${p.status || 'pending'}">${STATUS_LABELS[p.status] || 'Pendiente'}</div>
      </div>
    </div>

    <!-- ══ CUERPO ══ -->
    <div class="pr-body">

      <!-- SECCIÓN 1: RESUMEN -->
      <section class="pr-section">
        ${sectionHeader('01', 'Resumen de la Propuesta')}
        <table class="pr-info-table">
          <tr><td class="pr-k">Nombre del proyecto</td><td class="pr-v"><strong>${escapeHtml(p.projectName)}</strong></td></tr>
          <tr><td class="pr-k">Proponente</td><td class="pr-v">${escapeHtml(p.proposerName)}</td></tr>
          ${presDate ? `<tr><td class="pr-k">Fecha de presentación</td><td class="pr-v">${presDate}</td></tr>` : ''}
          <tr><td class="pr-k">Tipo de proyecto</td><td class="pr-v">${TYPE_EMOJI[p.projectType] || ''} ${getTypeLabel(p.projectType)}</td></tr>
          <tr><td class="pr-k">Tiempo estimado</td><td class="pr-v">${getTimeLabel(p.estimatedTime)}</td></tr>
          <tr><td class="pr-k">Equipo requerido</td><td class="pr-v">${p.teamSize || 1} persona(s)</td></tr>
          ${p.urgencyLevel ? `<tr><td class="pr-k">Urgencia</td><td class="pr-v">${p.urgencyLevel} / 5</td></tr>` : ''}
        </table>

        <div class="pr-subsection">
          <div class="pr-sub-title">Descripción del problema</div>
          <div class="pr-body-text">${escapeHtml(p.problemDescription || '—')}</div>
        </div>

        ${p.targetUsers ? `<div class="pr-subsection"><div class="pr-sub-title">Usuarios afectados</div><div class="pr-body-text">${escapeHtml(p.targetUsers)}</div></div>` : ''}

        <div class="pr-subsection">
          <div class="pr-sub-title">Solución propuesta</div>
          <div class="pr-body-text">${escapeHtml(p.solutionDescription || '—')}</div>
        </div>

        ${p.techStack?.length ? `
        <div class="pr-subsection">
          <div class="pr-sub-title">Stack tecnológico</div>
          <div class="pr-tags">${p.techStack.map(t => `<span class="pr-tag">${escapeHtml(t)}</span>`).join('')}</div>
        </div>` : ''}

        ${p.keyFeatures?.filter(Boolean).length ? `
        <div class="pr-subsection">
          <div class="pr-sub-title">Funcionalidades clave del Proyecto</div>
          <ul class="pr-list">${p.keyFeatures.filter(Boolean).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>` : ''}

        ${p.mvpScope ? `<div class="pr-subsection"><div class="pr-sub-title">Alcance del Proyecto</div><div class="pr-body-text">${escapeHtml(p.mvpScope)}</div></div>` : ''}

        ${p.identifiedRisks?.filter(Boolean).length ? `
        <div class="pr-subsection">
          <div class="pr-sub-title">Riesgos identificados</div>
          <ul class="pr-list pr-list--warning">${p.identifiedRisks.filter(Boolean).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
        </div>` : ''}
      </section>

      <!-- SECCIÓN 2: EVALUACIÓN -->
      <section class="pr-section pr-break-before">
        ${sectionHeader('02', 'Evaluación')}

        <div class="pr-scores-grid">
          ${CRITERIA.map(c => {
            const val = scores[c.key] || 0;
            return `
            <div class="pr-score-card">
              <div class="pr-score-card-header">
                <span class="pr-score-label">${c.icon} ${c.label}</span>
                <span class="pr-score-value">${val}/5</span>
              </div>
              <div class="pr-score-bar-track">
                <div class="pr-score-bar-fill" style="width:${val * 20}%"></div>
              </div>
            </div>`;
          }).join('')}
        </div>

        <div class="pr-total-score-box">
          <div>
            <div class="pr-total-label">Score Total de Evaluación</div>
            <div class="pr-total-sub">Basado en 4 criterios × 5 puntos c/u</div>
          </div>
          <div>
            <div class="pr-total-number">${totalScore}</div>
            <div class="pr-total-sub" style="text-align:right;">/ 100 pts</div>
          </div>
        </div>

        ${p.evaluatedBy ? `<div class="pr-subsection"><div class="pr-sub-title">Evaluador</div><div class="pr-body-text">${escapeHtml(p.evaluatedBy)}</div></div>` : ''}
        ${p.evaluatorNotes ? `<div class="pr-subsection"><div class="pr-sub-title">Notas del evaluador</div><div class="pr-body-text pr-notes">${escapeHtml(p.evaluatorNotes)}</div></div>` : ''}
      </section>

      <!-- SECCIÓN 3: EQUIPO -->
      <section class="pr-section">
        ${sectionHeader('03', 'Equipo Propuesto')}
        <table class="pr-data-table">
          <thead><tr><th>#</th><th>Rol</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${planState.team.map((item, i) => `
            <tr>
              <td class="pr-idx">${i + 1}</td>
              <td>${escapeHtml(item.role)}</td>
              <td class="pr-qty">${item.qty} persona${item.qty > 1 ? 's' : ''}</td>
            </tr>`).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td>Total del equipo</td>
              <td class="pr-qty">${totalPeople} persona${totalPeople !== 1 ? 's' : ''}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <!-- SECCIÓN 4: PLAN DE TRABAJO -->
      <section class="pr-section pr-break-before">
        ${sectionHeader('04', 'Plan de Trabajo')}
        <table class="pr-data-table">
          <thead><tr><th>Fase</th><th>Nombre</th><th>Duración</th><th>Descripción</th></tr></thead>
          <tbody>
            ${planState.phases.map((ph, i) => `
            <tr>
              <td class="pr-idx">Fase ${i + 1}</td>
              <td><strong>${escapeHtml(ph.name)}</strong></td>
              <td class="pr-duration">${escapeHtml(ph.duration)}</td>
              <td class="pr-desc-cell">${escapeHtml(ph.desc)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </section>

      <!-- SECCIÓN 5: KPIs -->
      <section class="pr-section">
        ${sectionHeader('05', 'KPIs / Métricas de Éxito')}
        <ul class="pr-kpi-list">
          ${planState.kpis.filter(Boolean).map((kpi, i) => `<li data-n="${i + 1}">${escapeHtml(kpi)}</li>`).join('')}
        </ul>
      </section>

      ${p.requiresBudget ? `
      <!-- SECCIÓN 6: PRESUPUESTO -->
      <section class="pr-section">
        ${sectionHeader('06', 'Presupuesto Estimado')}
        <div class="pr-budget-block">
          <span class="pr-budget-label">Monto total estimado del proyecto</span>
          <span class="pr-budget-amount">$${(p.budgetAmount || 0).toLocaleString('es-CO')} USD</span>
        </div>
      </section>` : ''}

      <!-- PIE DE PÁGINA -->
      <footer class="pr-footer">
        <span>Generado por <strong>InnovaHub</strong> — WBL Inteligencia Artificial</span>
        <span>Documento confidencial · ${now}</span>
      </footer>

    </div><!-- /.pr-body -->
  </div><!-- /.pr-doc -->`;
}

// ── DESCARGAR PDF ─────────────────────────────────────────
export function downloadPDF() {
  syncStateFromInputs();
  buildPrintContent();

  const content = document.getElementById('print-report')?.innerHTML || '';
  if (!content.trim()) {
    console.error('[Planner] print-report vacío — abortando PDF');
    return;
  }

  // Base URL para cargar print.css correctamente (GitHub Pages usa subdirectorio)
  const base = new URL('.', document.baseURI).href;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Permite las ventanas emergentes en este sitio para descargar el PDF.');
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Plan de Proyecto — InnovaHub</title>
  <link rel="stylesheet" href="${base}styles/print.css">
  <style>
    body { margin: 0; background: #fff; }
    #print-report { display: block !important; }
  </style>
</head>
<body>
  <div id="print-report">${content}</div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
    });
  <\/script>
</body>
</html>`);
  win.document.close();
}
