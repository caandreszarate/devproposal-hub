# SPEC — Especificación Técnica: DevProposal Hub

## 1. Resumen del sistema

**DevProposal Hub** es una aplicación web fullstack que permite a equipos de desarrollo proponer, documentar, almacenar y evaluar proyectos de software siguiendo un estándar unificado. El sistema consta de:

- **Frontend:** SPA en HTML/CSS/JS vanilla, hosteada de forma estática
- **Backend:** API REST en Node.js + Express
- **Base de datos:** MongoDB Atlas (Mongoose ODM)

---

## 2. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                    │
│  index.html + styles/ + js/                         │
│  - hero.js, guide.js, form.js, dashboard.js         │
│  - api.js (fetch wrapper), ui.js (helpers)          │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST (JSON)
                     ▼
┌─────────────────────────────────────────────────────┐
│                  BACKEND (Express)                   │
│  server.js → routes/ → controllers/ → models/       │
│  Middlewares: cors, helmet, validation, errorHandler │
└────────────────────┬────────────────────────────────┘
                     │ Mongoose
                     ▼
┌─────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud)                   │
│  DB: devproposal_hub                                 │
│  Collections: proposals, evaluations (futuro)        │
└─────────────────────────────────────────────────────┘
```

---

## 3. Estructura de archivos

```
presentacion_proyectos_dev/
├── frontend/
│   ├── index.html
│   ├── styles/
│   │   ├── main.css          # Variables, reset, base
│   │   ├── components.css    # Cards, buttons, badges, modals
│   │   ├── form.css          # Stepper, inputs, validaciones
│   │   ├── dashboard.css     # Grid de propuestas, filtros
│   │   └── animations.css    # Keyframes, transiciones
│   ├── js/
│   │   ├── main.js           # Entry point, init, theme toggle
│   │   ├── api.js            # Fetch wrapper con manejo de errores
│   │   ├── form.js           # Lógica del formulario multi-paso
│   │   ├── dashboard.js      # Carga y renderizado de propuestas
│   │   ├── evaluator.js      # Panel de evaluación
│   │   ├── score.js          # Cálculo de score de completitud/viabilidad
│   │   └── ui.js             # Toast, modal, loaders, helpers DOM
│   └── assets/
│       └── icons/            # SVGs inline extraídos de Lucide
│
├── backend/
│   ├── server.js             # Entry point Express
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js         # Conexión MongoDB
│   │   ├── models/
│   │   │   └── Proposal.js   # Mongoose schema
│   │   ├── controllers/
│   │   │   └── proposalController.js
│   │   ├── routes/
│   │   │   └── proposals.js
│   │   ├── middleware/
│   │   │   ├── validation.js # Joi schemas
│   │   │   └── errorHandler.js
│   │   └── utils/
│   │       └── scoreCalculator.js
│
├── idea.md
├── prompt.md
├── spec.md
├── roadmap.md
└── to-do.md
```

---

## 4. Modelo de datos — MongoDB

### Colección: `proposals`

```javascript
{
  // === Identificación ===
  projectName:    { type: String, required: true, trim: true, maxLength: 100 },
  proposerName:   { type: String, required: true, trim: true },
  team:           { type: String, trim: true },
  proposalDate:   { type: Date, default: Date.now },
  projectType:    {
    type: String,
    enum: ['web_app', 'mobile', 'api', 'data', 'ai', 'other'],
    required: true
  },

  // === Problema ===
  problemDescription: { type: String, required: true, minLength: 100 },
  targetUsers:        { type: String },
  existingSolutions:  { type: Boolean, default: false },
  existingDetails:    { type: String },
  urgencyLevel:       { type: Number, min: 1, max: 5, default: 3 },

  // === Solución ===
  solutionDescription: { type: String, required: true },
  techStack:           [{ type: String }],
  keyFeatures:         [{ type: String }],
  mvpScope:            { type: String },

  // === Viabilidad ===
  estimatedTime:    {
    type: String,
    enum: ['1_2_weeks', '1_month', '3_months', '6_plus_months']
  },
  teamSize:         { type: Number, min: 1 },
  requiredSkills:   [{ type: String }],
  identifiedRisks:  [{ type: String }],
  expectedBenefit:  { type: String, enum: ['high', 'medium', 'low'] },
  requiresBudget:   { type: Boolean, default: false },
  budgetAmount:     { type: Number },

  // === Estado y evaluación ===
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  score: {
    completeness:  { type: Number, min: 0, max: 100 },  // % campos llenos
    viability:     { type: Number, min: 0, max: 100 },  // score calculado
    impact:        { type: Number, min: 1, max: 5 },    // evaluador
    feasibility:   { type: Number, min: 1, max: 5 },    // evaluador
    innovation:    { type: Number, min: 1, max: 5 },    // evaluador
    resources:     { type: Number, min: 1, max: 5 },    // evaluador
    total:         { type: Number, min: 0, max: 100 }   // ponderado
  },
  evaluatorNotes: { type: String },
  evaluatedBy:    { type: String },
  evaluatedAt:    { type: Date },

  // === Metadatos ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 5. API REST — Especificación de endpoints

### `POST /api/proposals`
- **Descripción:** Crear nueva propuesta
- **Body:** JSON con campos del modelo (sin status/score/evaluación)
- **Respuesta 201:** `{ success: true, data: proposal, message: "Propuesta creada" }`
- **Respuesta 400:** Errores de validación Joi
- **Efecto secundario:** Calcula `score.completeness` y `score.viability` automáticamente

### `GET /api/proposals`
- **Descripción:** Listar propuestas con paginación y filtros
- **Query params:**
  - `page` (default: 1), `limit` (default: 12)
  - `status` — filtro por estado
  - `type` — filtro por tipo de proyecto
  - `search` — búsqueda por nombre (regex case-insensitive)
  - `sortBy` — campo de orden (default: createdAt)
  - `order` — `asc` | `desc` (default: desc)
- **Respuesta 200:** `{ success: true, data: [], total, page, totalPages }`

### `GET /api/proposals/:id`
- **Descripción:** Obtener propuesta completa por ID
- **Respuesta 200:** `{ success: true, data: proposal }`
- **Respuesta 404:** Propuesta no encontrada

### `PATCH /api/proposals/:id`
- **Descripción:** Actualizar estado o agregar evaluación
- **Body parcial:** `{ status, evaluatorNotes, score: { impact, feasibility, innovation, resources }, evaluatedBy }`
- **Respuesta 200:** `{ success: true, data: updatedProposal }`
- **Efecto secundario:** Recalcula `score.total` ponderado

### `DELETE /api/proposals/:id`
- **Descripción:** Eliminar propuesta (requiere header `x-admin-key`)
- **Respuesta 200:** `{ success: true, message: "Propuesta eliminada" }`

### `GET /api/proposals/export`
- **Descripción:** Exportar todas las propuestas como JSON
- **Respuesta 200:** Array completo de propuestas (para procesamiento externo)

### `GET /api/stats`
- **Descripción:** Estadísticas generales
- **Respuesta 200:**
```json
{
  "total": 42,
  "byStatus": { "pending": 15, "under_review": 10, "approved": 12, "rejected": 5 },
  "byType": { "web_app": 20, "mobile": 8, "api": 6, "data": 4, "ai": 4 },
  "avgViabilityScore": 67.3,
  "recentProposals": [ ...últimas 5 ]
}
```

---

## 6. Cálculo de scores

### Score de Completitud (frontend + backend)
```
completeness = (camposLlenos / totalCamposOpcionales) * 100
```
Campos ponderados: problemDescription (15%), solutionDescription (15%),
keyFeatures (10%), techStack (10%), mvpScope (10%), identifiedRisks (10%),
estimatedTime (10%), teamSize (5%), targetUsers (10%), urgencyLevel (5%)

### Score de Viabilidad (backend, al guardar)
```
viability =
  benefitScore (30%) +     // high=100, medium=60, low=30
  timeScore (25%) +         // 1-2w=100, 1m=80, 3m=60, 6m+=30
  urgencyScore (20%) +      // urgencyLevel * 20
  riskScore (15%) +         // 100 - (cantidadRiesgos * 15), min 0
  budgetScore (10%)         // noBudget=100, hasBudget=50
```

### Score Total de Evaluación (tras evaluación manual)
```
total = (impact * 0.35) + (feasibility * 0.30) +
        (innovation * 0.20) + (resources * 0.15)
total = (total / 5) * 100  // normalizar a 0-100
```

---

## 7. Requisitos no funcionales

| Requisito | Especificación |
|-----------|---------------|
| Performance | Carga inicial < 2s, animaciones a 60fps |
| Responsividad | Funcional desde 360px hasta 4K |
| Accesibilidad | ARIA labels, navegación por teclado, contraste WCAG AA |
| Offline | El formulario funciona sin backend; guarda en localStorage y reintenta |
| Seguridad | Sanitización de inputs, rate limiting en API, CORS restrictivo |
| SEO | Meta tags básicos, OG tags para compartir propuestas |

---

## 8. Variables de entorno (backend)

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/devproposal_hub
NODE_ENV=development
ADMIN_KEY=clave_secreta_para_delete
CORS_ORIGIN=http://localhost:5500
```

---

## 9. Dependencias

### Backend
```json
{
  "express": "^4.18.x",
  "mongoose": "^8.x",
  "cors": "^2.8.x",
  "helmet": "^7.x",
  "joi": "^17.x",
  "dotenv": "^16.x",
  "express-rate-limit": "^7.x"
}
```

### Frontend
Sin dependencias externas de build. Se carga desde CDN:
- Google Fonts: Inter, JetBrains Mono (preconnect)
- No se usa ningún bundler para MVP — ES Modules nativos del browser
