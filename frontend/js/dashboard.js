/* ============================================================
   dashboard.js — Carga, render y filtros del dashboard
   ============================================================ */
import { getProposals, getStats, deleteProposal, updateProposal, exportProposals } from './api.js';
import { PIN } from './evaluator.js';
import {
  showSkeletons, renderEmptyState, renderErrorState,
  openModal, showToast, formatDate, formatDateRelative,
  getStatusBadgeHTML, getTypeLabel, getTypeEmoji, getTimeLabel,
  getBenefitLabel, escapeHtml, debounce
} from './ui.js';
import { getScoreColor, getScoreColorClass, getScoreLabel, animateNumber } from './score.js';

// Estado del dashboard
const dashState = {
  page: 1, limit: 12, total: 0, totalPages: 1,
  filters: { status: '', type: '', search: '' }
};

// ── INIT ──────────────────────────────────────────────────
export function initDashboard() {
  handleFilters();
  loadProposals();
  loadStats();

  // Recargar cuando se crea una propuesta
  document.addEventListener('proposalCreated', () => {
    dashState.page = 1;
    loadProposals();
    loadStats();
  });
}

// ── CARGAR PROPUESTAS ──────────────────────────────────────
export async function loadProposals(resetPage = false) {
  if (resetPage) dashState.page = 1;

  const grid = document.getElementById('proposals-grid');
  if (!grid) return;

  showSkeletons(grid, dashState.limit);

  try {
    const res = await getProposals({
      page:   dashState.page,
      limit:  dashState.limit,
      status: dashState.filters.status,
      type:   dashState.filters.type,
      search: dashState.filters.search
    });

    dashState.total      = res.total;
    dashState.totalPages = res.totalPages;

    updateCountLabel(res.total);

    if (!res.data || res.data.length === 0) {
      renderEmptyState(
        grid,
        'No hay propuestas',
        dashState.filters.search || dashState.filters.status || dashState.filters.type
          ? 'No se encontraron propuestas con los filtros aplicados. Intenta una búsqueda diferente.'
          : 'Aún no hay propuestas. ¡Sé el primero en proponer un proyecto!',
        `<button class="btn btn-primary btn-sm" onclick="document.getElementById('form-section').scrollIntoView({behavior:'smooth'})">
           Proponer ahora
         </button>`
      );
    } else {
      grid.innerHTML = res.data.map(renderProposalCard).join('');
      grid.querySelectorAll('.proposal-card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.dataset.id;
          const proposal = res.data.find(p => p._id === id);
          if (proposal) renderProposalModal(proposal);
        });
      });
    }

    renderPagination();
  } catch (err) {
    renderErrorState(grid, err.message, () => loadProposals());
  }
}

