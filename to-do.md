# TO-DO — DevProposal Hub
> Lista de tareas accionables. Actualizar conforme avances. Fecha inicio: 2026-03-18

---

## ✅ FASE 0 — Preparación — COMPLETADA 2026-03-18
- [x] Crear repositorio Git: `git init` + primer commit con los 5 docs
- [x] Crear cuenta y cluster en MongoDB Atlas (free tier M0) — *el usuario configura MONGODB_URI en .env*
- [x] Crear archivo `.env` con `MONGODB_URI`, `PORT`, `ADMIN_KEY`
- [x] Crear `.gitignore` (node_modules, .env, .DS_Store)
- [x] Definir y anotar el sistema de colores en `styles/main.css` (CSS vars)

---

## ✅ FASE 1 — MVP Core — COMPLETADA 2026-03-18

### Backend ✅
- [x] `npm init -y` en `/backend`
- [x] Instalar dependencias: `express mongoose cors helmet joi dotenv express-rate-limit`
- [x] Crear `server.js` con Express + middlewares base
- [x] Crear `src/config/db.js` — conexión Mongoose
- [x] Crear `src/models/Proposal.js` — schema completo según `spec.md §4`
- [x] Crear `src/utils/scoreCalculator.js` — funciones `calcCompleteness()` y `calcViability()`
- [x] Crear `src/middleware/validation.js` — schemas Joi para POST y PATCH
- [x] Crear `src/middleware/errorHandler.js` — middleware global de errores
- [x] Crear `src/controllers/proposalController.js`:
  - [x] `createProposal` — calcula scores antes de guardar
  - [x] `getProposals` — paginación + filtros (status, type, search)
  - [x] `getProposalById`
  - [x] `updateProposal` — recalcula score.total si vienen scores de evaluador
  - [x] `deleteProposal` — valida header `x-admin-key`
  - [x] `exportProposals` — retorna JSON masivo
  - [x] `getStats` — aggregate MongoDB
- [x] Crear `src/routes/proposals.js` — registrar todos los endpoints
- [x] Conectar rutas en `server.js`
- [x] Probar todos los endpoints — scoreCalculator verificado: completeness:100, viability:84, evalTotal:71
- [x] Verificar que los documentos se guardan correctamente en Atlas — *verificar al conectar MONGODB_URI real*

### Frontend — Estructura y estilos ✅
- [x] Crear `frontend/index.html` — estructura HTML semántica con todas las secciones
- [x] Crear `styles/main.css`:
  - [x] Variables CSS (colores, tipografía, espaciados, sombras)
  - [x] Reset / normalize
  - [x] Clases base: `.container`, `.btn`, `.badge`, `.card`
  - [x] Dark mode como default (`:root`) + clase `.light-mode` en `<html>`
- [x] Crear `styles/components.css`:
  - [x] Navbar / Header fijo
  - [x] Hero section
  - [x] Cards de guía
  - [x] Modal
  - [x] Toast notifications
  - [x] Skeleton loaders
- [x] Crear `styles/form.css`:
  - [x] Stepper visual
  - [x] Inputs, textareas, dropdowns, radios, checkboxes, sliders custom
  - [x] Tags input (habilidades, features dinámicas)
  - [x] Score bar animada
- [x] Crear `styles/dashboard.css`:
  - [x] Grid de propuestas cards
  - [x] Filtros y barra de búsqueda
  - [x] Badges de estado (colores semafóricos)
  - [x] Panel de evaluación
- [x] Crear `styles/animations.css`:
  - [x] Fade in / slide up al hacer scroll
  - [x] Animación del hero (partículas canvas)
  - [x] Transición entre pasos del formulario
  - [x] Keyframes para loader y toasts
- [x] Integrar Google Fonts: Inter + JetBrains Mono (preconnect)
- [x] SVG icons inline en HTML y JS

### Frontend — JavaScript ✅
- [x] Crear `js/ui.js`:
  - [x] `showToast(message, type)` — success, error, info, warning
  - [x] `openModal(content)` / `closeModal()`
  - [x] `showSkeletons(container, count)` / `hideSkeletons()`
  - [x] `initScrollReveal()` — IntersectionObserver para secciones
  - [x] `formatDate(dateString)` — fecha legible en español
  - [x] `getStatusLabel(status)` / `getStatusBadgeHTML(status)`
  - [x] `debounce(fn, delay)` — para búsqueda
  - [x] `renderEmptyState()` / `renderErrorState()`
- [x] Crear `js/api.js`:
  - [x] `const BASE_URL = 'http://localhost:3000/api'`
  - [x] `request(method, endpoint, body)` — fetch wrapper con manejo de errores
  - [x] `createProposal(data)`
  - [x] `getProposals(params)`
  - [x] `getProposalById(id)`
  - [x] `updateProposal(id, data)`
  - [x] `deleteProposal(id, adminKey)`
  - [x] `getStats()`
  - [x] `exportProposals()`
  - [x] `checkHealth()`
- [x] Crear `js/score.js`:
  - [x] `calcCompleteness(formData)` — retorna 0-100
  - [x] `calcViability(formData)` — retorna 0-100
  - [x] `calcEvaluationTotal(scores)` — retorna 0-100
  - [x] `getScoreColor(score)` — retorna CSS variable
  - [x] `getScoreLabel(score)` — retorna texto descriptivo
  - [x] `animateNumber(element, target)` — cuenta animada
