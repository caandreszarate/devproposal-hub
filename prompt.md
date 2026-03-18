# PROMPT — Instrucciones de diseño y construcción para DevProposal Hub

## Contexto del proyecto
Construye una aplicación web llamada **DevProposal Hub**, una plataforma para que equipos de desarrollo presenten, estandaricen y evalúen propuestas de proyectos de software. El sitio debe ser **visualmente impactante, profesional y altamente usable**.

---

## Instrucciones de diseño (UI/UX)

### Identidad visual
- **Paleta de colores:**
  - Primario: `#6C63FF` (violeta eléctrico)
  - Secundario: `#00D4AA` (verde menta tecnológico)
  - Fondo dark: `#0D0D1A`
  - Fondo light: `#F4F6FB`
  - Texto oscuro: `#1A1A2E`
  - Texto claro: `#E8E8F0`
  - Acento error: `#FF4757`
  - Acento éxito: `#2ED573`
- **Tipografía:**
  - Títulos: `Inter` o `Poppins` (Google Fonts) — bold, tracking ajustado
  - Cuerpo: `Inter` regular
  - Monospace (para código/IDs): `JetBrains Mono`
- **Dark mode por defecto** con toggle para light mode, persistido en localStorage

### Estilo visual
- Glassmorphism en cards (backdrop-filter blur + bordes semitransparentes)
- Gradientes sutiles en headers y botones primarios
- Micro-animaciones: hover effects, transiciones de página con fade/slide suave
- Iconografía: Lucide Icons o Heroicons (SVG inline)
- Sombras con color del primario: `box-shadow: 0 8px 32px rgba(108,99,255,0.2)`
- Partículas o malla animada en el hero (canvas o CSS puro)

### Layout
- Single Page Application con secciones ancladas (no router externo)
- Mobile-first, breakpoints: 480px / 768px / 1024px / 1280px
- Sidebar fija en desktop para navegación entre secciones del formulario
- Stepper visual de progreso (Paso 1 de 5) en el formulario multi-paso

---

## Instrucciones funcionales

### Sección 1 — Hero / Landing
- Headline poderoso: "Convierte tu idea en un proyecto real"
- Subheadline explicando el propósito de la plataforma
- CTA principal: "Proponer un Proyecto" → abre el formulario multi-paso
- CTA secundario: "Ver Propuestas" → navega al dashboard
- Animación de fondo: partículas o formas geométricas flotantes

### Sección 2 — Guía (¿Cómo proponer?)
- Cards explicativas de cada sección del formulario con íconos
- Debe sentirse educativa: "Antes de empezar, considera estos puntos..."
- Acordeones con buenas prácticas por cada campo
- Ejemplos reales de propuestas bien redactadas (hardcoded como demo)

### Sección 3 — Formulario Multi-paso (corazón de la app)
**Paso 1: Identificación**
- Nombre del proyecto (requerido)
- Proponente (nombre completo)
- Área o equipo
- Fecha de propuesta (auto-rellenada)
- Tipo de proyecto: dropdown (Web App / Mobile / API / Data / IA / Otro)

**Paso 2: Descripción del Problema**
- Problema que resuelve (textarea con contador de caracteres, mín 100)
- A quién afecta el problema (usuarios objetivo)
- ¿Existe algo similar actualmente? (radio sí/no + campo condicional)
- Urgencia estimada: slider 1-5

**Paso 3: Propuesta de Solución**
- Descripción de la solución (textarea enriquecida)
- Stack tecnológico sugerido (checkboxes: React, Node, Python, etc. + campo libre)
- Funcionalidades clave (lista dinámica: add/remove items)
- Alcance del MVP (textarea)

**Paso 4: Viabilidad y Recursos**
- Tiempo estimado de desarrollo: dropdown (1-2 sem / 1 mes / 3 meses / 6+ meses)
- Personas requeridas: número
- Conocimientos técnicos necesarios: tags input
- Riesgos identificados (lista dinámica)
- Beneficio estimado: dropdown (Alto / Medio / Bajo)
- ¿Requiere presupuesto? radio + campo monto si aplica

**Paso 5: Revisión y Envío**
- Resumen visual de todos los campos completados
- Score de completitud (0-100%) calculado en tiempo real
- Score de viabilidad preliminar basado en los campos de viabilidad
- Checkbox de confirmación
- Botón "Enviar Propuesta" → POST a la API

### Sección 4 — Dashboard de Propuestas
- Grid de cards con las propuestas guardadas en MongoDB
- Filtros: por estado (Pendiente / En revisión / Aprobada / Rechazada), tipo, fecha
- Búsqueda en tiempo real por nombre
- Click en card abre modal con detalle completo
- Badge de score de viabilidad en cada card
- Botón exportar propuesta individual a PDF (usando window.print o jsPDF)

### Sección 5 — Panel de Evaluación (vista evaluador)
- Lista de propuestas pendientes de evaluación
- Formulario de scoring con criterios: Impacto (1-5), Factibilidad (1-5), Innovación (1-5), Recursos (1-5)
- Campo de comentarios/retroalimentación
- Botón cambiar estado + notificación visual (toast)

---

## Instrucciones para el backend (API REST)

```
POST   /api/proposals          → Crear nueva propuesta
GET    /api/proposals          → Listar todas (con paginación y filtros)
GET    /api/proposals/:id      → Obtener una propuesta por ID
PATCH  /api/proposals/:id      → Actualizar estado/evaluación
DELETE /api/proposals/:id      → Eliminar (solo admin)
GET    /api/proposals/export   → Exportar todas a JSON/Excel
GET    /api/stats              → Estadísticas generales del dashboard
```

## Instrucciones para MongoDB (esquema)
- Colección: `proposals`
- Incluir: timestamps automáticos (createdAt, updatedAt)
- Campo `status`: enum ['pending', 'under_review', 'approved', 'rejected']
- Campo `score`: objeto con subscores por criterio + total calculado
- Campo `evaluatorNotes`: string (comentarios del evaluador)

---

## Tono y estilo de los textos
- Profesional pero cercano — no corporativo frío
- Orientado a acción: verbos imperativos ("Define", "Describe", "Estima")
- Tooltips con emojis sutiles para hacer la experiencia más amigable
- Placeholders descriptivos con ejemplos reales en cada campo

---

## Restricciones técnicas
- **Sin frameworks CSS externos** (no Bootstrap, no Tailwind) — CSS custom puro
- **Sin frameworks JS** (no React, no Vue) — JavaScript vanilla ES2022+
- **Módulos ES** (`type="module"` en script tags)
- **Fetch API** para comunicación con el backend (no axios)
- **CSS Custom Properties** para theming completo
- El sitio debe funcionar con el backend caído (modo offline graceful)
