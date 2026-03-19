/* ============================================================
   evaluator.js — Panel de evaluación de propuestas
   ============================================================ */
import { getProposals, updateProposal, deleteProposal } from './api.js';
import { showToast, escapeHtml, formatDate, getStatusBadgeHTML, setButtonLoading } from './ui.js';
import { calcEvaluationTotal, getScoreColor, animateNumber } from './score.js';
import { openPlanModal, closePlanModal } from './planner.js';

const evalState = {
  proposals:  [],
  selected:   null,
  scores:     { impact: 0, feasibility: 0, innovation: 0, resources: 0 },
  status:     '',
  notes:      '',
  evaluator:  '',
  unlocked:   false
};

export const PIN = 'EvaluaTion2026!**!'; // PIN de acceso al panel de evaluación

// ── INIT ──────────────────────────────────────────────────
export function initEvaluator() {
  const section = document.getElementById('evaluator-section');
  if (!section) return;

  setupPinProtection();
}

// ── PIN ───────────────────────────────────────────────────
function setupPinProtection() {
  const lockOverlay = document.getElementById('eval-lock');
  const pinForm     = document.getElementById('pin-form');

  if (!lockOverlay) return;

  pinForm?.addEventListener('submit', e => {
    e.preventDefault();
    const inputPin = document.getElementById('pin-input')?.value;
    if (inputPin === PIN) {
      evalState.unlocked = true;
      document.dispatchEvent(new CustomEvent('evalUnlocked'));
      loadPendingList();
    } else {
      showToast('PIN incorrecto. Inténtalo de nuevo.', 'error');
      document.getElementById('pin-input').value = '';
    }
  });
}

// ── LISTA DE PENDIENTES ───────────────────────────────────
export async function loadPendingList() {
  const list = document.getElementById('pending-list');
  if (!list) return;

  list.innerHTML = `<div style="padding:1rem;text-align:center;color:var(--text-muted);font-size:var(--text-sm);">Cargando...</div>`;

  try {
    const res = await getProposals({ status: 'pending', limit: 50 });
    evalState.proposals = res.data || [];

    if (!evalState.proposals.length) {
      list.innerHTML = `
        <div style="padding:2rem;text-align:center;color:var(--text-muted);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;margin:0 auto 1rem;opacity:0.3;">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p style="font-size:var(--text-sm);">No hay propuestas pendientes</p>
        </div>`;
      return;
    }

    list.innerHTML = evalState.proposals.map(p => `
      <div class="pending-item" data-id="${p._id}" role="button" tabindex="0"
        aria-label="Seleccionar propuesta: ${escapeHtml(p.projectName)}"
        onkeydown="if(event.key==='Enter')this.click()">
        <div class="pending-item__dot"></div>
        <div class="pending-item__info">
          <div class="pending-item__name">${escapeHtml(p.projectName)}</div>
          <div class="pending-item__meta">${escapeHtml(p.proposerName)} · ${formatDate(p.createdAt)}</div>
        </div>
        <span style="font-size:11px;font-family:var(--font-mono);color:var(--color-primary);">${p.score?.viability || 0}%</span>
      </div>`).join('');

    list.querySelectorAll('.pending-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        list.querySelectorAll('.pending-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        const proposal = evalState.proposals.find(p => p._id === id);
        if (proposal) selectProposal(proposal);
      });
    });
  } catch (err) {
    list.innerHTML = `<div style="padding:1rem;color:var(--color-error);font-size:var(--text-sm);">Error: ${escapeHtml(err.message)}</div>`;
  }
}

// ── SELECCIONAR PROPUESTA PARA EVALUAR ────────────────────
function selectProposal(proposal) {
  evalState.selected = proposal;
  evalState.scores   = {
    impact:      proposal.score?.impact      || 0,
    feasibility: proposal.score?.feasibility || 0,
    innovation:  proposal.score?.innovation  || 0,
    resources:   proposal.score?.resources   || 0
  };
  evalState.status = proposal.status;
  evalState.notes  = proposal.evaluatorNotes || '';

  renderEvaluationForm(proposal);
}

