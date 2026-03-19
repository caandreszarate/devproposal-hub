/* ============================================================
   form.js — Formulario multi-paso completo
   ============================================================ */
import { createProposal } from './api.js';
import { calcCompleteness, calcViability, getScoreColor, getScoreLabel, animateNumber } from './score.js';
import { showToast, escapeHtml, getTimeLabel, getBenefitLabel, getTypeLabel, setButtonLoading } from './ui.js';

const DRAFT_KEY = 'devproposal_draft';
const TOTAL_STEPS = 5;

// Estado global del formulario
export let formState = {
  step: 1,
  data: {
    projectName: '', proposerName: '', email: '', phoneCode: '', phoneNumber: '',
    presentationDate: '', projectType: '',
    problemDescription: '', targetUsers: '', existingSolutions: false,
    existingDetails: '', urgencyLevel: 3,
    solutionDescription: '', techStack: [], keyFeatures: [], mvpScope: '',
    estimatedTime: '', teamSize: 1, requiredSkills: [], identifiedRisks: [],
    expectedBenefit: '', requiresBudget: false, budgetAmount: 0
  }
};

// Lista de indicativos telefónicos por país
const PHONE_CODES = [
  {code:'+93',country:'Afganistán'},{code:'+355',country:'Albania'},{code:'+213',country:'Argelia'},
  {code:'+376',country:'Andorra'},{code:'+244',country:'Angola'},{code:'+54',country:'Argentina'},
  {code:'+374',country:'Armenia'},{code:'+61',country:'Australia'},{code:'+43',country:'Austria'},
  {code:'+994',country:'Azerbaiyán'},{code:'+1242',country:'Bahamas'},{code:'+973',country:'Baréin'},
  {code:'+880',country:'Bangladés'},{code:'+375',country:'Bielorrusia'},{code:'+32',country:'Bélgica'},
  {code:'+501',country:'Belice'},{code:'+229',country:'Benín'},{code:'+975',country:'Bután'},
  {code:'+591',country:'Bolivia'},{code:'+387',country:'Bosnia y Herzegovina'},{code:'+267',country:'Botsuana'},
  {code:'+55',country:'Brasil'},{code:'+673',country:'Brunéi'},{code:'+359',country:'Bulgaria'},
  {code:'+226',country:'Burkina Faso'},{code:'+257',country:'Burundi'},{code:'+238',country:'Cabo Verde'},
  {code:'+855',country:'Camboya'},{code:'+237',country:'Camerún'},{code:'+1',country:'Canadá'},
  {code:'+236',country:'Rep. Centroafricana'},{code:'+235',country:'Chad'},{code:'+56',country:'Chile'},
  {code:'+86',country:'China'},{code:'+57',country:'Colombia'},{code:'+269',country:'Comoras'},
  {code:'+242',country:'Congo'},{code:'+506',country:'Costa Rica'},{code:'+385',country:'Croacia'},
  {code:'+53',country:'Cuba'},{code:'+357',country:'Chipre'},{code:'+420',country:'República Checa'},
  {code:'+45',country:'Dinamarca'},{code:'+253',country:'Yibuti'},{code:'+1809',country:'República Dominicana'},
  {code:'+593',country:'Ecuador'},{code:'+20',country:'Egipto'},{code:'+503',country:'El Salvador'},
  {code:'+240',country:'Guinea Ecuatorial'},{code:'+291',country:'Eritrea'},{code:'+372',country:'Estonia'},
  {code:'+251',country:'Etiopía'},{code:'+679',country:'Fiyi'},{code:'+358',country:'Finlandia'},
  {code:'+33',country:'Francia'},{code:'+241',country:'Gabón'},{code:'+220',country:'Gambia'},
  {code:'+995',country:'Georgia'},{code:'+49',country:'Alemania'},{code:'+233',country:'Ghana'},
  {code:'+30',country:'Grecia'},{code:'+502',country:'Guatemala'},{code:'+224',country:'Guinea'},
  {code:'+245',country:'Guinea-Bisáu'},{code:'+592',country:'Guyana'},{code:'+509',country:'Haití'},
  {code:'+504',country:'Honduras'},{code:'+36',country:'Hungría'},{code:'+354',country:'Islandia'},
  {code:'+91',country:'India'},{code:'+62',country:'Indonesia'},{code:'+98',country:'Irán'},
  {code:'+964',country:'Irak'},{code:'+353',country:'Irlanda'},{code:'+972',country:'Israel'},
  {code:'+39',country:'Italia'},{code:'+1876',country:'Jamaica'},{code:'+81',country:'Japón'},
  {code:'+962',country:'Jordania'},{code:'+7',country:'Kazajistán'},{code:'+254',country:'Kenia'},
  {code:'+686',country:'Kiribati'},{code:'+383',country:'Kosovo'},{code:'+965',country:'Kuwait'},
  {code:'+996',country:'Kirguistán'},{code:'+856',country:'Laos'},{code:'+371',country:'Letonia'},
  {code:'+961',country:'Líbano'},{code:'+266',country:'Lesoto'},{code:'+231',country:'Liberia'},
  {code:'+218',country:'Libia'},{code:'+423',country:'Liechtenstein'},{code:'+370',country:'Lituania'},
  {code:'+352',country:'Luxemburgo'},{code:'+261',country:'Madagascar'},{code:'+265',country:'Malaui'},
  {code:'+60',country:'Malasia'},{code:'+960',country:'Maldivas'},{code:'+223',country:'Malí'},
  {code:'+356',country:'Malta'},{code:'+692',country:'Islas Marshall'},{code:'+222',country:'Mauritania'},
  {code:'+230',country:'Mauricio'},{code:'+52',country:'México'},{code:'+691',country:'Micronesia'},
  {code:'+373',country:'Moldavia'},{code:'+377',country:'Mónaco'},{code:'+976',country:'Mongolia'},
  {code:'+382',country:'Montenegro'},{code:'+212',country:'Marruecos'},{code:'+258',country:'Mozambique'},
  {code:'+95',country:'Myanmar'},{code:'+264',country:'Namibia'},{code:'+674',country:'Nauru'},
  {code:'+977',country:'Nepal'},{code:'+31',country:'Países Bajos'},{code:'+64',country:'Nueva Zelanda'},
  {code:'+505',country:'Nicaragua'},{code:'+227',country:'Níger'},{code:'+234',country:'Nigeria'},
  {code:'+850',country:'Corea del Norte'},{code:'+389',country:'Macedonia del Norte'},{code:'+47',country:'Noruega'},
  {code:'+968',country:'Omán'},{code:'+92',country:'Pakistán'},{code:'+680',country:'Palaos'},
  {code:'+970',country:'Palestina'},{code:'+507',country:'Panamá'},{code:'+675',country:'Papúa Nueva Guinea'},
  {code:'+595',country:'Paraguay'},{code:'+51',country:'Perú'},{code:'+63',country:'Filipinas'},
  {code:'+48',country:'Polonia'},{code:'+351',country:'Portugal'},{code:'+974',country:'Catar'},
  {code:'+40',country:'Rumanía'},{code:'+7',country:'Rusia'},{code:'+250',country:'Ruanda'},
  {code:'+1869',country:'San Cristóbal y Nieves'},{code:'+1758',country:'Santa Lucía'},
  {code:'+1784',country:'San Vicente'},{code:'+685',country:'Samoa'},{code:'+378',country:'San Marino'},
  {code:'+239',country:'Santo Tomé y Príncipe'},{code:'+966',country:'Arabia Saudita'},
  {code:'+221',country:'Senegal'},{code:'+381',country:'Serbia'},{code:'+248',country:'Seychelles'},
  {code:'+232',country:'Sierra Leona'},{code:'+65',country:'Singapur'},{code:'+421',country:'Eslovaquia'},
  {code:'+386',country:'Eslovenia'},{code:'+677',country:'Islas Salomón'},{code:'+252',country:'Somalia'},
  {code:'+27',country:'Sudáfrica'},{code:'+82',country:'Corea del Sur'},{code:'+211',country:'Sudán del Sur'},
  {code:'+34',country:'España'},{code:'+94',country:'Sri Lanka'},{code:'+249',country:'Sudán'},
  {code:'+597',country:'Surinam'},{code:'+268',country:'Esuatini'},{code:'+46',country:'Suecia'},
  {code:'+41',country:'Suiza'},{code:'+963',country:'Siria'},{code:'+886',country:'Taiwán'},
  {code:'+992',country:'Tayikistán'},{code:'+255',country:'Tanzania'},{code:'+66',country:'Tailandia'},
  {code:'+670',country:'Timor Oriental'},{code:'+228',country:'Togo'},{code:'+676',country:'Tonga'},
  {code:'+1868',country:'Trinidad y Tobago'},{code:'+216',country:'Túnez'},{code:'+90',country:'Turquía'},
  {code:'+993',country:'Turkmenistán'},{code:'+688',country:'Tuvalu'},{code:'+256',country:'Uganda'},
  {code:'+380',country:'Ucrania'},{code:'+971',country:'Emiratos Árabes Unidos'},{code:'+44',country:'Reino Unido'},
  {code:'+1',country:'Estados Unidos'},{code:'+598',country:'Uruguay'},{code:'+998',country:'Uzbekistán'},
  {code:'+678',country:'Vanuatu'},{code:'+379',country:'Ciudad del Vaticano'},{code:'+58',country:'Venezuela'},
  {code:'+84',country:'Vietnam'},{code:'+967',country:'Yemen'},{code:'+260',country:'Zambia'},
  {code:'+263',country:'Zimbabue'}
];

