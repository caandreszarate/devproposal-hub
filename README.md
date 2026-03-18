# DevProposal Hub

Plataforma web para proponer, estandarizar y evaluar proyectos de software en equipo.
Construida con HTML/CSS/JS vanilla + Node.js/Express + MongoDB Atlas.

---

## Estructura del proyecto

```
presentacion_proyectos_dev/
├── frontend/         # SPA — HTML, CSS, JS sin frameworks
│   ├── index.html
│   ├── styles/       # main, components, form, dashboard, animations
│   └── js/           # main, api, form, dashboard, evaluator, score, ui
├── backend/          # API REST — Node.js + Express + Mongoose
│   ├── server.js
│   └── src/          # config, models, controllers, routes, middleware, utils
├── idea.md
├── prompt.md
├── spec.md
├── roadmap.md
└── to-do.md
```

---

## Requisitos previos

- Node.js 18+ y npm
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier M0)

---

## Instalación y arranque

### 1. Clonar y entrar al proyecto

```bash
git clone <url-del-repo>
cd presentacion_proyectos_dev
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tus valores:

```env
PORT=3000
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster0.xxxxx.mongodb.net/devproposal_hub
NODE_ENV=development
ADMIN_KEY=clave_secreta_para_borrar
CORS_ORIGIN=http://localhost:5500
```

```bash
npm install
npm run dev        # con nodemon (recarga automática)
# o
npm start          # producción
```

El backend correrá en `http://localhost:3000`

### 3. Arrancar el frontend

**Opción A — VS Code Live Server (recomendado):**
1. Instala la extensión "Live Server" en VS Code
2. Click derecho en `frontend/index.html` → "Open with Live Server"
3. Se abre en `http://localhost:5500`

**Opción B — Python:**
```bash
cd frontend
python3 -m http.server 5500
```

**Opción C — npx serve:**
```bash
cd frontend
npx serve -p 5500
```

---

## Variables de entorno

| Variable        | Descripción                                  | Ejemplo                          |
|----------------|----------------------------------------------|----------------------------------|
| `PORT`          | Puerto del servidor Express                  | `3000`                           |
| `MONGODB_URI`   | URI de conexión a MongoDB Atlas              | `mongodb+srv://user:pass@...`    |
| `NODE_ENV`      | Entorno (`development` / `production`)       | `development`                    |
| `ADMIN_KEY`     | Clave secreta para eliminar propuestas       | `mi_clave_secreta`               |
| `CORS_ORIGIN`   | Origen permitido para CORS                   | `http://localhost:5500`          |

---

## Endpoints de la API

| Método   | Endpoint                    | Descripción                          |
|----------|-----------------------------|--------------------------------------|
| `GET`    | `/api/health`               | Health check del servidor            |
| `POST`   | `/api/proposals`            | Crear nueva propuesta                |
| `GET`    | `/api/proposals`            | Listar propuestas (filtros + paginación) |
| `GET`    | `/api/proposals/stats`      | Estadísticas generales               |
| `GET`    | `/api/proposals/export`     | Exportar todas a JSON                |
| `GET`    | `/api/proposals/:id`        | Obtener propuesta por ID             |
| `PATCH`  | `/api/proposals/:id`        | Actualizar estado / evaluación       |
| `DELETE` | `/api/proposals/:id`        | Eliminar (requiere `x-admin-key`)    |

---

## Funcionalidades

### Para proponentes
- Formulario multi-paso de 5 pasos con validación en tiempo real
- Score de completitud y viabilidad calculado automáticamente
- Borrador guardado en localStorage (no se pierde si cierras el navegador)
- Modo dark/light con preferencia persistida

### Para evaluadores
- Panel protegido con PIN (PIN demo: `1234`)
- Scoring con 4 criterios: Impacto (35%), Factibilidad (30%), Innovación (20%), Recursos (15%)
- Score total calculado automáticamente
- Cambio de estado: Pendiente → En revisión → Aprobada / Rechazada
- Campo de notas y retroalimentación

### Dashboard
- Grid de propuestas con filtros por estado, tipo y búsqueda en tiempo real
- Paginación (12 por página)
- Modal de detalle completo
- Exportación a PDF (window.print con CSS @media print)
- Exportación masiva a JSON

---

## Deploy en producción

### Backend — Railway (gratuito)

1. Crea cuenta en [Railway](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Agrega variables de entorno en el panel de Railway
4. Railway asigna una URL pública automáticamente

### Frontend — Netlify (gratuito)

1. Arrastra la carpeta `frontend/` a [netlify.com/drop](https://app.netlify.com/drop)
2. Netlify asigna una URL pública
3. Actualiza `BASE_URL` en `frontend/js/api.js` con la URL de Railway:
   ```javascript
   export const BASE_URL = 'https://tu-app.up.railway.app/api';
   ```
4. Actualiza `CORS_ORIGIN` en Railway con la URL de Netlify

---

## Configuración de MongoDB Atlas

1. Crea una cuenta en [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Crea un cluster M0 (gratuito)
3. En **Database Access**: crea usuario con contraseña
4. En **Network Access**: agrega `0.0.0.0/0` (o IP específica)
5. En **Connect → Connect your application**: copia el URI y reemplaza en `.env`

---

## Tecnologías

**Frontend:** HTML5, CSS3 (Custom Properties, Grid, Flexbox), JavaScript ES2022+ (Modules, Fetch API)

**Backend:** Node.js, Express 4, Mongoose 8, Joi, Helmet, CORS, express-rate-limit

**Base de datos:** MongoDB Atlas (documentos JSON, índices de texto)

**Design system:** Glassmorphism, dark mode default, Inter + JetBrains Mono fonts