// ── RENDER: CARD ──────────────────────────────────────────
export function renderProposalCard(p) {
  const viability  = p.score?.viability || 0;
  const colorClass = getScoreColorClass(viability);
  const initials   = (p.proposerName || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return `
    <article class="proposal-card card" data-id="${p._id}" data-status="${p.status}"
      role="button" tabindex="0" aria-label="Ver propuesta: ${escapeHtml(p.projectName)}"
      onkeydown="if(event.key==='Enter'||event.key===' ')this.click()">
      <div class="proposal-card__header">
        <div class="proposal-card__type-icon" aria-hidden="true">${getTypeEmoji(p.projectType)}</div>
        <div>
          <h4 class="proposal-card__title">${escapeHtml(p.projectName)}</h4>
        </div>
        ${getStatusBadgeHTML(p.status)}
      </div>
      <div class="proposal-card__meta">
        <div class="proposal-card__proposer">
          <div class="proposer-avatar" aria-hidden="true">${initials}</div>
          <span>${escapeHtml(p.proposerName)}</span>
        </div>
        <span class="badge" style="background:var(--bg-elevated);color:var(--text-muted);font-size:11px;">${getTypeLabel(p.projectType)}</span>
      </div>
      ${p.problemDescription ? `
        <p class="proposal-card__problem">${escapeHtml(p.problemDescription.substring(0, 120))}${p.problemDescription.length > 120 ? '...' : ''}</p>
      ` : ''}
      <div class="proposal-card__footer">
        <span class="proposal-card__date">${formatDateRelative(p.createdAt)}</span>
        <div class="proposal-card__scores">
          <span class="score-pill viability" title="Score de viabilidad">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            ${viability}%
          </span>
          ${p.score?.total ? `<span class="score-pill" style="background:var(--color-secondary-glow);color:var(--color-secondary);" title="Score de evaluación">★ ${p.score.total}%</span>` : ''}
        </div>
      </div>
    </article>`;
}

// ── RENDER: MODAL DE DETALLE ───────────────────────────────
export function renderProposalModal(p) {
  const completeness = p.score?.completeness || 0;
  const viability    = p.score?.viability    || 0;
  const total        = p.score?.total        || 0;

  const bodyHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4);margin-bottom:var(--space-6);">
      ${renderScoreBar('Completitud', completeness)}
      ${renderScoreBar('Viabilidad',  viability)}
      ${total ? renderScoreBar('Evaluación', total) : '<div></div>'}
    </div>

    <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-bottom:var(--space-6);">
      ${getStatusBadgeHTML(p.status)}
      <span class="badge" style="background:var(--bg-elevated);color:var(--text-secondary);">
        ${getTypeEmoji(p.projectType)} ${getTypeLabel(p.projectType)}
      </span>
      <span class="badge" style="background:var(--bg-elevated);color:var(--text-muted);font-family:var(--font-mono);font-size:11px;">
        ${formatDate(p.createdAt)}
      </span>
    </div>

    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Proponente</div>
      <div class="proposal-detail__value">${escapeHtml(p.proposerName)}</div>
    </div>

    ${p.presentationDate ? `
    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Fecha de presentación</div>
      <div class="proposal-detail__value">${new Date(p.presentationDate + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>` : ''}

    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Problema</div>
      <div class="proposal-detail__value" style="white-space:pre-wrap;">${escapeHtml(p.problemDescription)}</div>
    </div>

    ${p.targetUsers ? `
    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Usuarios afectados</div>
      <div class="proposal-detail__value">${escapeHtml(p.targetUsers)}</div>
    </div>` : ''}

    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Solución propuesta</div>
      <div class="proposal-detail__value" style="white-space:pre-wrap;">${escapeHtml(p.solutionDescription)}</div>
    </div>

    ${p.techStack?.length ? `
    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Stack tecnológico</div>
      <div class="proposal-detail__tags">${p.techStack.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
    </div>` : ''}

    ${p.keyFeatures?.length ? `
    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Funcionalidades clave</div>
      <ul style="padding-left:1rem;display:flex;flex-direction:column;gap:var(--space-1);">
        ${p.keyFeatures.map(f => `<li style="color:var(--text-secondary);font-size:var(--text-sm);list-style:disc;">${escapeHtml(f)}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${p.mvpScope ? `
    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Alcance MVP</div>
      <div class="proposal-detail__value">${escapeHtml(p.mvpScope)}</div>
    </div>` : ''}

    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Viabilidad</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);">
        <div><span style="color:var(--text-muted);font-size:12px;">Tiempo:</span> <strong>${getTimeLabel(p.estimatedTime)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:12px;">Equipo:</span> <strong>${p.teamSize || 1} persona(s)</strong></div>
        <div><span style="color:var(--text-muted);font-size:12px;">Beneficio:</span> <strong>${getBenefitLabel(p.expectedBenefit)}</strong></div>
        <div><span style="color:var(--text-muted);font-size:12px;">Urgencia:</span> <strong>${p.urgencyLevel}/5</strong></div>
        <div><span style="color:var(--text-muted);font-size:12px;">Presupuesto:</span> <strong>${p.requiresBudget ? `Sí · $${p.budgetAmount || 0} USD` : 'No requiere'}</strong></div>
      </div>
    </div>

    ${p.identifiedRisks?.length ? `
    <div class="proposal-detail__section">
      <div class="proposal-detail__label">Riesgos identificados</div>
      <ul style="padding-left:1rem;display:flex;flex-direction:column;gap:var(--space-1);">
        ${p.identifiedRisks.map(r => `<li style="color:var(--color-warning);font-size:var(--text-sm);list-style:disc;">${escapeHtml(r)}</li>`).join('')}
      </ul>
    </div>` : ''}

    ${p.evaluatorNotes ? `
    <div class="proposal-detail__section" style="background:var(--bg-elevated);padding:var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--border-color);">
      <div class="proposal-detail__label">📝 Notas del evaluador ${p.evaluatedBy ? `— ${escapeHtml(p.evaluatedBy)}` : ''}</div>
      <div class="proposal-detail__value" style="white-space:pre-wrap;">${escapeHtml(p.evaluatorNotes)}</div>
    </div>` : ''}
  `;

  const statusLabels = { under_review: 'En revisión', approved: 'Aprobada', rejected: 'Rechazada' };

  const footerHTML = `
    <!-- Botones normales -->
    <div id="modal-footer-actions" style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;width:100%;">
      <button class="btn btn-pdf btn-sm" id="modal-btn-pdf" aria-label="Exportar propuesta a PDF">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Descargar PDF
      </button>
      <div style="margin-left:auto;display:flex;gap:var(--space-2);flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm eval-action-btn" data-proposal-id="${p._id}" data-new-status="under_review">🔵 En revisión</button>
        <button class="btn btn-success btn-sm eval-action-btn" data-proposal-id="${p._id}" data-new-status="approved">✅ Aprobar</button>
        <button class="btn btn-danger btn-sm eval-action-btn"  data-proposal-id="${p._id}" data-new-status="rejected">❌ Rechazar</button>
        <button class="btn btn-primary btn-sm" id="modal-btn-close">Cerrar</button>
      </div>
    </div>

    <!-- Formulario PIN (oculto hasta que se pulse un botón de estado) -->
    <div id="modal-pin-form" style="display:none;width:100%;">
      <div style="background:var(--bg-elevated);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:var(--space-4) var(--space-5);">
        <p id="modal-pin-label" style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);margin-bottom:var(--space-3);"></p>
        <div style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;">
          <input id="modal-pin-input" type="password" class="form-control" placeholder="PIN de evaluador"
            maxlength="20" autocomplete="off"
            style="flex:1;min-width:160px;letter-spacing:0.15em;font-size:var(--text-sm);">
          <p id="modal-pin-error" style="display:none;width:100%;font-size:var(--text-xs);color:var(--color-error);margin-top:var(--space-1);"></p>
          <button class="btn btn-primary btn-sm" id="modal-pin-confirm">Confirmar</button>
          <button class="btn btn-ghost btn-sm" id="modal-pin-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  `;

  const overlay = openModal(escapeHtml(p.projectName), bodyHTML, footerHTML);

  // PDF export
  overlay.querySelector('#modal-btn-pdf')?.addEventListener('click', () => exportProposalPDF(p));

  const actionsDiv = overlay.querySelector('#modal-footer-actions');
  const pinForm    = overlay.querySelector('#modal-pin-form');
  const pinInput   = overlay.querySelector('#modal-pin-input');
  const pinLabel   = overlay.querySelector('#modal-pin-label');
  const pinError   = overlay.querySelector('#modal-pin-error');

  let pendingStatus   = null;
  let pendingProposalId = null;

  // Cerrar
  overlay.querySelector('#modal-btn-close')?.addEventListener('click', () => {
    import('./ui.js').then(({ closeModal }) => closeModal());
  });

  // Botones de estado → mostrar formulario PIN
  const actionIcons = { under_review: '🔵', approved: '✅', rejected: '❌' };
  overlay.querySelectorAll('.eval-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pendingStatus    = btn.dataset.newStatus;
      pendingProposalId = btn.dataset.proposalId;
      pinLabel.textContent = `${actionIcons[pendingStatus]} Confirmar acción: marcar como "${statusLabels[pendingStatus]}"`;
      pinError.style.display = 'none';
      pinError.textContent   = '';
      pinInput.value = '';
      actionsDiv.style.display = 'none';
      pinForm.style.display    = 'block';
      pinInput.focus();
    });
  });

  // Cancelar → volver a los botones
  overlay.querySelector('#modal-pin-cancel')?.addEventListener('click', () => {
    pinForm.style.display    = 'none';
    actionsDiv.style.display = 'flex';
    pendingStatus = null;
  });

  // Confirmar PIN (botón o Enter)
  const confirmAction = async () => {
    if (!pendingStatus) return;

    if (pinInput.value !== PIN) {
      pinError.textContent   = 'PIN incorrecto. Inténtalo de nuevo.';
      pinError.style.display = 'block';
      pinInput.value = '';
      pinInput.focus();
      return;
    }

    const confirmBtn = overlay.querySelector('#modal-pin-confirm');
    confirmBtn.disabled    = true;
    confirmBtn.textContent = 'Guardando...';

    try {
      await updateProposal(pendingProposalId, { status: pendingStatus });
      showToast(`Propuesta marcada como: ${statusLabels[pendingStatus]}`, 'success');
      import('./ui.js').then(({ closeModal }) => closeModal());
      loadProposals();
      loadStats();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
      confirmBtn.disabled    = false;
      confirmBtn.textContent = 'Confirmar';
    }
  };

  overlay.querySelector('#modal-pin-confirm')?.addEventListener('click', confirmAction);
  overlay.querySelector('#modal-pin-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') confirmAction();
    if (e.key === 'Escape') overlay.querySelector('#modal-pin-cancel')?.click();
  });
}