// ── INIT ──────────────────────────────────────────────────
export function initForm() {
  renderStep(formState.step);
  setupNavButtons();
  checkDraft();
}

// ── RENDERIZADO DE PASOS ──────────────────────────────────
export function renderStep(stepNum) {
  const body = document.getElementById('form-body');
  if (!body) return;

  const stepRenderers = [null, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5];
  body.innerHTML = stepRenderers[stepNum]();
  body.className = 'form-card__body';

  setupStepListeners(stepNum);
  updateStepper(stepNum);
  updateProgressBar(stepNum);

  // Restaurar valores del state
  restoreValues(stepNum);
}

// ── PASO 1: Identificación ────────────────────────────────
function renderStep1() {
  const phoneSelectorHTML = PHONE_CODES.map(p =>
    `<option value="${p.code}"${p.code === '+57' && !formState.data.phoneCode ? ' selected' : (formState.data.phoneCode === p.code ? ' selected' : '')}>${p.code} ${p.country}</option>`
  ).join('');

  return `
    <div class="form-step active" id="step-1">
      <div class="form-row cols-2">
        <div class="form-group" id="grp-projectName">
          <label class="form-label" for="projectName">
            Nombre del proyecto <span class="required" aria-hidden="true">*</span>
          </label>
          <input type="text" id="projectName" name="projectName" class="form-control"
            placeholder="Ej: Sistema de gestión de inventarios" maxlength="100" required
            aria-required="true" autocomplete="off">
          <p class="form-error-msg" id="err-projectName">El nombre del proyecto es requerido.</p>
        </div>
        <div class="form-group" id="grp-proposerName">
          <label class="form-label" for="proposerName">
            Tu nombre completo <span class="required" aria-hidden="true">*</span>
          </label>
          <input type="text" id="proposerName" name="proposerName" class="form-control"
            placeholder="Ej: Ana González" required aria-required="true">
          <p class="form-error-msg" id="err-proposerName">El nombre del proponente es requerido.</p>
        </div>
      </div>
      <div class="form-row cols-2" style="margin-top:var(--space-5);">
        <div class="form-group">
          <label class="form-label" for="presentationDate">Fecha de presentación</label>
          <input type="date" id="presentationDate" name="presentationDate" class="form-control">
        </div>
        <div class="form-group" id="grp-projectType">
          <label class="form-label" for="projectType">
            Tipo de proyecto <span class="required" aria-hidden="true">*</span>
          </label>
          <select id="projectType" name="projectType" class="form-control" required aria-required="true">
            <option value="">— Selecciona un tipo —</option>
            <option value="web_app">🌐 Web App</option>
            <option value="mobile">📱 Mobile</option>
            <option value="api">⚡ API / Backend</option>
            <option value="data">📊 Data / Analytics</option>
            <option value="ai">🤖 IA / Machine Learning</option>
            <option value="other">💡 Otro</option>
          </select>
          <p class="form-error-msg" id="err-projectType">Selecciona el tipo de proyecto.</p>
        </div>
      </div>
      <div class="form-group" id="grp-email" style="margin-top:var(--space-5);">
        <label class="form-label" for="email">
          Correo electrónico <span class="required" aria-hidden="true">*</span>
        </label>
        <input type="email" id="email" name="email" class="form-control"
          placeholder="Ej: ana.gonzalez@empresa.com" required aria-required="true" autocomplete="email">
        <p class="form-error-msg" id="err-email">Ingresa un correo electrónico válido.</p>
      </div>
      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label">Teléfono <span style="font-weight:400;opacity:0.6;font-size:0.85em;">(opcional)</span></label>
        <div class="phone-row">
          <select id="phoneCode" name="phoneCode" class="form-control phone-code-select">
            <option value="">Indicativo</option>
            ${phoneSelectorHTML}
          </select>
          <input type="tel" id="phoneNumber" name="phoneNumber" class="form-control"
            placeholder="Ej: 3001234567" autocomplete="tel-national">
        </div>
      </div>
    </div>`;
}