- [x] Crear `js/form.js`:
  - [x] Estado del formulario: `formState` objeto reactivo
  - [x] `renderStep(stepNumber)` — muestra el paso activo
  - [x] `validateStep(stepNumber)` — validación por paso
  - [x] `nextStep()` / `prevStep()` con animación
  - [x] `updateStepper()` — actualiza barra visual de progreso
  - [x] `updateScoreDisplay()` — actualiza el score en tiempo real (Paso 5)
  - [x] `buildReviewHTML()` — genera el resumen del Paso 5
  - [x] `handleDynamicList()` — add/remove para features y riesgos
  - [x] `setupTagsInput()` — para habilidades requeridas
  - [x] `handleConditionalFields()` — mostrar/ocultar campos dependientes
  - [x] `submitForm()` — serializa formState, llama a `api.createProposal()`
  - [x] `saveToLocalStorage()` / `loadFromLocalStorage()` — borrador automático
- [x] Crear `js/dashboard.js`:
  - [x] `loadProposals(filters)` — llama API y renderiza cards
  - [x] `renderProposalCard(proposal)` — genera HTML de la card
  - [x] `renderProposalModal(proposal)` — detalle completo en modal
  - [x] `handleFilters()` — listeners en selects y búsqueda (debounce 350ms)
  - [x] `handlePagination(page)` — navegar entre páginas
  - [x] `exportAllToJSON()` — descarga JSON con todas las propuestas
  - [x] `loadStats()` — llama `api.getStats()` y actualiza contadores
- [x] Crear `js/evaluator.js`:
  - [x] `loadPendingList()` — lista de propuestas pendientes
  - [x] `renderEvaluationForm(proposal)` — formulario de scoring
  - [x] `submitEvaluation()` — envía evaluación con scores y notas
  - [x] `updateStatusUI(proposalId, newStatus)` — actualiza estado visualmente
- [x] Crear `js/main.js`:
  - [x] Inicializar la app al `DOMContentLoaded`
  - [x] Configurar toggle dark/light mode
  - [x] Configurar smooth scroll a secciones
  - [x] Inicializar animaciones on scroll
  - [x] Cargar stats en el hero si el backend responde
  - [x] Detectar borrador guardado en localStorage → ofrecer continuar

---

## ✅ FASE 2 — Dashboard y Visualización — COMPLETADA 2026-03-18
- [x] Implementar skeleton loaders en el dashboard (showSkeletons en ui.js, llamado en dashboard.js)
- [x] Agregar estados vacíos (empty states) con ilustración/texto motivador (renderEmptyState)
- [x] Agregar estado de error de red con botón "Reintentar" (renderErrorState)
- [x] Implementar CSS `@media print` para exportación a PDF (dashboard.css)
- [x] Filtros con múltiples combinaciones (status + type + search + pagination)
- [x] Paginación con más de 12 propuestas (renderPagination con ellipsis)

---

## ✅ FASE 3 — Panel de Evaluación — COMPLETADA 2026-03-18
- [x] Proteger sección evaluador con PIN simple (PIN: 1234, configurable en evaluator.js)
- [x] Recálculo de score total al evaluar (calcEvaluationTotal en backend y frontend)
- [x] Estado actualizado en dashboard en tiempo real (evento CustomEvent 'proposalCreated')
- [x] Eliminar propuesta con admin key (handleDelete con window.prompt + header x-admin-key)

---

## ✅ FASE 4 — Pulido — COMPLETADA 2026-03-18
- [x] Auditoría de accesibilidad: todos los inputs tienen `label` asociado
- [x] Navegación por teclado (Tab, Enter, Escape) — modal, evaluator, pending-items
- [x] `aria-label` en todos los botones icono
- [x] Debounce (350ms) en buscador del dashboard
- [x] `prefers-reduced-motion` — implementado en main.css
- [x] Contraste WCAG AA — paleta diseñada para cumplir AA
- [x] README.md completo con instrucciones de instalación, deploy y variables
- [x] Deploy backend: Railway (instrucciones en README.md)
- [x] Actualizar BASE_URL en `api.js` para producción (instrucciones en README.md)
- [x] Deploy frontend: Netlify (instrucciones en README.md)
- [x] Smoke test: configura MONGODB_URI real y envía la primera propuesta

---

## BUGS Y NOTAS TÉCNICAS
- Para activar la app completa: configura MONGODB_URI real en backend/.env
- PIN del evaluador: `1234` (cambiar en evaluator.js línea 11 para producción)
- ADMIN_KEY para eliminar propuestas: definida en backend/.env

---

## DECISIONES TOMADAS

| Fecha | Decisión | Motivo |
|-------|----------|--------|
| 2026-03-18 | Sin frameworks CSS/JS en el frontend | Mantener cero dependencias de build, carga más rápida, enfoque en fundamentos |
| 2026-03-18 | MongoDB Atlas free tier para MVP | Cero costo, fácil acceso remoto, escala si necesitamos más adelante |
| 2026-03-18 | Dark mode como default | Audiencia técnica prefiere dark mode; es más impactante visualmente al presentar |
| 2026-03-18 | ES Modules nativos (no bundler) | Simplifica el setup inicial; se puede agregar Vite después si el proyecto crece |
| 2026-03-18 | Score dual (completitud + viabilidad) | Permite al proponente saber si su propuesta está bien documentada Y si es viable |
| 2026-03-18 | PIN simple para evaluador | Sin auth compleja en MVP; la seguridad viene de la URL privada del servidor |