function renderScoreBar(label, value) {
  const cls = value >= 70 ? 'high' : value >= 40 ? 'medium' : 'low';
  return `
    <div class="score-bar-container">
      <div class="score-bar-label"><span>${label}</span><span style="color:${getScoreColor(value)};font-weight:700;">${value}%</span></div>
      <div class="score-bar-track">
        <div class="score-bar-fill ${cls}" style="width:${value}%;"></div>
      </div>
    </div>`;
}

// ── FILTROS ───────────────────────────────────────────────
export function handleFilters() {
  const searchInput  = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  const typeFilter   = document.getElementById('type-filter');

  const onSearch = debounce((val) => {
    dashState.filters.search = val;
    loadProposals(true);
  }, 350);

  searchInput?.addEventListener('input',  e => onSearch(e.target.value));
  statusFilter?.addEventListener('change', e => { dashState.filters.status = e.target.value; loadProposals(true); });
  typeFilter?.addEventListener('change',   e => { dashState.filters.type   = e.target.value; loadProposals(true); });

  // Status tabs
  document.querySelectorAll('.status-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const val = tab.dataset.status || '';
      dashState.filters.status = val;
      if (statusFilter) statusFilter.value = val;
      loadProposals(true);
    });
  });
}

function updateCountLabel(total) {
  const el = document.getElementById('proposals-count');
  if (el) el.innerHTML = `<strong>${total}</strong> propuesta${total !== 1 ? 's' : ''}`;
}