// ── PASO 2: Problema ──────────────────────────────────────
function renderStep2() {
  return `
    <div class="form-step active" id="step-2">
      <div class="form-group" id="grp-problemDescription">
        <label class="form-label" for="problemDescription">
          ¿Cuál es el problema que resuelves? <span class="required" aria-hidden="true">*</span>
          <span class="tooltip-trigger" title="Describe claramente el dolor o necesidad que motiva este proyecto. Sé específico.">?</span>
        </label>
        <textarea id="problemDescription" name="problemDescription" class="form-control"
          placeholder="Describe el problema con detalle: ¿qué pasa hoy? ¿por qué es un problema? ¿cuán frecuente ocurre?"
          rows="5" maxlength="2000" required aria-required="true"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <p class="form-error-msg" id="err-problemDescription">Mínimo 50 caracteres (actualmente es muy corto).</p>
          <span class="char-counter" id="cc-problemDescription">0 / 2000</span>
        </div>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label" for="targetUsers">¿A quiénes afecta este problema?</label>
        <input type="text" id="targetUsers" name="targetUsers" class="form-control"
          placeholder="Ej: Equipos de logística, vendedores, usuarios finales...">
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label">¿Existe alguna solución actual?</label>
        <div class="radio-group" role="radiogroup" aria-label="¿Existe solución actual?">
          <label class="radio-label" id="lbl-existing-no">
            <input type="radio" name="existingSolutions" value="false"> No existe nada
          </label>
          <label class="radio-label" id="lbl-existing-yes">
            <input type="radio" name="existingSolutions" value="true"> Sí, pero es insuficiente
          </label>
        </div>
        <div class="conditional-field" id="existing-details-field">
          <input type="text" id="existingDetails" name="existingDetails" class="form-control"
            placeholder="¿Qué existe actualmente y por qué no es suficiente?">
        </div>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label">Urgencia del problema</label>
        <div class="slider-group">
          <div class="slider-value" id="urgency-display">${formState.data.urgencyLevel}</div>
          <input type="range" id="urgencyLevel" name="urgencyLevel" min="1" max="5"
            value="${formState.data.urgencyLevel}" aria-label="Nivel de urgencia 1 al 5">
          <div class="slider-labels">
            <span>1 — Puede esperar</span>
            <span>5 — Crítico ahora</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ── PASO 3: Solución ──────────────────────────────────────
function renderStep3() {
  const techOptions = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Django', 'FastAPI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'AWS', 'Firebase', 'TypeScript', 'Go', 'Java', 'PHP'];

  const techHTML = techOptions.map(t => `
    <label class="tech-chip ${formState.data.techStack.includes(t) ? 'selected' : ''}" data-tech="${t}">
      <input type="checkbox" value="${t}" ${formState.data.techStack.includes(t) ? 'checked' : ''}> ${t}
    </label>`).join('');

  const featuresHTML = formState.data.keyFeatures.length
    ? formState.data.keyFeatures.map((f, i) => renderDynamicItem(f, i, 'features')).join('')
    : renderDynamicItem('', 0, 'features');

  return `
    <div class="form-step active" id="step-3">
      <div class="form-group" id="grp-solutionDescription">
        <label class="form-label" for="solutionDescription">
          Describe tu solución <span class="required" aria-hidden="true">*</span>
        </label>
        <textarea id="solutionDescription" name="solutionDescription" class="form-control"
          placeholder="¿Cómo resuelve tu propuesta el problema? Sé claro sobre el 'qué' y el 'cómo'."
          rows="5" maxlength="3000" required aria-required="true"></textarea>
        <div style="display:flex;justify-content:space-between;">
          <p class="form-error-msg" id="err-solutionDescription">La descripción de la solución es requerida.</p>
          <span class="char-counter" id="cc-solutionDescription">0 / 3000</span>
        </div>
      </div>

      <div class="form-group" style="margin-top:var(--space-6);">
        <label class="form-label">Stack tecnológico sugerido</label>
        <div class="tech-grid" id="tech-grid">${techHTML}</div>
        <input type="text" id="tech-custom" class="form-control" style="margin-top:var(--space-3);"
          placeholder="+ Agregar otra tecnología y presiona Enter">
      </div>

      <div class="form-group" style="margin-top:var(--space-6);">
        <label class="form-label">Funcionalidades clave del Proyecto</label>
        <div class="dynamic-list" id="features-list">${featuresHTML}</div>
        <button type="button" class="add-item-btn" id="add-feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar funcionalidad
        </button>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label" for="mvpScope">Alcance del Proyecto</label>
        <textarea id="mvpScope" name="mvpScope" class="form-control"
          placeholder="¿Qué incluye este proyecto? ¿Qué queda fuera del alcance inicial?"
          rows="3" maxlength="1000"></textarea>
      </div>
    </div>`;
}

// ── PASO 4: Viabilidad ────────────────────────────────────
function renderStep4() {
  const risksHTML = formState.data.identifiedRisks.length
    ? formState.data.identifiedRisks.map((r, i) => renderDynamicItem(r, i, 'risks')).join('')
    : renderDynamicItem('', 0, 'risks');

  return `
    <div class="form-step active" id="step-4">
      <div class="form-row cols-2">
        <div class="form-group">
          <label class="form-label" for="estimatedTime">Tiempo estimado</label>
          <select id="estimatedTime" name="estimatedTime" class="form-control">
            <option value="">— Selecciona —</option>
            <option value="1_2_weeks">1–2 semanas</option>
            <option value="1_month">1 mes</option>
            <option value="3_months">3 meses</option>
            <option value="6_plus_months">6+ meses</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="teamSize">Personas requeridas</label>
          <input type="number" id="teamSize" name="teamSize" class="form-control"
            min="1" max="50" value="${formState.data.teamSize || 1}" placeholder="Ej: 3">
        </div>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label" for="skills-wrapper">Conocimientos técnicos necesarios</label>
        <div class="tags-wrapper" id="skills-wrapper" role="group" aria-label="Habilidades requeridas">
          ${formState.data.requiredSkills.map(s => renderTagChip(s)).join('')}
          <input type="text" class="tags-input" id="skills-input"
            placeholder="Escribe y presiona Enter..." aria-label="Agregar habilidad">
        </div>
        <p class="form-helper">Presiona Enter o coma para agregar cada habilidad.</p>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label">Beneficio esperado</label>
        <div class="radio-group" role="radiogroup">
          ${['high', 'medium', 'low'].map(b => `
            <label class="radio-label ${formState.data.expectedBenefit === b ? 'selected' : ''}" data-benefit="${b}">
              <input type="radio" name="expectedBenefit" value="${b}"
                ${formState.data.expectedBenefit === b ? 'checked' : ''}>
              ${{ high: '🚀 Alto', medium: '✅ Medio', low: '🔸 Bajo' }[b]}
            </label>`).join('')}
        </div>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label">Riesgos identificados</label>
        <div class="dynamic-list" id="risks-list">${risksHTML}</div>
        <button type="button" class="add-item-btn" id="add-risk">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar riesgo
        </button>
      </div>

      <div class="form-group" style="margin-top:var(--space-5);">
        <label class="form-label">¿Requiere presupuesto?</label>
        <div class="radio-group" role="radiogroup">
          <label class="radio-label ${!formState.data.requiresBudget ? 'selected' : ''}" data-budget="false">
            <input type="radio" name="requiresBudget" value="false" ${!formState.data.requiresBudget ? 'checked' : ''}> No requiere
          </label>
          <label class="radio-label ${formState.data.requiresBudget ? 'selected' : ''}" data-budget="true">
            <input type="radio" name="requiresBudget" value="true" ${formState.data.requiresBudget ? 'checked' : ''}> Sí requiere
          </label>
        </div>
        <div class="conditional-field ${formState.data.requiresBudget ? 'visible' : ''}" id="budget-field">
          <input type="number" id="budgetAmount" name="budgetAmount" class="form-control"
            placeholder="Monto estimado en USD" min="0" value="${formState.data.budgetAmount || ''}">
        </div>
      </div>
    </div>`;
}

// ── PASO 5: Revisión ──────────────────────────────────────
function renderStep5() {
  const completeness = calcCompleteness(formState.data);
  const viability    = calcViability(formState.data);

  return `
    <div class="form-step active" id="step-5">
      <div class="score-display">
        <div class="score-box">
          <div class="score-box__number" id="score-completeness" style="color:${getScoreColor(completeness)}">0</div>
          <div class="score-box__label">% Completitud</div>
          <div class="score-box__desc">${getScoreLabel(completeness)}</div>
        </div>
        <div class="score-box">
          <div class="score-box__number" id="score-viability" style="color:${getScoreColor(viability)}">0</div>
          <div class="score-box__label">% Viabilidad</div>
          <div class="score-box__desc">${getScoreLabel(viability)}</div>
        </div>
      </div>

      ${buildReviewHTML()}

      <div class="form-group confirm-block" style="margin-top:var(--space-6);">
        <p class="confirm-block__hint">
          ✅ Último paso — revisa el resumen y confirma para enviar tu propuesta
        </p>
        <label class="checkbox-label confirm-check-label" id="lbl-confirm">
          <input type="checkbox" id="confirm-check" aria-required="true">
          <span class="confirm-check-icon">☐</span>
          Confirmo que la información es correcta y está lista para revisión.
        </label>
      </div>
    </div>`;
}

// ── RESUMEN ───────────────────────────────────────────────
function buildReviewHTML() {
  const d = formState.data;
  const sections = [
    {
      title: '📋 Identificación',
      rows: [
        ['Proyecto', d.projectName || '—'],
        ['Proponente', d.proposerName || '—'],
        ['Presentación', d.presentationDate ? new Date(d.presentationDate + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'],
        ['Tipo', getTypeLabel(d.projectType)]
      ]
    },
    {
      title: '🔍 Problema',
      rows: [
        ['Descripción', d.problemDescription ? d.problemDescription.substring(0, 80) + '...' : '—'],
        ['Usuarios afectados', d.targetUsers || '—'],
        ['Urgencia', `${d.urgencyLevel}/5`]
      ]
    },
    {
      title: '💡 Solución',
      rows: [
        ['Stack', d.techStack.join(', ') || '—'],
        ['Funcionalidades', `${d.keyFeatures.filter(Boolean).length} definidas`]
      ]
    },
    {
      title: '📊 Viabilidad',
      rows: [
        ['Tiempo', getTimeLabel(d.estimatedTime)],
        ['Equipo', `${d.teamSize} persona(s)`],
        ['Beneficio', getBenefitLabel(d.expectedBenefit)],
        ['Presupuesto', d.requiresBudget ? `Sí — $${d.budgetAmount || 0} USD` : 'No requiere'],
        ['Riesgos', `${d.identifiedRisks.filter(Boolean).length} identificados`]
      ]
    }
  ];

  return sections.map(s => `
    <div class="review-section">
      <div class="review-section__title">${s.title}</div>
      ${s.rows.map(([k, v]) => `
        <div class="review-row">
          <span class="review-row__key">${escapeHtml(k)}</span>
          <span class="review-row__value">${escapeHtml(String(v))}</span>
        </div>`).join('')}
    </div>`).join('');
}

// ── HELPER: item de lista dinámica ────────────────────────
function renderDynamicItem(value, index, type) {
  return `
    <div class="dynamic-item" data-index="${index}" data-type="${type}">
      <input type="text" class="form-control" value="${escapeHtml(value)}"
        placeholder="${type === 'features' ? 'Ej: Login con Google' : 'Ej: Complejidad técnica alta'}"
        aria-label="${type === 'features' ? 'Funcionalidad' : 'Riesgo'} ${index + 1}">
      <button type="button" class="dynamic-item__remove" aria-label="Eliminar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4h6v2"/>
        </svg>
      </button>
    </div>`;
}

function renderTagChip(value) {
  return `
    <span class="tag-chip">
      ${escapeHtml(value)}
      <button type="button" class="tag-chip__remove" data-tag="${escapeHtml(value)}" aria-label="Eliminar ${escapeHtml(value)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>`;
}