// ── FORMULARIO DE EVALUACIÓN ──────────────────────────────
export function renderEvaluationForm(proposal) {
  const card = document.getElementById('eval-form-card');
  if (!card) return;

  const totalScore = calcEvaluationTotal(evalState.scores);

  const criteriaConfig = [
    { key: 'impact',      label: 'Impacto',        icon: '🚀', desc: 'Beneficio potencial para los usuarios y la organización' },
    { key: 'feasibility', label: 'Factibilidad',   icon: '⚙️', desc: 'Facilidad técnica y recursos disponibles para ejecutarlo' },
    { key: 'innovation',  label: 'Innovación',     icon: '💡', desc: 'Qué tan novedoso o diferenciador es el enfoque' },
    { key: 'resources',   label: 'Recursos',       icon: '👥', desc: 'Eficiencia en el uso de tiempo, personas y presupuesto' }
  ];

  card.innerHTML = `
    <div style="margin-bottom:var(--space-6);">
      <h4 style="font-size:var(--text-base);margin-bottom:var(--space-2);">${escapeHtml(proposal.projectName)}</h4>
      <p style="font-size:var(--text-sm);color:var(--text-muted);">${escapeHtml(proposal.proposerName)}</p>
      ${proposal.email ? `<p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:var(--space-1);">✉️ <a href="mailto:${escapeHtml(proposal.email)}" style="color:var(--color-primary);">${escapeHtml(proposal.email)}</a></p>` : ''}
      ${proposal.phoneNumber ? `<p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:var(--space-1);">📞 ${proposal.phoneCode ? escapeHtml(proposal.phoneCode) + ' ' : ''}${escapeHtml(proposal.phoneNumber)}</p>` : ''}
    </div>

    <div class="eval-criteria" id="eval-criteria">
      ${criteriaConfig.map(c => renderCriterion(c)).join('')}
    </div>

    <div class="eval-total">
      <div class="eval-total__number" id="eval-total-score"
        style="color:${getScoreColor(totalScore)};">${totalScore}</div>
      <div class="eval-total__label">Score Total de Evaluación / 100</div>
    </div>

    <div style="margin-bottom:var(--space-5);">
      <label class="form-label" for="eval-notes">Notas y retroalimentación</label>
      <textarea id="eval-notes" class="form-control" rows="4"
        placeholder="Escribe tus observaciones, sugerencias o justificación de la decisión..."
        aria-label="Notas del evaluador">${escapeHtml(evalState.notes)}</textarea>
    </div>

    <div style="margin-bottom:var(--space-5);">
      <label class="form-label" for="eval-name">Tu nombre (evaluador)</label>
      <input type="text" id="eval-name" class="form-control"
        placeholder="Ej: Carlos Martínez" value="${escapeHtml(evalState.evaluator)}"
        aria-label="Nombre del evaluador">
    </div>

    <div style="margin-bottom:var(--space-6);">
      <label class="form-label">Cambiar estado</label>
      <div class="status-select-group" role="radiogroup" aria-label="Estado de la propuesta">
        ${[
          { val: 'under_review', label: '🔵 En revisión' },
          { val: 'approved',     label: '✅ Aprobar' },
          { val: 'rejected',     label: '❌ Rechazar' }
        ].map(s => `
          <div class="status-option ${evalState.status === s.val ? 'selected' : ''}"
            data-status="${s.val}" role="radio"
            aria-checked="${evalState.status === s.val}"
            tabindex="0"
            onkeydown="if(event.key==='Enter')this.click()">
            ${s.label}
          </div>`).join('')}
      </div>
    </div>

    <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
      <button class="btn btn-primary w-full" id="btn-submit-eval" style="flex:1;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Guardar evaluación
      </button>
      <button class="btn btn-danger" id="btn-delete-proposal" aria-label="Eliminar propuesta">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6l-1 14H6L5 6m3 0V4h6v2"/>
        </svg>
      </button>
    </div>

    <div style="margin-top:var(--space-5);padding-top:var(--space-5);border-top:1px solid var(--border-color);">
      <p style="font-size:var(--text-xs);color:var(--text-muted);text-align:center;margin-bottom:var(--space-3);">
        💡 Guarda la evaluación primero para activar el plan completo, o genera un plan preliminar ahora.
      </p>
      <button class="btn btn-plan w-full" id="btn-gen-plan">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        Generar Plan de Proyecto
      </button>
    </div>
  `;

  setupEvalListeners();
}

function renderCriterion(c) {
  const val = evalState.scores[c.key] || 0;
  return `
    <div class="eval-criterion">
      <div class="eval-criterion__header">
        <span class="eval-criterion__label">${c.icon} ${c.label}
          <span style="font-size:11px;font-weight:400;color:var(--text-muted);">${c.desc}</span>
        </span>
        <span class="eval-criterion__value" id="val-${c.key}">${val}/5</span>
      </div>
      <div class="eval-criterion__stars" role="group" aria-label="${c.label}: ${val} de 5">
        ${[1,2,3,4,5].map(n => `
          <button type="button" class="star-btn ${n <= val ? 'active' : ''}"
            data-criterion="${c.key}" data-value="${n}"
            aria-label="${n} estrella${n > 1 ? 's' : ''}">
            ${n <= val ? '★' : '☆'}
          </button>`).join('')}
      </div>
    </div>`;
}

function setupEvalListeners() {
  // Stars
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const criterion = btn.dataset.criterion;
      const value     = parseInt(btn.dataset.value);
      evalState.scores[criterion] = value;

      // Actualizar visual stars
      document.querySelectorAll(`.star-btn[data-criterion="${criterion}"]`).forEach(b => {
        const v = parseInt(b.dataset.value);
        b.classList.toggle('active', v <= value);
        b.textContent = v <= value ? '★' : '☆';
      });

      // Actualizar label
      const lbl = document.getElementById(`val-${criterion}`);
      if (lbl) lbl.textContent = `${value}/5`;

      // Recalcular total
      const total    = calcEvaluationTotal(evalState.scores);
      const totalEl  = document.getElementById('eval-total-score');
      if (totalEl) {
        totalEl.style.color = getScoreColor(total);
        animateNumber(totalEl, total);
      }
    });
  });

  // Notes
  document.getElementById('eval-notes')?.addEventListener('input', e => {
    evalState.notes = e.target.value;
  });

  // Evaluator name
  document.getElementById('eval-name')?.addEventListener('input', e => {
    evalState.evaluator = e.target.value;
  });

  // Status options
  document.querySelectorAll('.status-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.status-option').forEach(o => {
        o.classList.remove('selected');
        o.setAttribute('aria-checked', 'false');
      });
      opt.classList.add('selected');
      opt.setAttribute('aria-checked', 'true');
      evalState.status = opt.dataset.status;
    });
  });

  // Submit
  document.getElementById('btn-submit-eval')?.addEventListener('click', submitEvaluation);

  // Delete
  document.getElementById('btn-delete-proposal')?.addEventListener('click', handleDelete);

  // Generar Plan
  document.getElementById('btn-gen-plan')?.addEventListener('click', () => {
    if (evalState.selected) openPlanModal(evalState.selected, { scores: evalState.scores });
  });
}

// ── ENVIAR EVALUACIÓN ─────────────────────────────────────
export async function submitEvaluation() {
  if (!evalState.selected) return;

  const btn = document.getElementById('btn-submit-eval');
  setButtonLoading(btn, true);

  try {
    await updateProposal(evalState.selected._id, {
      status:         evalState.status || 'under_review',
      evaluatorNotes: evalState.notes,
      evaluatedBy:    evalState.evaluator,
      score:          evalState.scores
    });

    showToast('Evaluación guardada exitosamente.', 'success');
    updateStatusUI(evalState.selected._id, evalState.status);

    // Capturar propuesta antes de resetear estado
    const savedProposal = {
      ...evalState.selected,
      status:         evalState.status,
      evaluatorNotes: evalState.notes,
      evaluatedBy:    evalState.evaluator,
      score:          { ...evalState.scores }
    };
    const savedScores = { ...evalState.scores };

    // Recargar lista
    await loadPendingList();

    // Mostrar estado de éxito con botón de plan
    const card = document.getElementById('eval-form-card');
    if (card) card.innerHTML = `
      <div class="eval-card__placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="1.5" style="width:48px;height:48px;margin:0 auto;">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p style="margin-bottom:var(--space-5);">Evaluación guardada. ¿Deseas generar el plan de proyecto?</p>
        <button class="btn btn-plan" id="btn-gen-plan-post" style="width:100%;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Generar Plan de Proyecto
        </button>
      </div>`;
    document.getElementById('btn-gen-plan-post')?.addEventListener('click', () => {
      openPlanModal(savedProposal, { scores: savedScores });
    });

    evalState.selected = null;
    document.dispatchEvent(new CustomEvent('proposalCreated'));
  } catch (err) {
    showToast('Error al guardar: ' + err.message, 'error');
    console.error('[Evaluador] submitEvaluation error:', err);
  } finally {
    setButtonLoading(btn, false);
  }
}

export function updateStatusUI(proposalId, newStatus) {
  const item = document.querySelector(`.pending-item[data-id="${proposalId}"]`);
  if (item && newStatus !== 'pending') item.remove();
}

async function handleDelete() {
  if (!evalState.selected) return;
  const adminKey = window.prompt('Ingresa la clave de administrador para eliminar:');
  if (!adminKey) return;

  try {
    await deleteProposal(evalState.selected._id, adminKey);
    showToast('Propuesta eliminada.', 'success');
    const item = document.querySelector(`.pending-item[data-id="${evalState.selected._id}"]`);
    if (item) item.remove();
    const card = document.getElementById('eval-form-card');
    if (card) card.innerHTML = `<div class="eval-card__placeholder"><p>Propuesta eliminada.</p></div>`;
    evalState.selected = null;
    document.dispatchEvent(new CustomEvent('proposalCreated'));
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}
