# ROADMAP — DevProposal Hub

## Visión de largo plazo
Convertirse en la herramienta estándar de referencia para que equipos de cualquier tamaño propongan, evalúen y gestionen ideas de software con trazabilidad completa desde la idea hasta la entrega.

---

## Fase 0 — Preparación (Semana 0)
> **Objetivo:** Infraestructura mínima lista para desarrollar

- [ ] Configurar repositorio Git con estructura de carpetas
- [ ] Crear proyecto MongoDB Atlas (free tier)
- [ ] Configurar variables de entorno (`.env`)
- [ ] Documentar los 5 archivos spec-driven (`idea.md`, `prompt.md`, `spec.md`, `roadmap.md`, `to-do.md`)
- [ ] Definir paleta de colores y sistema de diseño base
- [ ] Validar que el stack tecnológico es accesible para el equipo

**Entregable:** Repositorio inicializado con documentación completa

---

## Fase 1 — MVP Core (Semanas 1–3)
> **Objetivo:** El sistema puede recibir y almacenar propuestas

### Sprint 1.1 — Backend base (días 1–4)
- [ ] Inicializar proyecto Node.js + Express
- [ ] Configurar conexión a MongoDB Atlas con Mongoose
- [ ] Crear modelo `Proposal.js` completo
- [ ] Implementar `POST /api/proposals` con validación Joi
- [ ] Implementar `GET /api/proposals` con paginación básica
- [ ] Implementar `GET /api/proposals/:id`
- [ ] Agregar middleware de manejo de errores
- [ ] Configurar CORS y Helmet
- [ ] Probar endpoints con Postman/Thunder Client

### Sprint 1.2 — Frontend: estructura y estilos (días 5–9)
- [ ] Crear `index.html` con estructura semántica completa
- [ ] Implementar sistema de variables CSS (tema dark/light)
- [ ] Construir el Hero con animación de fondo (canvas o CSS)
- [ ] Construir sección de Guía con cards y acordeones
- [ ] Implementar toggle dark/light mode con localStorage
- [ ] Asegurar responsividad básica (mobile-first)

### Sprint 1.3 — Formulario multi-paso (días 10–15)
- [ ] Implementar stepper visual (barra de progreso)
- [ ] Construir los 5 pasos del formulario con todos sus campos
- [ ] Validación en tiempo real por paso (antes de avanzar)
- [ ] Score de completitud en tiempo real (Paso 5)
- [ ] Resumen visual en Paso 5
- [ ] Conectar con `POST /api/proposals` (módulo `api.js`)
- [ ] Toast de confirmación al enviar
- [ ] Fallback a localStorage si el backend no responde

**Entregable Fase 1:** Usuario puede completar y enviar una propuesta que se guarda en MongoDB ✓

---

## Fase 2 — Dashboard y Visualización (Semanas 4–5)
> **Objetivo:** Las propuestas son consultables y navegables

### Sprint 2.1 — Dashboard de propuestas (días 16–20)
- [ ] Grid de cards con propuestas desde la API
- [ ] Skeleton loaders durante la carga
- [ ] Filtros por estado, tipo y búsqueda en tiempo real
- [ ] Paginación (12 por página)
- [ ] Modal de detalle al hacer click en una card
- [ ] Badge de score de viabilidad con color semafórico

### Sprint 2.2 — Estadísticas y exportación (días 21–25)
- [ ] Implementar `GET /api/stats` en backend
- [ ] Mini-dashboard con contadores en el hero/header
- [ ] Botón exportar propuesta individual a PDF (window.print con CSS @media print)
- [ ] Implementar `GET /api/proposals/export` (JSON masivo)
- [ ] Ruta `PATCH /api/proposals/:id` para cambio de estado

**Entregable Fase 2:** Dashboard funcional con filtros, detalle y exportación ✓

---

## Fase 3 — Panel de Evaluación (Semanas 6–7)
> **Objetivo:** Los evaluadores pueden puntuar y dar feedback a propuestas

- [ ] Crear sección "Evaluador" en el frontend (accesible por URL anchor)
- [ ] Formulario de scoring con 4 criterios (sliders 1-5)
- [ ] Campo de notas para el evaluador
- [ ] Cálculo de score total ponderado (score.js)
- [ ] Cambio de estado visual con confirmación
- [ ] Historial de evaluaciones por propuesta (en modal de detalle)
- [ ] Implementar `DELETE /api/proposals/:id` con header de admin
- [ ] Recalcular y actualizar `score.total` en el backend al evaluar

**Entregable Fase 3:** Evaluadores pueden calificar propuestas y actualizar su estado ✓

---

## Fase 4 — Pulido y Producción (Semana 8)
> **Objetivo:** El sistema está listo para ser usado por el equipo real

- [ ] Auditoría de accesibilidad (ARIA, navegación por teclado)
- [ ] Optimización de performance (lazy loading, debounce en búsqueda)
- [ ] Manejo de estados vacíos (no hay propuestas, error de red, etc.)
- [ ] Revisión de seguridad (sanitización, rate limiting, headers)
- [ ] Escribir README completo con instrucciones de instalación
- [ ] Deploy backend (Railway o Render — free tier)
- [ ] Deploy frontend (Netlify o GitHub Pages)
- [ ] Configurar dominio o subdominio (opcional)
- [ ] Smoke testing en producción

**Entregable Fase 4:** Sistema en producción, accesible por el equipo ✓

---

## Fase 5 — Post-MVP: Mejoras iterativas (Meses 2–3)

### Prioridad Alta
- [ ] Sistema de autenticación (JWT) con roles: proponente / evaluador / admin
- [ ] Notificaciones por correo al cambiar estado (Nodemailer o Resend)
- [ ] Comentarios y preguntas en propuestas (sub-colección o array embebido)

### Prioridad Media
- [ ] Sistema de votación / "me interesa" para propuestas públicas
- [ ] Integración webhook con Slack (notificar nueva propuesta al canal)
- [ ] Exportación a Excel con múltiples hojas (xlsx via ExcelJS)
- [ ] Campo de adjuntos (upload de mockups/diagramas a Cloudinary)

### Prioridad Baja / Exploratorio
- [ ] Asistente IA para mejorar redacción de la propuesta (Claude API)
- [ ] Integración con Jira/Linear para crear ticket al aprobar
- [ ] Analytics de patrones: qué tipos de proyectos se aprueban más
- [ ] Modo "plantilla": guardar y reusar estructuras de propuestas

---

## Criterios de éxito por fase

| Fase | Métrica de éxito |
|------|-----------------|
| 0 | Repo creado, BD conectada, docs completos |
| 1 | Al menos 1 propuesta guardada en MongoDB desde el formulario |
| 2 | Dashboard muestra y filtra propuestas correctamente |
| 3 | Propuesta evaluada y estado actualizado con score calculado |
| 4 | Sistema accesible en URL pública, sin errores críticos |
| Post-MVP | 10+ propuestas reales de miembros del equipo enviadas |

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Complejidad del formulario multi-paso | Media | Alto | Construir paso a paso, probar cada step por separado |
| MongoDB Atlas caído o lento | Baja | Medio | localStorage como buffer temporal |
| Baja adopción del equipo | Media | Alto | Involucrar al equipo desde el diseño, hacer demos tempranas |
| Scope creep (agregar features) | Alta | Medio | Mantener disciplina con el roadmap, deferr a Fase 5 |