// ── LISTENERS POR PASO ────────────────────────────────────
function setupStepListeners(step) {
  if (step === 1) {
    ['projectName', 'proposerName', 'email', 'phoneNumber'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', e => {
        formState.data[id] = e.target.value;
        saveToLocalStorage();
      });
    });
    document.getElementById('presentationDate')?.addEventListener('change', e => {
      formState.data.presentationDate = e.target.value;
      saveToLocalStorage();
    });
    document.getElementById('phoneCode')?.addEventListener('change', e => {
      formState.data.phoneCode = e.target.value;
      saveToLocalStorage();
    });
    document.getElementById('projectType')?.addEventListener('change', e => {
      formState.data.projectType = e.target.value;
      saveToLocalStorage();
    });
  }

  if (step === 2) {
    const probEl = document.getElementById('problemDescription');
    probEl?.addEventListener('input', e => {
      formState.data.problemDescription = e.target.value;
      updateCharCounter('cc-problemDescription', e.target.value.length, 2000);
      saveToLocalStorage();
    });
    updateCharCounter('cc-problemDescription', formState.data.problemDescription.length, 2000);

    document.getElementById('targetUsers')?.addEventListener('input', e => {
      formState.data.targetUsers = e.target.value;
    });

    document.querySelectorAll('[name="existingSolutions"]').forEach(r => {
      r.addEventListener('change', e => {
        formState.data.existingSolutions = e.target.value === 'true';
        const field = document.getElementById('existing-details-field');
        if (field) field.classList.toggle('visible', formState.data.existingSolutions);
        // Visual
        document.querySelectorAll('#lbl-existing-yes, #lbl-existing-no').forEach(l => l.classList.remove('selected'));
        r.closest('label')?.classList.add('selected');
      });
    });

    document.getElementById('existingDetails')?.addEventListener('input', e => {
      formState.data.existingDetails = e.target.value;
    });

    const urgency = document.getElementById('urgencyLevel');
    urgency?.addEventListener('input', e => {
      formState.data.urgencyLevel = parseInt(e.target.value);
      const disp = document.getElementById('urgency-display');
      if (disp) disp.textContent = e.target.value;
    });
  }

  if (step === 3) {
    const solEl = document.getElementById('solutionDescription');
    solEl?.addEventListener('input', e => {
      formState.data.solutionDescription = e.target.value;
      updateCharCounter('cc-solutionDescription', e.target.value.length, 3000);
      saveToLocalStorage();
    });
    updateCharCounter('cc-solutionDescription', formState.data.solutionDescription.length, 3000);

    // Tech chips
    // e.preventDefault() evita que el click en el <label> active también el <input>
    // interno oculto, lo que dispararía el evento dos veces y revertiría el estado.
    document.querySelectorAll('.tech-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const tech = chip.dataset.tech;
        if (chip.classList.contains('selected')) {
          chip.classList.remove('selected');
          formState.data.techStack = formState.data.techStack.filter(t => t !== tech);
        } else {
          chip.classList.add('selected');
          if (!formState.data.techStack.includes(tech)) formState.data.techStack.push(tech);
        }
        saveToLocalStorage();
      });
    });

    // Tech custom
    document.getElementById('tech-custom')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim();
        if (val && !formState.data.techStack.includes(val)) {
          formState.data.techStack.push(val);
          addCustomTechChip(val);
        }
        e.target.value = '';
      }
    });

    setupDynamicList('features-list', 'add-feature', 'features', 'keyFeatures');

    document.getElementById('mvpScope')?.addEventListener('input', e => {
      formState.data.mvpScope = e.target.value;
    });
  }

  if (step === 4) {
    document.getElementById('estimatedTime')?.addEventListener('change', e => {
      formState.data.estimatedTime = e.target.value;
    });

    document.getElementById('teamSize')?.addEventListener('input', e => {
      formState.data.teamSize = parseInt(e.target.value) || 1;
    });

    setupTagsInput('skills-wrapper', 'skills-input', 'requiredSkills');
    setupDynamicList('risks-list', 'add-risk', 'risks', 'identifiedRisks');

    document.querySelectorAll('[name="expectedBenefit"]').forEach(r => {
      r.addEventListener('change', e => {
        formState.data.expectedBenefit = e.target.value;
        document.querySelectorAll('[data-benefit]').forEach(l => l.classList.remove('selected'));
        r.closest('label')?.classList.add('selected');
      });
    });

    document.querySelectorAll('[name="requiresBudget"]').forEach(r => {
      r.addEventListener('change', e => {
        formState.data.requiresBudget = e.target.value === 'true';
        const field = document.getElementById('budget-field');
        if (field) field.classList.toggle('visible', formState.data.requiresBudget);
        document.querySelectorAll('[data-budget]').forEach(l => l.classList.remove('selected'));
        r.closest('label')?.classList.add('selected');
      });
    });

    document.getElementById('budgetAmount')?.addEventListener('input', e => {
      formState.data.budgetAmount = parseFloat(e.target.value) || 0;
    });
  }

  if (step === 5) {
    // Animar scores
    setTimeout(() => {
      const compEl = document.getElementById('score-completeness');
      const viaEl  = document.getElementById('score-viability');
      if (compEl) animateNumber(compEl, calcCompleteness(formState.data));
      if (viaEl)  animateNumber(viaEl,  calcViability(formState.data));
    }, 100);

    document.getElementById('confirm-check')?.addEventListener('change', e => {
      const lbl  = document.getElementById('lbl-confirm');
      const icon = lbl?.querySelector('.confirm-check-icon');
      if (lbl)  lbl.classList.toggle('selected', e.target.checked);
      if (icon) icon.textContent = e.target.checked ? '☑' : '☐';
    });
  }
}

