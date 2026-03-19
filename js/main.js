/* ============================================================
   main.js — Entry point, inicialización y configuración global
   ============================================================ */
import { initForm }      from './form.js';
import { initDashboard } from './dashboard.js';
import { initEvaluator } from './evaluator.js';
import { initScrollReveal } from './ui.js';

// ── INICIALIZACIÓN PRINCIPAL ──────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initNavbar();
  initScrollReveal();
  initHeroCanvas();
  initHeroScrollHint();
  initAccordions();
  initForm();
  initDashboard();
  initEvaluator();
  initSmoothScroll();
});

// ── TEMA (dark/light) ──────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('innovahub_theme') || localStorage.getItem('devproposal_theme') || 'dark';
  applyTheme(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn?.addEventListener('click', () => {
    const current = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    const next    = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('innovahub_theme', next);
  });
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light-mode');
  } else {
    document.documentElement.classList.remove('light-mode');
  }
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.innerHTML = theme === 'dark'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
       </svg>`;
}

// ── NAVBAR ────────────────────────────────────────────────
function initNavbar() {
  const navbar    = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const nav       = document.querySelector('.navbar__nav');

  // Scrolled state
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu
  hamburger?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar menu al hacer click en link
  nav?.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  // Active link en scroll — usa rootMargin para detectar la sección más visible
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px', // activa cuando la sección ocupa la parte superior-media de la pantalla
    threshold: 0
  });

  sections.forEach(s => navObserver.observe(s));
}

// ── SCROLL HINT DEL HERO ──────────────────────────────────
function initHeroScrollHint() {
  const btn = document.getElementById('hero-scroll-hint');
  btn?.addEventListener('click', () => {
    document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── SMOOTH SCROLL ─────────────────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // CTAs del hero
  document.getElementById('cta-propose')?.addEventListener('click', () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('cta-dashboard')?.addEventListener('click', () => {
    document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── ACORDEONES ────────────────────────────────────────────
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item    = trigger.closest('.accordion-item');
      const isOpen  = item.classList.contains('open');

      // Cerrar todos
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      trigger.setAttribute('aria-expanded', 'false');

      // Abrir el clickeado si estaba cerrado
      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ── CANVAS DE PARTÍCULAS ──────────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const colors = ['rgba(108,99,255,', 'rgba(0,212,170,', 'rgba(139,133,255,'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.color  = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `${this.color}${this.opacity})`;
      ctx.fill();
    }
  }

  // Crear partículas
  for (let i = 0; i < 60; i++) particles.push(new Particle());

  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    animId = requestAnimationFrame(animate);
  };

  // Pausar cuando no es visible (performance)
  const heroObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animId = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animId);
    }
  }, { threshold: 0 });

  heroObs.observe(document.querySelector('.hero') || canvas);
}

