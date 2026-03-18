/* ============================================================
   ui.js — Toast, Modal, Skeleton, DOM helpers
   ============================================================ */

// ── TOAST ──────────────────────────────────────────────────
const TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span class="toast__message">${escapeHtml(message)}</span>
    <button class="toast__close" aria-label="Cerrar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 260);
  };

  toast.querySelector('.toast__close').addEventListener('click', remove);
  setTimeout(remove, duration);
}

// ── MODAL ──────────────────────────────────────────────────
let activeModal = null;

export function openModal(title, bodyHTML, footerHTML = '') {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3>${escapeHtml(title)}</h3>
        <button class="modal__close" aria-label="Cerrar modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal__body">${bodyHTML}</div>
      ${footerHTML ? `<div class="modal__footer">${footerHTML}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  activeModal = overlay;

  requestAnimationFrame(() => overlay.classList.add('open'));

  overlay.querySelector('.modal__close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  // Escape key
  const onKey = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);

  return overlay;
}

export function closeModal() {
  if (!activeModal) return;
  activeModal.classList.remove('open');
  document.body.style.overflow = '';
  const m = activeModal;
  setTimeout(() => { m.remove(); }, 350);
  activeModal = null;
}

// ── SKELETON ──────────────────────────────────────────────
export function showSkeletons(container, count = 6) {
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="card skeleton-card" aria-hidden="true">
      <div style="padding: 1.5rem; display:flex; flex-direction:column; gap:1rem;">
        <div class="skeleton skeleton-line w-3/4" style="width:75%;height:14px;border-radius:4px;"></div>
        <div class="skeleton skeleton-line w-1/2" style="width:50%;height:12px;border-radius:4px;"></div>
        <div class="skeleton" style="width:100%;height:60px;border-radius:8px;"></div>
        <div class="skeleton skeleton-line w-1/4" style="width:25%;height:12px;border-radius:4px;"></div>
      </div>
    </div>
  `).join('');
}

export function hideSkeletons(container) {
  container.innerHTML = '';
}

// ── SCROLL REVEAL ──────────────────────────────────────────
export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── HELPERS ───────────────────────────────────────────────
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return '—'; }
}

export function formatDateRelative(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now  = new Date();
  const diff = now - date;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7)  return `Hace ${days} días`;
  return formatDate(dateString);
}

const STATUS_CONFIG = {
  pending:      { label: 'Pendiente',    color: 'warning', dot: '🟡' },
  under_review: { label: 'En revisión',  color: 'info',    dot: '🔵' },
  approved:     { label: 'Aprobada',     color: 'success', dot: '🟢' },
  rejected:     { label: 'Rechazada',    color: 'error',   dot: '🔴' }
};

export function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label || status;
}

export function getStatusBadgeHTML(status) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'info' };
  return `<span class="badge badge-${status}" role="status">${cfg.label}</span>`;
}

const TYPE_CONFIG = {
  web_app: { label: 'Web App',    emoji: '🌐' },
  mobile:  { label: 'Mobile',     emoji: '📱' },
  api:     { label: 'API',        emoji: '⚡' },
  data:    { label: 'Data',       emoji: '📊' },
  ai:      { label: 'IA / ML',    emoji: '🤖' },
  other:   { label: 'Otro',       emoji: '💡' }
};

export function getTypeLabel(type) {
  return TYPE_CONFIG[type]?.label || type;
}

export function getTypeEmoji(type) {
  return TYPE_CONFIG[type]?.emoji || '💡';
}

export function getTimeLabel(val) {
  const map = { '1_2_weeks': '1–2 semanas', '1_month': '1 mes', '3_months': '3 meses', '6_plus_months': '6+ meses' };
  return map[val] || val || '—';
}

export function getBenefitLabel(val) {
  const map = { high: 'Alto', medium: 'Medio', low: 'Bajo' };
  return map[val] || val || '—';
}

// ── DEBOUNCE ──────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── LOADER BUTTON ─────────────────────────────────────────
export function setButtonLoading(btn, loading, originalText) {
  if (loading) {
    btn.disabled = true;
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML = `<span class="loader-spinner"></span> Guardando...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = originalText || btn.dataset.original || btn.innerHTML;
  }
}

// ── EMPTY STATE ───────────────────────────────────────────
export function renderEmptyState(container, title, desc, actionHTML = '') {
  container.innerHTML = `
    <div class="empty-state animate-fade-in">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(desc)}</p>
      ${actionHTML}
    </div>
  `;
}

// ── ERROR STATE ───────────────────────────────────────────
export function renderErrorState(container, message, onRetry) {
  container.innerHTML = `
    <div class="error-state animate-fade-in" style="grid-column:1/-1;">
      <div class="error-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
      </div>
      <h3>Error de conexión</h3>
      <p>${escapeHtml(message)}</p>
      <button class="btn btn-outline btn-sm" id="retry-btn">Reintentar</button>
    </div>
  `;
  const retryBtn = container.querySelector('#retry-btn');
  if (retryBtn && onRetry) retryBtn.addEventListener('click', onRetry);
}