// ── LISTAS DINÁMICAS ──────────────────────────────────────
function setupDynamicList(listId, addBtnId, type, stateKey) {
  const list   = document.getElementById(listId);
  const addBtn = document.getElementById(addBtnId);

  const readList = () => {
    formState.data[stateKey] = [...list.querySelectorAll('.dynamic-item input')]
      .map(i => i.value.trim())
      .filter(Boolean);
  };

  list?.addEventListener('input', readList);

  list?.addEventListener('click', e => {
    const btn = e.target.closest('.dynamic-item__remove');
    if (btn) {
      const item = btn.closest('.dynamic-item');
      item.style.animation = 'item-out 0.2s ease forwards';
      setTimeout(() => { item.remove(); readList(); }, 200);
    }
  });

  addBtn?.addEventListener('click', () => {
    readList();
    const idx  = list.querySelectorAll('.dynamic-item').length;
    const html = renderDynamicItem('', idx, type);
    list.insertAdjacentHTML('beforeend', html);
    const inputs = list.querySelectorAll('.dynamic-item input');
    inputs[inputs.length - 1]?.focus();
  });
}

// ── TAGS INPUT ────────────────────────────────────────────
function setupTagsInput(wrapperId, inputId, stateKey) {
  const wrapper = document.getElementById(wrapperId);
  const input   = document.getElementById(inputId);
  if (!wrapper || !input) return;

  wrapper.addEventListener('click', () => input.focus());

  const addTag = (val) => {
    val = val.trim();
    if (!val || formState.data[stateKey].includes(val)) return;
    formState.data[stateKey].push(val);
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    chip.innerHTML = renderTagChip(val);
    chip.innerHTML = `${escapeHtml(val)}<button type="button" class="tag-chip__remove" data-tag="${escapeHtml(val)}" aria-label="Eliminar ${escapeHtml(val)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>`;
    wrapper.insertBefore(chip, input);
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value);
      input.value = '';
    }
    if (e.key === 'Backspace' && !input.value) {
      const chips = wrapper.querySelectorAll('.tag-chip');
      if (chips.length) {
        const last    = chips[chips.length - 1];
        const tagVal  = formState.data[stateKey].pop();
        last.remove();
      }
    }
  });

  wrapper.addEventListener('click', e => {
    const btn = e.target.closest('.tag-chip__remove');
    if (btn) {
      const tag = btn.dataset.tag;
      formState.data[stateKey] = formState.data[stateKey].filter(s => s !== tag);
      btn.closest('.tag-chip').remove();
    }
  });
}