// ── PAGINACIÓN ─────────────────────────────────────────────
export function handlePagination(page) {
  dashState.page = page;
  loadProposals();
  document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
}

function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;
  if (dashState.totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `
    <button class="page-btn" onclick="handlePagination(${dashState.page - 1})"
      ${dashState.page === 1 ? 'disabled' : ''}
      aria-label="Página anterior">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
    </button>`;

  for (let i = 1; i <= dashState.totalPages; i++) {
    if (i === 1 || i === dashState.totalPages || Math.abs(i - dashState.page) <= 1) {
      html += `<button class="page-btn ${i === dashState.page ? 'active' : ''}"
        onclick="handlePagination(${i})" aria-label="Página ${i}" ${i === dashState.page ? 'aria-current="page"' : ''}>${i}</button>`;
    } else if (Math.abs(i - dashState.page) === 2) {
      html += `<span style="color:var(--text-muted);padding:0 4px;">…</span>`;
    }
  }

  html += `
    <button class="page-btn" onclick="handlePagination(${dashState.page + 1})"
      ${dashState.page === dashState.totalPages ? 'disabled' : ''}
      aria-label="Página siguiente">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;

  container.innerHTML = html;
}

// Exponer para onclick en paginación
window.handlePagination = handlePagination;

// ── ESTADÍSTICAS ───────────────────────────────────────────
export async function loadStats() {
  try {
    const res = await getStats();
    const s   = res.data;

    const animate = (id, val) => {
      const el = document.getElementById(id);
      if (el) animateNumber(el, val);
    };

    animate('stat-total',     s.total || 0);
    animate('stat-approved',  s.byStatus?.approved || 0);
    animate('stat-pending',   s.byStatus?.pending  || 0);
    animate('stat-avg-score', s.avgViabilityScore  || 0);

    // Actualizar contadores en tabs
    const statusCounts = s.byStatus || {};
    document.querySelectorAll('.status-tab[data-status]').forEach(tab => {
      const status = tab.dataset.status;
      const countEl = tab.querySelector('.count');
      if (countEl && status && statusCounts[status] !== undefined) {
        countEl.textContent = statusCounts[status];
      }
      if (countEl && !status) {
        countEl.textContent = s.total || 0;
      }
    });
  } catch {
    // Stats son opcionales pero mostramos 0 en lugar de dejar "—"
    ['stat-total', 'stat-approved', 'stat-pending', 'stat-avg-score'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.textContent === '—') el.textContent = '0';
    });
  }
}

// ── EXPORTAR PROPUESTA A PDF ───────────────────────────────
function exportProposalPDF(p) {
  const base = new URL('.', document.baseURI).href;
  const now  = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

  const STATUS_LABELS = { pending: 'Pendiente', under_review: 'En revisión', approved: 'Aprobada', rejected: 'Rechazada' };
  const TYPE_EMOJI    = { web_app: '🌐', mobile: '📱', api: '⚡', data: '📊', ai: '🤖', other: '💡' };
  const EVAL_CRITERIA = [
    { key: 'impact',      label: 'Impacto',      icon: '🚀' },
    { key: 'feasibility', label: 'Factibilidad', icon: '⚙️' },
    { key: 'innovation',  label: 'Innovación',   icon: '💡' },
    { key: 'resources',   label: 'Recursos',     icon: '👥' },
  ];

  const presDate = p.presentationDate
    ? new Date(p.presentationDate + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const evalScores = p.evaluation || {};
  const totalEval  = p.score?.total || 0;
  const sH = (num, title) => `
    <div class="pr-section-header">
      <div class="pr-num">${num}</div>
      <div class="pr-section-title">${title}</div>
    </div>`;

  const html = `
  <div class="pr-doc">

    <!-- PORTADA -->
    <div class="pr-cover">
      <div class="pr-cover-top">
        <div class="pr-cover-brand">
          <svg class="pr-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="7" fill="rgba(255,255,255,0.2)"/>
            <g stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none">
              <rect x="9" y="9" width="14" height="14" rx="2.5"/>
              <line x1="4" y1="12" x2="9" y2="12"/><line x1="4" y1="20" x2="9" y2="20"/>
              <line x1="23" y1="12" x2="28" y2="12"/><line x1="23" y1="20" x2="28" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="9"/><line x1="20" y1="4" x2="20" y2="9"/>
              <line x1="12" y1="23" x2="12" y2="28"/><line x1="20" y1="23" x2="20" y2="28"/>
            </g>
            <path d="M16 12.5 L17 14.9 L19.5 16 L17 17.1 L16 19.5 L15 17.1 L12.5 16 L15 14.9 Z" fill="white"/>
          </svg>
          <div>
            <div class="pr-brand-name">DevProposal Hub</div>
            <div class="pr-brand-sub">WBL Inteligencia Artificial</div>
          </div>
        </div>
        <div class="pr-cover-meta">
          <div class="pr-report-label">Propuesta de Proyecto</div>
          <div class="pr-report-date">${now}</div>
        </div>
      </div>
      <div class="pr-cover-title-block">
        <div class="pr-cover-eyebrow">Propuesta de Desarrollo de Software</div>
        <div class="pr-cover-project-name">${escapeHtml(p.projectName)}</div>
        <div class="pr-cover-proposer">Proponente: ${escapeHtml(p.proposerName)}${presDate ? ' &nbsp;·&nbsp; ' + presDate : ''}</div>
        <div class="pr-cover-chips">
          <span class="pr-cover-chip">${TYPE_EMOJI[p.projectType] || '💡'} ${getTypeLabel(p.projectType)}</span>
          <span class="pr-cover-chip">⏱ ${getTimeLabel(p.estimatedTime)}</span>
          <span class="pr-cover-chip">👥 ${p.teamSize || 1} persona${(p.teamSize || 1) > 1 ? 's' : ''}</span>
          ${p.urgencyLevel ? `<span class="pr-cover-chip">🔥 Urgencia ${p.urgencyLevel}/5</span>` : ''}
          ${p.requiresBudget ? `<span class="pr-cover-chip">💰 $${(p.budgetAmount || 0).toLocaleString('es-CO')} USD</span>` : ''}
        </div>
        <div class="pr-status-cover pr-status-cover--${p.status || 'pending'}">${STATUS_LABELS[p.status] || 'Pendiente'}</div>
      </div>
    </div>

    <!-- CUERPO -->
    <div class="pr-body">

      <!-- SECCIÓN 1: INFO GENERAL -->
      <section class="pr-section">
        ${sH('01', 'Información General')}
        <table class="pr-info-table">
          <tr><td class="pr-k">Nombre del proyecto</td><td class="pr-v"><strong>${escapeHtml(p.projectName)}</strong></td></tr>
          <tr><td class="pr-k">Proponente</td><td class="pr-v">${escapeHtml(p.proposerName)}</td></tr>
          ${presDate ? `<tr><td class="pr-k">Fecha de presentación</td><td class="pr-v">${presDate}</td></tr>` : ''}
          <tr><td class="pr-k">Tipo de proyecto</td><td class="pr-v">${TYPE_EMOJI[p.projectType] || ''} ${getTypeLabel(p.projectType)}</td></tr>
          <tr><td class="pr-k">Tiempo estimado</td><td class="pr-v">${getTimeLabel(p.estimatedTime)}</td></tr>
          <tr><td class="pr-k">Tamaño del equipo</td><td class="pr-v">${p.teamSize || 1} persona(s)</td></tr>
          ${p.urgencyLevel ? `<tr><td class="pr-k">Nivel de urgencia</td><td class="pr-v">${p.urgencyLevel} / 5</td></tr>` : ''}
          <tr><td class="pr-k">Estado</td><td class="pr-v">${STATUS_LABELS[p.status] || 'Pendiente'}</td></tr>
        </table>
      </section>

      <!-- SECCIÓN 2: EL PROBLEMA -->
      <section class="pr-section">
        ${sH('02', 'El Problema')}
        <div class="pr-subsection">
          <div class="pr-sub-title">Descripción del problema</div>
          <div class="pr-body-text">${escapeHtml(p.problemDescription || '—')}</div>
        </div>
        ${p.targetUsers ? `
        <div class="pr-subsection">
          <div class="pr-sub-title">Usuarios afectados</div>
          <div class="pr-body-text">${escapeHtml(p.targetUsers)}</div>
        </div>` : ''}
      </section>

      <!-- SECCIÓN 3: LA SOLUCIÓN -->
      <section class="pr-section pr-break-before">
        ${sH('03', 'La Solución')}
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
        ${p.mvpScope ? `
        <div class="pr-subsection">
          <div class="pr-sub-title">Alcance del Proyecto</div>
          <div class="pr-body-text">${escapeHtml(p.mvpScope)}</div>
        </div>` : ''}
      </section>

      <!-- SECCIÓN 4: VIABILIDAD -->
      <section class="pr-section">
        ${sH('04', 'Viabilidad')}
        <table class="pr-info-table">
          <tr><td class="pr-k">Tiempo estimado</td><td class="pr-v">${getTimeLabel(p.estimatedTime)}</td></tr>
          <tr><td class="pr-k">Tamaño del equipo</td><td class="pr-v">${p.teamSize || 1} persona(s)</td></tr>
          <tr><td class="pr-k">Beneficio esperado</td><td class="pr-v">${getBenefitLabel(p.expectedBenefit) || '—'}</td></tr>
          ${p.urgencyLevel ? `<tr><td class="pr-k">Urgencia</td><td class="pr-v">${p.urgencyLevel} / 5</td></tr>` : ''}
          <tr><td class="pr-k">Requiere presupuesto</td><td class="pr-v">${p.requiresBudget ? `Sí — $${(p.budgetAmount || 0).toLocaleString('es-CO')} USD` : 'No'}</td></tr>
          ${p.hasSkills !== undefined ? `<tr><td class="pr-k">Habilidades disponibles</td><td class="pr-v">${p.hasSkills ? 'Sí' : 'No / Parcial'}</td></tr>` : ''}
        </table>
        ${p.identifiedRisks?.filter(Boolean).length ? `
        <div class="pr-subsection">
          <div class="pr-sub-title">Riesgos identificados</div>
          <ul class="pr-list pr-list--warning">${p.identifiedRisks.filter(Boolean).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
        </div>` : ''}
      </section>

      <!-- SECCIÓN 5: EVALUACIÓN (solo si fue evaluada) -->
      ${totalEval || p.evaluatorNotes ? `
      <section class="pr-section pr-break-before">
        ${sH('05', 'Evaluación')}
        ${totalEval ? `
        <div class="pr-scores-grid">
          ${EVAL_CRITERIA.map(c => {
            const val = evalScores[c.key] || 0;
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
            <div class="pr-total-label">Score Total</div>
            <div class="pr-total-sub">4 criterios × 5 puntos</div>
          </div>
          <div>
            <div class="pr-total-number">${totalEval}</div>
            <div class="pr-total-sub" style="text-align:right;">/ 100 pts</div>
          </div>
        </div>` : ''}
        ${p.evaluatedBy ? `<div class="pr-subsection"><div class="pr-sub-title">Evaluador</div><div class="pr-body-text">${escapeHtml(p.evaluatedBy)}</div></div>` : ''}
        ${p.evaluatorNotes ? `<div class="pr-subsection"><div class="pr-sub-title">Notas del evaluador</div><div class="pr-body-text pr-notes">${escapeHtml(p.evaluatorNotes)}</div></div>` : ''}
      </section>` : ''}

      <!-- PIE DE PÁGINA -->
      <footer class="pr-footer">
        <span>Generado por <strong>DevProposal Hub</strong> — WBL Inteligencia Artificial</span>
        <span>Documento confidencial · ${now}</span>
      </footer>

    </div>
  </div>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Permite las ventanas emergentes en este sitio para descargar el PDF.');
    return;
  }

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(p.projectName)} — DevProposal Hub</title>
  <link rel="stylesheet" href="${base}styles/print.css">
  <style>body{margin:0;background:#fff} #print-report{display:block!important}</style>
</head>
<body>
  <div id="print-report">${html}</div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
    });
  <\/script>
</body>
</html>`);
  win.document.close();
}

// ── EXPORT ─────────────────────────────────────────────────
export async function exportAllToJSON() {
  const adminKey = prompt('Ingresa la clave de administrador para exportar los datos:');
  if (!adminKey) return;

  try {
    const data = await exportProposals(adminKey);
    const proposals = Array.isArray(data) ? data : (data.data || []);
    const blob = new Blob([JSON.stringify(proposals, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `propuestas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exportación descargada.', 'success');
  } catch (err) {
    showToast('Error al exportar: ' + err.message, 'error');
  }
}

window.exportAllToJSON = exportAllToJSON;