function addCustomTechChip(val) {
  const grid = document.getElementById('tech-grid');
  if (!grid) return;
  const chip = document.createElement('label');
  chip.className = 'tech-chip selected';
  chip.dataset.tech = val;
  chip.innerHTML = `<input type="checkbox" value="${escapeHtml(val)}" checked> ${escapeHtml(val)}`;
  chip.addEventListener('click', (e) => {
    e.preventDefault();
    chip.classList.toggle('selected');
    if (!chip.classList.contains('selected')) {
      formState.data.techStack = formState.data.techStack.filter(t => t !== val);
      chip.remove();
    }
    saveToLocalStorage();
  });
  grid.appendChild(chip);
}

// ── VALIDACIÓN POR PASO ───────────────────────────────────
export function validateStep(step) {
  let valid = true;
  const d   = formState.data;

  const showError = (grpId, errId, show) => {
    const grp = document.getElementById(grpId);
    const err = document.getElementById(errId);
    if (grp) grp.classList.toggle('has-error', show);
    if (grp) grp.classList.toggle('valid', !show && !!d[grpId?.replace('grp-', '')]);
  };

  if (step === 1) {
    const nameOk  = d.projectName.trim().length > 0;
    const propOk  = d.proposerName.trim().length > 0;
    const typeOk  = d.projectType !== '';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim());
    showError('grp-projectName',  'err-projectName',  !nameOk);
    showError('grp-proposerName', 'err-proposerName', !propOk);
    showError('grp-projectType',  'err-projectType',  !typeOk);
    showError('grp-email',        'err-email',        !emailOk);
    valid = nameOk && propOk && typeOk && emailOk;
  }

  if (step === 2) {
    const probOk = d.problemDescription.trim().length >= 50;
    showError('grp-problemDescription', 'err-problemDescription', !probOk);
    valid = probOk;
  }

  if (step === 3) {
    const solOk = d.solutionDescription.trim().length > 0;
    showError('grp-solutionDescription', 'err-solutionDescription', !solOk);
    valid = solOk;
  }

  return valid;
}

// ── STEPPER ───────────────────────────────────────────────
export function updateStepper(stepNum) {
  document.querySelectorAll('.step-item').forEach((el, i) => {
    const n = i + 1;
    el.classList.toggle('active', n === stepNum);
    el.classList.toggle('completed', n < stepNum);
  });
}

function updateProgressBar(stepNum) {
  const fill = document.getElementById('form-progress-fill');
  if (fill) fill.style.width = `${((stepNum - 1) / (TOTAL_STEPS - 1)) * 100}%`;

  const label = document.getElementById('step-counter');
  if (label) label.textContent = `Paso ${stepNum} de ${TOTAL_STEPS}`;
}

function updateCharCounter(id, len, max) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = `${len} / ${max}`;
  el.classList.toggle('warning', len > max * 0.8);
  el.classList.toggle('limit',   len >= max);
}

// ── NAVEGACIÓN ────────────────────────────────────────────
function setupNavButtons() {
  document.getElementById('btn-prev')?.addEventListener('click', prevStep);
  document.getElementById('btn-next')?.addEventListener('click', nextStep);
  document.getElementById('btn-submit')?.addEventListener('click', submitForm);
}

export function nextStep() {
  const current = formState.step;
  if (!validateStep(current)) {
    showToast('Completa los campos requeridos antes de continuar.', 'warning');
    return;
  }
  if (current < TOTAL_STEPS) {
    formState.step = current + 1;
    renderStep(formState.step);
    updateNavButtons();
    scrollToForm();
  }
}

export function prevStep() {
  if (formState.step > 1) {
    formState.step -= 1;
    renderStep(formState.step);
    updateNavButtons();
    scrollToForm();
  }
}

function updateNavButtons() {
  const prev   = document.getElementById('btn-prev');
  const next   = document.getElementById('btn-next');
  const submit = document.getElementById('btn-submit');
  const step   = formState.step;

  if (prev)   prev.style.display   = step > 1 ? 'inline-flex' : 'none';
  if (next)   next.style.display   = step < TOTAL_STEPS ? 'inline-flex' : 'none';
  if (submit) submit.style.display = step === TOTAL_STEPS ? 'inline-flex' : 'none';
}

function scrollToForm() {
  document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── ENVÍO ─────────────────────────────────────────────────
export async function submitForm() {
  const confirmCheck = document.getElementById('confirm-check');
  if (!confirmCheck?.checked) {
    showToast('Debes confirmar que la información es correcta.', 'warning');
    return;
  }

  const submitBtn = document.getElementById('btn-submit');
  setButtonLoading(submitBtn, true);

  // Limpiar arrays
  const d = { ...formState.data };
  d.keyFeatures     = (d.keyFeatures || []).filter(Boolean);
  d.identifiedRisks = (d.identifiedRisks || []).filter(Boolean);
  d.requiredSkills  = (d.requiredSkills || []).filter(Boolean);
  d.techStack       = (d.techStack || []).filter(Boolean);

  try {
    await createProposal(d);
    showToast('¡Propuesta enviada exitosamente! 🎉', 'success', 6000);
    clearDraft();
    // Reset
    formState.data = {
      projectName: '', proposerName: '', email: '', phoneCode: '', phoneNumber: '',
      presentationDate: '', projectType: '',
      problemDescription: '', targetUsers: '', existingSolutions: false,
      existingDetails: '', urgencyLevel: 3,
      solutionDescription: '', techStack: [], keyFeatures: [], mvpScope: '',
      estimatedTime: '', teamSize: 1, requiredSkills: [], identifiedRisks: [],
      expectedBenefit: '', requiresBudget: false, budgetAmount: 0
    };
    formState.step = 1;
    renderStep(1);
    updateNavButtons();
    // Recargar dashboard si está visible
    document.dispatchEvent(new CustomEvent('proposalCreated'));
  } catch (err) {
    showToast(err.message || 'Error al enviar la propuesta.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// ── RESTITUIR VALORES ──────────────────────────────────────
function restoreValues(step) {
  const d = formState.data;
  if (step === 1) {
    ['projectName', 'proposerName', 'email', 'phoneNumber'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = d[id] || '';
    });
    const dateEl = document.getElementById('presentationDate');
    if (dateEl) dateEl.value = d.presentationDate || '';
    const codeEl = document.getElementById('phoneCode');
    if (codeEl) codeEl.value = d.phoneCode || '+57';
    const typeEl = document.getElementById('projectType');
    if (typeEl) typeEl.value = d.projectType || '';
  }
  if (step === 2) {
    const probEl = document.getElementById('problemDescription');
    if (probEl) {
      probEl.value = d.problemDescription || '';
      updateCharCounter('cc-problemDescription', probEl.value.length, 2000);
    }
    const targEl = document.getElementById('targetUsers');
    if (targEl) targEl.value = d.targetUsers || '';

    if (d.existingSolutions) {
      const r = document.querySelector('[name="existingSolutions"][value="true"]');
      if (r) { r.checked = true; r.closest('label')?.classList.add('selected'); }
      const f = document.getElementById('existing-details-field');
      if (f) f.classList.add('visible');
    }
    const detEl = document.getElementById('existingDetails');
    if (detEl) detEl.value = d.existingDetails || '';
  }
  if (step === 3) {
    const solEl = document.getElementById('solutionDescription');
    if (solEl) {
      solEl.value = d.solutionDescription || '';
      updateCharCounter('cc-solutionDescription', solEl.value.length, 3000);
    }
    const mvpEl = document.getElementById('mvpScope');
    if (mvpEl) mvpEl.value = d.mvpScope || '';
  }
  if (step === 4) {
    const timeEl = document.getElementById('estimatedTime');
    if (timeEl) timeEl.value = d.estimatedTime || '';
    const sizeEl = document.getElementById('teamSize');
    if (sizeEl) sizeEl.value = d.teamSize || 1;
    const budgetEl = document.getElementById('budgetAmount');
    if (budgetEl) budgetEl.value = d.budgetAmount || '';
  }
  updateNavButtons();
}

// ── LOCAL STORAGE (borrador) ──────────────────────────────
export function saveToLocalStorage() {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formState.data));
  } catch {}
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    formState.data = { ...formState.data, ...data };
    return true;
  } catch { return false; }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function checkDraft() {
  const hasDraft = loadFromLocalStorage();
  if (!hasDraft) return;

  const banner = document.getElementById('draft-banner');
  if (banner) {
    banner.style.display = 'flex';
    document.getElementById('draft-continue')?.addEventListener('click', () => {
      banner.style.display = 'none';
      renderStep(formState.step);
    });
    document.getElementById('draft-discard')?.addEventListener('click', () => {
      clearDraft();
      formState.data = {
        projectName: '', proposerName: '', email: '', phoneCode: '', phoneNumber: '',
        presentationDate: '', projectType: '',
        problemDescription: '', targetUsers: '', existingSolutions: false,
        existingDetails: '', urgencyLevel: 3,
        solutionDescription: '', techStack: [], keyFeatures: [], mvpScope: '',
        estimatedTime: '', teamSize: 1, requiredSkills: [], identifiedRisks: [],
        expectedBenefit: '', requiresBudget: false, budgetAmount: 0
      };
      banner.style.display = 'none';
    });
  }
}
