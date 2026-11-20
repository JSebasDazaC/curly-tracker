/* ============================================================
   Curly Tracker · Application logic
   ES6+ · Supabase · PWA · Offline-first local state
   ============================================================ */
(() => {
  'use strict';

  /* ---------------- Configuración ---------------- */
  const SUPABASE_URL = 'https://zrtxpgwkpilfkewwqppk.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_qByFy6Ocr4UBXmuVztUOIA_e8bxjtIM';
  const LS_KEY = 'curly-tracker:v1';

  const sb = (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  const CATEGORIES = [
    'Shampoo',
    'Acondicionador',
    'Tratamiento / Mascarilla',
    'Crema de peinar',
    'Aceite',
    'Gel'
  ];

  const STATUSES = [
    'Lo tengo - En uso',
    'Lo tengo - Por acabarse',
    'No lo tengo / Lista de compra'
  ];

  const PRESET_TOOLS = [
    'Cepillo definidor de 9 hileras tipo Denman',
    'Cepillo flexible desenredante',
    'Peine de dientes anchos',
    'Peineta de cola',
    'Atomizador de agua',
    'Masajeador de cuero cabelludo',
    'Pinzas pico de pato',
    'Secador con difusor',
    'Gorro/funda de satén'
  ];

  const INGREDIENT_SUGGESTIONS = [
    'Sulfatos', 'Siliconas', 'Aceites naturales', 'Proteínas',
    'Alcoholes secantes', 'Glicerina', 'Manteca de karité', 'Aloe vera'
  ];

  const PATTERN_LABELS = {
    '2C': 'Ondas definidas',
    '3A': 'Rizos sueltos',
    '3B': 'Rizos medianos',
    '3C': 'Rizos apretados',
    '4A': 'Rizos muy apretados'
  };
  const POROSITY_LABELS = {
    baja: 'Baja (absorbe despacio)',
    media: 'Media (equilibrada)',
    alta: 'Alta (absorbe rápido)'
  };
  const THICKNESS_LABELS = { fino: 'Fino', medio: 'Medio', grueso: 'Grueso' };
  const GOAL_LABELS = {
    frizz: 'Control de frizz',
    definicion: 'Definición',
    encogimiento: 'Controlar encogimiento',
    salud: 'Salud general'
  };
  const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const VIEW_LABELS = {
    hoy: 'Hoy', perfil: 'Mi perfil capilar', inventario: 'Inventario',
    rutina: 'Rutina semanal', ajustes: 'Ajustes'
  };

  /* ---------------- Iconos ---------------- */
  const ICONS = {
    hoy: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    inventario: '<path d="M3 7h18v13H3z"/><path d="m4.5 7 1.5-4h12l1.5 4"/><path d="M9 11h6"/>',
    rutina: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/>',
    ajustes: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.8-2.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.8 2.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 14h10l1-14M9 7V4h6v3"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-3 3-3-3Z"/>',
    drop: '<path d="M12 3s6 6.4 6 10a6 6 0 0 1-12 0c0-3.6 6-10 6-10Z"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="m19 16 .7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7Z"/>',
    alert: '<path d="M12 3 2 20h20Z"/><path d="M12 9v5M12 17h.01"/>',
    cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 11a3.5 3.5 0 0 0 1 7Z"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    star: '<path d="m12 3 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.9l6.5-1Z"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>'
  };

  function icon(name, cls = 'h-5 w-5') {
    return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function curlMark(cls = 'h-6 w-6') {
    return `<svg class="${cls}" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
      <path d="M9 13c-4 0-6.5 3-6.5 6.5S5 26 8.5 26c2.8 0 4.5-2 4.5-4.2 0-1.9-1.3-3.3-3-3.3-1.4 0-2.4 1-2.4 2.3"/>
      <path d="M22 9c-5.3 0-9 4-9 9s3.4 8 7.9 8c3.9 0 6.6-2.8 6.6-6.2 0-3-2.2-5.1-4.9-5.1-2.3 0-4 1.7-4 3.8 0 1.8 1.3 3.1 3 3.1"/>
      <path d="M34 14c-3.3 0-5.5 2.5-5.5 5.5S31 25 33.5 25c2 0 3.5-1.5 3.5-3.3 0-1.6-1.2-2.8-2.7-2.8"/>
    </svg>`;
  }

  /* ---------------- Utilidades ---------------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''));

  function dateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseDateKey(key) {
    const parts = String(key).split('-').map(Number);
    if (parts.length !== 3) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function mondayIndex(date) {
    return (date.getDay() + 6) % 7;
  }

  function mondayOf(date) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() - mondayIndex(copy));
    return copy;
  }

  function addDays(date, count) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + count);
    return copy;
  }

  function formatDay(date, opts = {}) {
    return new Intl.DateTimeFormat('es-ES', Object.assign({ day: 'numeric', month: 'short' }, opts)).format(date);
  }

  function shortCategory(category) {
    return category === 'Tratamiento / Mascarilla' ? 'Tratamiento' : category;
  }

  /* ---------------- Desplegables personalizados ---------------- */
  function initSelects(root = document) {
    $$('select.field', root).forEach((select) => {
      if (select.dataset.customized === 'true') return;
      select.dataset.customized = 'true';
      select.classList.add('native-select');

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'select-trigger field';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');

      const valueNode = document.createElement('span');
      valueNode.className = 'select-value';
      const chevron = document.createElement('span');
      chevron.className = 'select-chevron';
      chevron.innerHTML = icon('chevron', 'h-4 w-4');
      trigger.append(valueNode, chevron);

      const menu = document.createElement('div');
      menu.className = 'select-menu hidden';
      menu.setAttribute('role', 'listbox');
      menu.innerHTML = Array.from(select.options).map((option, index) => `
        <button type="button" class="select-option" role="option" data-index="${index}" data-value="${esc(option.value)}" aria-selected="${option.value === select.value}">
          <span class="truncate">${esc(option.textContent)}</span>
          <span class="select-check">${icon('check', 'h-4 w-4')}</span>
        </button>`).join('');

      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);
      wrapper.appendChild(trigger);
      wrapper.appendChild(menu);
      syncSelect(select);
    });
  }

  function syncSelect(select) {
    const wrapper = select.closest('.custom-select');
    if (!wrapper) return;
    const option = select.options[select.selectedIndex];
    const valueNode = $('.select-value', wrapper);
    if (valueNode) valueNode.textContent = option ? option.textContent : '';
    $$('.select-option', wrapper).forEach((item) => {
      item.setAttribute('aria-selected', String(item.dataset.value === select.value));
    });
  }

  function syncAllSelects(root = document) {
    $$('select.field[data-customized="true"]', root).forEach(syncSelect);
  }

  function closeAllSelects(except) {
    $$('.select-trigger[data-open="true"], .picker-trigger[data-open="true"]').forEach((trigger) => {
      if (trigger === except) return;
      trigger.dataset.open = 'false';
      trigger.setAttribute('aria-expanded', 'false');
      const menu = trigger.nextElementSibling;
      if (menu && menu.classList.contains('select-menu')) {
        menu.classList.add('hidden');
        $$('.select-option', menu).forEach((option) => { option.dataset.focused = 'false'; });
      } else if (menu && menu.classList.contains('picker-menu')) {
        menu.classList.add('hidden');
      }
    });
  }

  function toggleSelect(trigger) {
    const willOpen = trigger.dataset.open !== 'true';
    closeAllSelects(trigger);
    trigger.dataset.open = String(willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
    const menu = trigger.nextElementSibling;
    if (menu && menu.classList.contains('select-menu')) {
      menu.classList.toggle('hidden', !willOpen);
      if (willOpen) {
        const selected = $('.select-option[aria-selected="true"]', menu);
        if (selected) selected.dataset.focused = 'true';
      }
    }
  }

  function chooseSelectOption(option) {
    const wrapper = option.closest('.custom-select');
    const select = wrapper && $('select', wrapper);
    if (!select) return;
    select.value = option.dataset.value;
    syncSelect(select);
    closeAllSelects();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* ---------------- Selectores de hora y fecha ---------------- */
  function initPickers(root = document) {
    $$('input.field[type="time"], input.field[type="date"]', root).forEach((input) => {
      if (input.dataset.customized === 'true') return;
      input.dataset.customized = 'true';
      input.classList.add('native-picker');

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-picker';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'picker-trigger field';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', 'false');

      const leading = document.createElement('span');
      leading.className = 'picker-leading';
      leading.innerHTML = icon(input.type === 'time' ? 'clock' : 'calendar', 'h-4 w-4 text-[#a1a1aa]');
      const valueNode = document.createElement('span');
      valueNode.className = 'picker-value';
      leading.appendChild(valueNode);

      const chevron = document.createElement('span');
      chevron.className = 'select-chevron';
      chevron.innerHTML = icon('chevron', 'h-4 w-4');
      trigger.append(leading, chevron);

      const menu = document.createElement('div');
      menu.className = 'picker-menu hidden';
      menu.setAttribute('role', 'dialog');

      input.parentNode.insertBefore(wrapper, input);
      wrapper.append(input, trigger, menu);
      if (input.type === 'date') {
        const initial = parseDateKey(input.value || dateKey());
        wrapper.dataset.viewYear = String(initial.getFullYear());
        wrapper.dataset.viewMonth = String(initial.getMonth());
      }
      syncPicker(input);
    });
  }

  function syncPicker(input) {
    const wrapper = input.closest('.custom-picker');
    if (!wrapper) return;
    const valueNode = $('.picker-value', wrapper);
    if (input.type === 'time') {
      if (valueNode) valueNode.textContent = input.value || '--:--';
      renderTimePicker(wrapper, input);
      return;
    }
    const date = parseDateKey(input.value || dateKey());
    if (valueNode) valueNode.textContent = formatDay(date, { weekday: 'short', day: 'numeric', month: 'short' });
    wrapper.dataset.viewYear = String(date.getFullYear());
    wrapper.dataset.viewMonth = String(date.getMonth());
    renderDatePicker(wrapper, input);
  }

  function renderTimePicker(wrapper, input) {
    const menu = $('.picker-menu', wrapper);
    if (!menu) return;
    const current = /^(\d{2}):(\d{2})$/.test(input.value) ? input.value.split(':') : ['08', '00'];
    const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
    const minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));
    if (!minutes.includes(current[1])) {
      minutes.push(current[1]);
      minutes.sort();
    }
    const column = (title, values, selected, part) => `<div class="picker-column">
      <p class="picker-column-title">${title}</p>
      ${values.map((value) => `<button type="button" class="picker-option" data-picker-part="${part}" data-value="${value}" aria-selected="${value === selected}">${value}</button>`).join('')}
    </div>`;
    menu.innerHTML = `<div class="picker-columns">${column('Hora', hours, current[0], 'hour')}${column('Min', minutes, current[1], 'minute')}</div>
      <div class="mt-3 flex flex-wrap gap-1.5 border-t border-[#27272a] pt-3">
        ${['07:00', '08:00', '09:00', '12:00', '20:00', '22:00'].map((time) => `<button type="button" class="picker-preset" data-picker-preset="${time}">${time}</button>`).join('')}
      </div>`;
  }

  function renderDatePicker(wrapper, input) {
    const menu = $('.picker-menu', wrapper);
    if (!menu) return;
    const year = Number(wrapper.dataset.viewYear);
    const month = Number(wrapper.dataset.viewMonth);
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const maxKey = input.max ? dateKey(parseDateKey(input.max)) : dateKey();
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
    const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    let cells = '';
    for (let index = 0; index < firstWeekday; index += 1) cells += '<span></span>';
    for (let day = 1; day <= daysInMonth; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells += `<button type="button" class="picker-day" data-picker-date="${key}" aria-selected="${key === input.value}" ${key > maxKey ? 'disabled' : ''}>${day}</button>`;
    }
    menu.innerHTML = `<div class="picker-header">
        <button type="button" class="picker-nav" data-picker-nav="-1" aria-label="Mes anterior">${icon('chevron', 'h-4 w-4 rotate-180')}</button>
        <span class="picker-month">${esc(label)}</span>
        <button type="button" class="picker-nav" data-picker-nav="1" aria-label="Mes siguiente">${icon('chevron', 'h-4 w-4')}</button>
      </div>
      <div class="picker-grid">${weekdays.map((day) => `<span class="picker-weekday">${day}</span>`).join('')}${cells}</div>
      <div class="picker-footer">
        <button type="button" data-picker-today>${icon('calendar', 'mr-1 inline h-3.5 w-3.5')}Hoy</button>
        <button type="button" data-picker-clear>Limpiar</button>
      </div>`;
  }

  function togglePicker(trigger) {
    const willOpen = trigger.dataset.open !== 'true';
    closeAllSelects(trigger);
    trigger.dataset.open = String(willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
    const menu = trigger.nextElementSibling;
    if (menu && menu.classList.contains('picker-menu')) menu.classList.toggle('hidden', !willOpen);
  }

  function setPickerValue(input, value, close = true) {
    const wrapper = input.closest('.custom-picker');
    if (!wrapper) return;
    input.value = value;
    syncPicker(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (close) closeAllSelects();
  }

  function toast(message) {
    const root = $('#toastRoot');
    const node = document.createElement('div');
    node.className = 'toast pointer-events-auto max-w-sm rounded-xl border border-[#27272a] bg-[#121214] px-4 py-3 text-sm text-[#fafafa] shadow-2xl';
    node.textContent = message;
    root.appendChild(node);
    setTimeout(() => {
      node.style.transition = 'opacity .2s ease, transform .2s ease';
      node.style.opacity = '0';
      node.style.transform = 'translateY(8px)';
      setTimeout(() => node.remove(), 220);
    }, 3200);
  }

  /* ---------------- Estado local ---------------- */
  function defaultState() {
    return {
      profile: { curl_pattern: '3A', porosity: 'media', thickness: 'medio', goal: 'definicion' },
      products: [],
      tools: PRESET_TOOLS.map((name) => ({ id: uid(), name, owned: false, preset: true })),
      settings: { reminderEnabled: true, reminderTime: '08:00' },
      logs: {},
      lastNotified: ''
    };
  }

  function mergeTools(tools) {
    const list = (Array.isArray(tools) ? tools : [])
      .filter((tool) => tool && typeof tool.name === 'string' && tool.name.trim())
      .map((tool) => ({
        id: isUuid(tool.id) ? tool.id : uid(),
        name: tool.name.trim(),
        owned: Boolean(tool.owned),
        preset: Boolean(tool.preset)
      }));
    const seen = new Set();
    const merged = [];
    list.forEach((tool) => {
      const key = tool.name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(tool);
    });
    PRESET_TOOLS.forEach((name) => {
      if (!seen.has(name.toLowerCase())) {
        merged.push({ id: uid(), name, owned: false, preset: true });
      }
    });
    return merged;
  }

  function loadState() {
    const fallback = defaultState();
    let parsed = {};
    try { parsed = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (error) { parsed = {}; }
    const products = (Array.isArray(parsed.products) ? parsed.products : [])
      .filter((product) => product && product.name)
      .map((product) => ({
        id: isUuid(product.id) ? product.id : uid(),
        name: String(product.name),
        brand: String(product.brand || ''),
        category: CATEGORIES.includes(product.category) ? product.category : CATEGORIES[0],
        status: STATUSES.includes(product.status) ? product.status : STATUSES[0],
        ingredients: Array.isArray(product.ingredients) ? product.ingredients.map(String) : [],
        notes: String(product.notes || '')
      }));
    const logs = {};
    if (parsed.logs && typeof parsed.logs === 'object') {
      Object.entries(parsed.logs).forEach(([key, log]) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !log || typeof log !== 'object') return;
        logs[key] = {
          completed: Boolean(log.completed),
          steps: Array.isArray(log.steps) ? log.steps : [],
          productsUsed: Array.isArray(log.productsUsed) ? log.productsUsed.map(String) : [],
          toolsUsed: Array.isArray(log.toolsUsed) ? log.toolsUsed.map(String) : [],
          definition: Number.isInteger(log.definition) ? log.definition : null,
          frizz: Number.isInteger(log.frizz) ? log.frizz : null,
          notes: String(log.notes || '')
        };
      });
    }
    return {
      profile: Object.assign({}, fallback.profile, parsed.profile || {}),
      products,
      tools: mergeTools(parsed.tools),
      settings: Object.assign({}, fallback.settings, parsed.settings || {}),
      logs,
      lastNotified: String(parsed.lastNotified || '')
    };
  }

  let state = loadState();
  let currentView = 'hoy';
  let currentCategory = CATEGORIES[0];
  let expandedDay = dateKey();
  let editingProductId = null;
  let modalIngredients = [];
  let authMode = 'login';
  let syncState = { ready: false, session: null, timer: null, syncing: false, errorShown: false };
  let lastEnteredUser = null;

  function saveLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (error) { /* almacenamiento no disponible */ }
  }

  function persist() {
    saveLocal();
    clearTimeout(syncState.timer);
    syncState.timer = setTimeout(() => pushCloud(false), 700);
  }

  /* ---------------- Compatibilidad ---------------- */
  function evaluateProduct(product, profile) {
    const ingredients = (product.ingredients || []).map((item) => String(item).toLowerCase());
    const has = (needle) => ingredients.some((item) => item.includes(needle));
    const notes = [];
    let caution = false;

    if (has('sulfat')) {
      caution = true;
      notes.push('Sulfatos: pueden resecar, sobre todo con porosidad alta o cabello fino.');
    }
    if (has('silicon')) {
      if (profile.porosity === 'baja') {
        caution = true;
        notes.push('Siliconas + porosidad baja: riesgo de acumulación y peso.');
      } else {
        notes.push('Siliconas: buen sellado; alterna con una limpieza periódica.');
      }
    }
    if (has('alcohol')) {
      caution = true;
      notes.push('Alcoholes secantes: tienden a resecar el rizo.');
    }
    if (has('aceite') || has('manteca') || has('karité') || has('shea')) {
      if (profile.porosity === 'baja' && profile.thickness === 'fino') {
        caution = true;
        notes.push('Aceites o mantecas pesadas: pueden apelmazar tu perfil.');
      } else {
        notes.push('Aceites naturales: ayudan a sellar y controlar el frizz.');
      }
    }
    if (has('prote')) {
      if (profile.thickness === 'fino' && profile.porosity === 'baja') {
        caution = true;
        notes.push('Proteínas: en exceso pueden rigidizar un cabello fino.');
      } else {
        notes.push('Proteínas: refuerzan la fibra y ayudan contra el encogimiento.');
      }
    }
    if (has('glicerina')) notes.push('Glicerina: humectante útil para retener humedad.');
    if (has('aloe')) notes.push('Aloe: calmante y ligero, apto para cuero cabelludo sensible.');

    const brand = String(product.brand || '').toLowerCase();
    if (/deva|shea moisture|curlsmith|boucleme|pattern|mise en sc|not your mother|novex|salerm|afrodita|rizo|curl/.test(brand)) {
      notes.push('Marca con líneas específicas para rizos (heurística orientativa).');
    }
    if (!notes.length) notes.push('Sin componentes etiquetados. Añade etiquetas para afinar el análisis.');

    return { ok: !caution, notes };
  }

  /* ---------------- Horario inteligente ---------------- */
  function availableProducts() {
    return state.products.filter((product) => product.status !== STATUSES[2]);
  }

  function productsIn(categories) {
    const ids = new Set();
    const result = [];
    categories.forEach((category) => {
      availableProducts().forEach((product) => {
        if (product.category === category && !ids.has(product.id)) {
          ids.add(product.id);
          result.push(product);
        }
      });
    });
    return result;
  }

  function ownsTool(name) {
    const needle = name.toLowerCase();
    return state.tools.some((tool) => tool.owned && tool.name.toLowerCase().includes(needle));
  }

  function planForDay(date) {
    const profile = state.profile;
    const day = mondayIndex(date);
    const steps = [];
    const suggestions = [];
    const missing = new Set();

    const addStep = (title, detail, categories, options = {}) => {
      const found = productsIn(categories);
      if (!found.length) {
        missing.add(categories[0]);
        const label = categories.map(shortCategory).join(' o ').toLowerCase();
        const article = categories[0] === 'Crema de peinar' ? 'una' : 'un';
        suggestions.push(`Añade ${article} ${label} a tu inventario para ${options.reason || title.toLowerCase()}.`);
        return;
      }
      steps.push({
        title,
        detail,
        products: found.map((product) => product.id),
        tools: options.tools || [],
        tip: options.tip || ''
      });
    };

    const waterStep = () => {
      const hasMister = ownsTool('atomizador');
      steps.push({
        title: 'Refresco con agua',
        detail: 'Humedece ligeramente sin empapar: reactiva el rizo y facilita el peinado.',
        products: [],
        tools: hasMister ? ['Atomizador de agua'] : [],
        tip: hasMister ? '' : 'Sin atomizador, aplica agua con las manos en gotas finas.'
      });
    };

    const washDays = profile.curl_pattern === '4A'
      ? [5]
      : (profile.thickness === 'fino' ? [0, 3, 5] : [0, 3, 5]);

    if (washDays.includes(day)) {
      addStep('Limpieza del cuero cabelludo', 'Masajea con yemas, no con uñas. Enjuaga con agua tibia.', ['Shampoo'], {
        tools: ownsTool('masajeador') ? ['Masajeador de cuero cabelludo'] : [],
        tip: ownsTool('masajeador') ? '' : 'Un masajeador mejora la circulación sin agitar el rizo.',
        reason: 'limpiar sin agredir el cuero cabelludo'
      });
    }

    if (washDays.includes(day) || day === 2) {
      addStep('Acondicionamiento', 'Aplica de medios a puntas, desenreda de abajo hacia arriba.', ['Acondicionador'], {
        tools: ownsTool('dientes anchos') ? ['Peine de dientes anchos'] : ownsTool('desenredante') ? ['Cepillo flexible desenredante'] : [],
        tip: (ownsTool('dientes anchos') || ownsTool('desenredante')) ? '' : 'Un peine de dientes anchos evita romper el rizo.',
        reason: 'desenredar con menos fricción'
      });
    }

    const needsMask = day === 5 || profile.porosity === 'alta' || (String(profile.curl_pattern).startsWith('4') && day === 2);
    if (needsMask) {
      addStep('Tratamiento / mascarilla', 'Tiempo de posedura corto; retira bien para no dejar residuos.', ['Tratamiento / Mascarilla'], {
        tools: ownsTool('pinzas pico') ? ['Pinzas pico de pato'] : [],
        tip: profile.porosity === 'baja' ? 'Con porosidad baja, usa poca cantidad y evita las raíces.' : '',
        reason: 'dar un refuerzo de hidratación'
      });
    }

    if (!washDays.includes(day) && day !== 5) waterStep();

    const styleDay = washDays.includes(day) || day === 1 || day === 4;
    if (styleDay) {
      addStep('Definición y peinado', 'Aplica sobre cabello húmedo, rizo por rizo o por secciones.', ['Crema de peinar'], {
        tools: ownsTool('denman') ? ['Cepillo definidor de 9 hileras tipo Denman'] : ownsTool('desenredante') ? ['Cepillo flexible desenredante'] : [],
        tip: ownsTool('denman') ? '' : 'El cepillo definidor de 9 hileras ayuda a agrupar el rizo.',
        reason: 'definir el patrón de rizo'
      });
    }

    const goal = profile.goal;
    const needsGel = goal === 'definicion' || goal === 'encogimiento' || washDays.includes(day);
    if (needsGel) {
      addStep('Fijación', 'Sella la definición con gel; evita tocar hasta que se forme la película.', ['Gel'], {
        tools: ownsTool('pinzas pico') ? ['Pinzas pico de pato'] : [],
        tip: goal === 'encogimiento'
          ? (ownsTool('difusor') ? 'Usa el difusor a baja temperatura sin frotar, estirando mechones.' : 'Estira mechones con las pinzas; el difusor ayuda a mantener la longitud.')
          : (ownsTool('difusor') ? 'Seca con difusor a baja potencia, sin mover la cabeza.' : 'Seca al aire o con difusor si lo tienes disponible.'),
        reason: 'fijar la definición y reducir el frizz'
      });
    }

    const needsOil = goal === 'frizz' || day === 4 || (profile.porosity === 'alta' && day !== 0) || (String(profile.curl_pattern).startsWith('4') && day === 5);
    if (needsOil) {
      addStep('Sellado de puntas', 'Una cantidad mínima, solo en puntas, para frenar la humedad.', ['Aceite'], {
        tip: profile.porosity === 'baja' || profile.thickness === 'fino' ? 'Con porosidad baja o cabello fino, usa una gota y evita raíces.' : '',
        reason: 'sellar y controlar el frizz'
      });
    }

    steps.push({
      title: 'Protección nocturna',
      detail: 'Recoge el cabello sin apretar antes de dormir para conservar el patrón.',
      products: [],
      tools: ownsTool('satén') ? ['Gorro/funda de satén'] : [],
      tip: ownsTool('satén') ? '' : 'Una funda o gorro de satén reduce la fricción y el frizz.',
      productsHint: ''
    });

    const dayTitles = {
      0: 'Limpieza y definición',
      1: 'Refresco express',
      2: 'Hidratación intermedia',
      3: 'Definición reforzada',
      4: 'Refresco y sellado',
      5: 'Lavado y mascarilla',
      6: 'Descanso protector'
    };

    return {
      day,
      date,
      key: dateKey(date),
      title: dayTitles[day],
      steps,
      suggestions: Array.from(new Set(suggestions)).slice(0, 2),
      missing: Array.from(missing)
    };
  }

  function streakCount() {
    let count = 0;
    let cursor = new Date();
    if (!(state.logs[dateKey(cursor)] || {}).completed) cursor = addDays(cursor, -1);
    while (state.logs[dateKey(cursor)] && state.logs[dateKey(cursor)].completed) {
      count += 1;
      cursor = addDays(cursor, -1);
    }
    return count;
  }

  function stepProductNames(step) {
    return (step.products || [])
      .map((id) => state.products.find((product) => product.id === id))
      .filter(Boolean)
      .map((product) => product.name);
  }

  /* ---------------- Render: navegación ---------------- */
  function renderNav() {
    $$('[data-nav-icon]').forEach((holder) => {
      holder.innerHTML = icon(holder.dataset.navIcon, 'h-[22px] w-[22px]');
    });
    $$('[data-nav]').forEach((button) => {
      button.dataset.active = String(button.dataset.nav === currentView);
    });
    $('#topSubtitle').textContent = VIEW_LABELS[currentView] || 'Hoy';
  }

  function setView(view) {
    currentView = VIEW_LABELS[view] ? view : 'hoy';
    $$('[data-view]').forEach((section) => {
      section.classList.toggle('hidden', section.dataset.view !== currentView);
    });
    renderNav();
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function renderCurrentView() {
    switch (currentView) {
      case 'perfil': renderProfile(); break;
      case 'inventario': renderInventory(); break;
      case 'rutina': renderRoutine(); break;
      case 'ajustes': renderSettings(); break;
      default: renderToday();
    }
  }

  function renderAll() {
    renderCurrentView();
    renderSyncStatus();
    renderAccount();
    renderReminderSettings();
  }

  /* ---------------- Render: Hoy ---------------- */
  function renderToday() {
    const today = new Date();
    const key = dateKey(today);
    const plan = planForDay(today);
    const log = state.logs[key] || {};
    const available = availableProducts();
    const toolCount = state.tools.filter((tool) => tool.owned).length;
    const streak = streakCount();
    const completed = Boolean(log.completed);

    $('#todayDate').textContent = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(today);

    const stepRows = plan.steps.map((step, index) => {
      const names = stepProductNames(step);
      const tools = (step.tools || []).filter((tool) => ownsTool(tool));
      const meta = [...names, ...tools].join(' · ');
      return `<div class="flex gap-3 py-3">
        <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3f3f46] text-[11px] text-[#a1a1aa]">${index + 1}</span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium">${esc(step.title)}</p>
          <p class="mt-0.5 text-xs leading-relaxed muted">${esc(step.detail)}</p>
          ${meta ? `<p class="mt-1 text-[11px] faint">${esc(meta)}</p>` : ''}
          ${step.tip ? `<p class="mt-1 text-[11px] faint">${icon('spark', 'mr-1 inline h-3 w-3')}${esc(step.tip)}</p>` : ''}
        </div>
      </div>`;
    }).join('');

    const suggestions = plan.suggestions.length
      ? `<div class="surface-flat mt-4 p-4">
          <p class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider muted">${icon('spark', 'h-4 w-4')}Mejoras discretas</p>
          <ul class="mt-2 space-y-1.5 text-sm muted">${plan.suggestions.map((item) => `<li class="flex gap-2"><span class="faint">—</span>${esc(item)}</li>`).join('')}</ul>
        </div>`
      : '';

    const shopping = state.products.filter((product) => product.status === STATUSES[2]).slice(0, 3);
    const shoppingHtml = shopping.length
      ? `<div class="surface p-5">
          <p class="label">Lista de compra</p>
          <div class="space-y-2">${shopping.map((product) => `<div class="flex items-center justify-between gap-2 text-sm"><span class="truncate muted">${esc(product.name)}</span><span class="shrink-0 text-xs faint">${esc(shortCategory(product.category))}</span></div>`).join('')}</div>
          <button class="btn-ghost mt-4 w-full" type="button" data-nav="inventario">Ver inventario</button>
        </div>`
      : '';

    $('#todayContent').innerHTML = `
      <div class="surface overflow-hidden">
        <div class="relative p-6 sm:p-7">
          <div class="pulse-ring absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#27272a]"></div>
          <div class="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[.16em] faint">Plan de hoy · ${esc(plan.title)}</p>
              <h2 class="mt-2 text-2xl font-semibold tracking-tight">${completed ? 'Día registrado' : 'Tu rutina está lista'}</h2>
              <p class="mt-2 max-w-lg text-sm muted">${plan.steps.length} ${plan.steps.length === 1 ? 'paso disponible' : 'pasos disponibles'} con tu inventario actual${plan.suggestions.length ? ` · ${plan.suggestions.length} sugerencia${plan.suggestions.length > 1 ? 's' : ''}` : ''}.</p>
            </div>
            <span class="chip ${completed ? 'chip-ok' : 'chip-warn'}">${completed ? icon('check', 'h-3.5 w-3.5') : icon('calendar', 'h-3.5 w-3.5')}${completed ? 'Completado' : 'Pendiente'}</span>
          </div>
          <div class="relative mt-6 grid grid-cols-3 gap-3">
            <div class="surface-flat p-3"><p class="text-xl font-semibold">${streak}</p><p class="text-[11px] faint">días de racha</p></div>
            <div class="surface-flat p-3"><p class="text-xl font-semibold">${available.length}</p><p class="text-[11px] faint">productos listos</p></div>
            <div class="surface-flat p-3"><p class="text-xl font-semibold">${toolCount}</p><p class="text-[11px] faint">herramientas</p></div>
          </div>
        </div>
        <div class="hairline"></div>
        <div class="px-6 py-2 sm:px-7">${stepRows || '<p class="py-6 text-sm muted">Añade productos a tu inventario para generar pasos.</p>'}</div>
        ${suggestions ? `<div class="px-6 pb-6 sm:px-7">${suggestions}</div>` : '<div class="pb-4"></div>'}
        <div class="hairline"></div>
        <div class="flex flex-wrap gap-2 p-5 sm:px-7">
          <button class="btn-primary" type="button" data-open-log="${key}">${icon('check', 'h-4 w-4')}${completed ? 'Editar registro' : 'Marcar como completado'}</button>
          <button class="btn-ghost" type="button" data-nav="rutina">Ver semana ${icon('arrow', 'h-4 w-4')}</button>
        </div>
      </div>
      ${completed ? `<div class="surface p-5 sm:p-6">
        <p class="label">Resultado de hoy</p>
        <div class="mt-3 flex flex-wrap gap-6 text-sm">
          <div><span class="muted">Definición</span> <span class="ml-2 font-semibold">${log.definition ? `${log.definition}/5` : '—'}</span></div>
          <div><span class="muted">Frizz</span> <span class="ml-2 font-semibold">${log.frizz ? `${log.frizz}/5` : '—'}</span></div>
          ${log.notes ? `<div class="w-full text-xs faint">“${esc(log.notes)}”</div>` : ''}
        </div>
      </div>` : ''}
      <div class="grid gap-5 sm:grid-cols-2">
        <div class="surface p-5">
          <p class="label">Lectura rápida</p>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between gap-3"><span class="muted">Patrón</span><span>${esc(state.profile.curl_pattern)} · ${esc(PATTERN_LABELS[state.profile.curl_pattern] || '')}</span></div>
            <div class="hairline"></div>
            <div class="flex items-center justify-between gap-3"><span class="muted">Porosidad</span><span>${esc(state.profile.porosity)}</span></div>
            <div class="hairline"></div>
            <div class="flex items-center justify-between gap-3"><span class="muted">Objetivo</span><span>${esc(GOAL_LABELS[state.profile.goal] || state.profile.goal)}</span></div>
          </div>
          <button class="btn-ghost mt-5 w-full" type="button" data-nav="perfil">Ajustar perfil</button>
        </div>
        ${shoppingHtml || `<div class="surface p-5"><p class="label">Todo cubierto</p><p class="text-sm muted">No tienes productos pendientes en la lista de compra. Tu inventario está al día.</p></div>`}
      </div>`;
  }

  /* ---------------- Render: Perfil ---------------- */
  function renderProfile() {
    const profile = state.profile;
    $('#profilePattern').value = profile.curl_pattern;
    $('#profilePorosity').value = profile.porosity;
    $('#profileThickness').value = profile.thickness;
    $('#profileGoal').value = profile.goal;
    syncAllSelects();

    const washNote = profile.curl_pattern === '4A'
      ? 'Frecuencia de lavado baja: prioriza hidratación intermedia y mascarilla semanal.'
      : profile.thickness === 'fino'
        ? 'Cabello fino: lavados frecuentes suaves y texturas ligeras.'
        : 'Frecuencia equilibrada: dos o tres lavados semanales con definición intermedia.';

    const porosityNote = {
      baja: 'Porosidad baja: dificultad para absorber; evita capas pesadas y usa calor suave si secas.',
      media: 'Porosidad media: buena retención; alterna hidratación y fijación sin excesos.',
      alta: 'Porosidad alta: absorbe rápido y pierde humedad; sellado con aceite y mascarilla regular.'
    }[profile.porosity] || '';

    const goalNote = {
      frizz: 'Tu rutina prioriza acondicionamiento, gel y sellado de puntas.',
      definicion: 'Tu rutina prioriza crema de peinar, cepillo definidor y fijación con gel.',
      encogimiento: 'Tu rutina prioriza estiramiento suave, gel y secado con difusor.',
      salud: 'Tu rutina equilibra limpieza, hidratación y protección nocturna.'
    }[profile.goal] || '';

    $('#profileSummary').innerHTML = `
      <div><p class="faint text-xs">Patrón</p><p>${esc(profile.curl_pattern)} · ${esc(PATTERN_LABELS[profile.curl_pattern] || '')}</p></div>
      <div class="hairline"></div>
      <div><p class="faint text-xs">Porosidad</p><p>${esc(porosityNote)}</p></div>
      <div class="hairline"></div>
      <div><p class="faint text-xs">Grosor</p><p>${esc(THICKNESS_LABELS[profile.thickness] || profile.thickness)} · ${esc(washNote)}</p></div>
      <div class="hairline"></div>
      <div><p class="faint text-xs">Objetivo</p><p>${esc(goalNote)}</p></div>`;
  }

  /* ---------------- Render: Inventario ---------------- */
  function renderInventory() {
    $('#categoryTabs').innerHTML = CATEGORIES.map((category) => {
      const count = state.products.filter((product) => product.category === category).length;
      return `<button class="shrink-0 rounded-xl px-3.5 py-2 text-sm transition ${currentCategory === category ? 'bg-[#fafafa] font-semibold text-[#09090b]' : 'text-[#a1a1aa] hover:text-white'}" type="button" data-category="${esc(category)}">${esc(shortCategory(category))}<span class="ml-1.5 text-xs opacity-60">${count}</span></button>`;
    }).join('');

    const list = state.products.filter((product) => product.category === currentCategory);
    $('#productList').innerHTML = list.length
      ? list.map((product) => {
          const compatibility = evaluateProduct(product, state.profile);
          const statusClass = product.status === STATUSES[2] ? 'chip-warn' : 'chip-ok';
          return `<article class="p-4 sm:p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate font-medium">${esc(product.name)}</p>
                <p class="mt-0.5 truncate text-xs faint">${esc(product.brand || 'Sin marca')} · ${esc(shortCategory(product.category))}</p>
              </div>
              <div class="flex shrink-0 gap-1">
                <button class="rounded-lg p-2 muted hover:bg-[#18181b] hover:text-white" type="button" data-edit-product="${esc(product.id)}" aria-label="Editar producto">${icon('edit', 'h-4 w-4')}</button>
                <button class="rounded-lg p-2 muted hover:bg-[#18181b] hover:text-white" type="button" data-delete-product="${esc(product.id)}" aria-label="Eliminar producto">${icon('trash', 'h-4 w-4')}</button>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button class="chip ${statusClass}" type="button" data-cycle-status="${esc(product.id)}" title="Toca para cambiar el estado">${esc(product.status)}</button>
              <span class="chip ${compatibility.ok ? 'chip-ok' : 'chip-warn'}" title="${esc(compatibility.notes.join(' · '))}">${icon(compatibility.ok ? 'check' : 'alert', 'h-3.5 w-3.5')}${compatibility.ok ? 'Apto para tus rizos' : 'Precaución / Reseca'}</span>
            </div>
            ${product.ingredients.length ? `<div class="mt-3 flex flex-wrap gap-1.5">${product.ingredients.map((item) => `<span class="chip">${esc(item)}</span>`).join('')}</div>` : ''}
            ${product.notes ? `<p class="mt-3 text-xs faint">${esc(product.notes)}</p>` : ''}
            ${compatibility.notes.length ? `<details class="mt-3"><summary class="cursor-pointer text-xs muted hover:text-white">Ver análisis de compatibilidad</summary><ul class="mt-2 space-y-1 text-xs faint">${compatibility.notes.map((note) => `<li>· ${esc(note)}</li>`).join('')}</ul></details>` : ''}
          </article>`;
        }).join('')
      : `<div class="px-5 py-12 text-center">
          <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#27272a] text-[#a1a1aa]">${icon('drop', 'h-5 w-5')}</div>
          <p class="mt-3 text-sm font-medium">Sin productos en ${esc(shortCategory(currentCategory))}</p>
          <p class="mt-1 text-xs muted">Añade el primero para que entre en tu horario.</p>
          <button class="btn-ghost mt-4" type="button" data-add-product="${esc(currentCategory)}">${icon('plus', 'h-4 w-4')}Añadir producto</button>
        </div>`;

    $('#toolsCount').textContent = `${state.tools.filter((tool) => tool.owned).length} / ${state.tools.length} disponibles`;
    $('#toolsList').innerHTML = state.tools.map((tool) => `
      <div class="surface-flat flex items-center gap-3 p-3.5">
        <button class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${tool.owned ? 'border-[#fafafa] bg-[#fafafa] text-[#09090b]' : 'border-[#3f3f46] text-transparent'}" type="button" data-toggle-tool="${esc(tool.id)}" aria-label="${tool.owned ? 'Marcar como no disponible' : 'Marcar como disponible'}">${icon('check', 'h-4 w-4')}</button>
        <button class="min-w-0 flex-1 text-left" type="button" data-toggle-tool="${esc(tool.id)}">
          <span class="block truncate text-sm ${tool.owned ? 'text-[#fafafa]' : 'muted'}">${esc(tool.name)}</span>
          <span class="text-[11px] faint">${tool.owned ? 'Lo tengo' : 'No lo tengo'}${tool.preset ? ' · esencial' : ''}</span>
        </button>
        ${tool.preset ? '' : `<button class="shrink-0 rounded-lg p-2 faint hover:text-white" type="button" data-delete-tool="${esc(tool.id)}" aria-label="Eliminar herramienta">${icon('trash', 'h-4 w-4')}</button>`}
      </div>`).join('');
  }

  /* ---------------- Render: Rutina ---------------- */
  function renderRoutine() {
    const monday = mondayOf(new Date());
    const todayKey = dateKey();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(monday, index);
      const key = dateKey(date);
      const plan = planForDay(date);
      const log = state.logs[key] || {};
      const isToday = key === todayKey;
      return { date, key, plan, log, isToday };
    });

    $('#weekStrip').innerHTML = days.map((day) => `
      <button class="min-w-[92px] flex-1 rounded-xl border p-3 text-left transition ${day.isToday ? 'border-[#fafafa] bg-[#18181b]' : 'border-[#27272a] bg-[#121214] hover:border-[#3f3f46]'}" type="button" data-jump-day="${day.key}">
        <span class="block text-[10px] uppercase tracking-wider ${day.isToday ? 'text-[#fafafa]' : 'faint'}">${esc(DAY_NAMES[day.plan.day].slice(0, 3))}</span>
        <span class="mt-1 block text-lg font-semibold">${day.date.getDate()}</span>
        <span class="mt-1 flex items-center gap-1 text-[10px] ${day.log.completed ? 'text-[#fafafa]' : 'faint'}">${icon(day.log.completed ? 'check' : 'calendar', 'h-3 w-3')}${day.log.completed ? 'Hecho' : `${day.plan.steps.length} pasos`}</span>
      </button>`).join('');

    $('#routineList').innerHTML = days.map((day) => {
      const steps = day.plan.steps.map((step, index) => {
        const names = stepProductNames(step);
        const tools = (step.tools || []).filter((tool) => ownsTool(tool));
        const meta = [...names, ...tools].join(' · ');
        return `<li class="flex gap-3 py-2.5">
          <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3f3f46] text-[11px] faint">${index + 1}</span>
          <div class="min-w-0">
            <p class="text-sm font-medium">${esc(step.title)}</p>
            <p class="mt-0.5 text-xs leading-relaxed muted">${esc(step.detail)}</p>
            ${meta ? `<p class="mt-1 text-[11px] faint">${esc(meta)}</p>` : ''}
            ${step.tip ? `<p class="mt-1 text-[11px] faint">${icon('spark', 'mr-1 inline h-3 w-3')}${esc(step.tip)}</p>` : ''}
          </div>
        </li>`;
      }).join('');

      return `<article id="day-${day.key}" class="surface overflow-hidden ${day.isToday ? 'border-[#52525b]' : ''}">
        <button class="flex w-full items-center justify-between gap-3 p-5 text-left" type="button" data-toggle-day="${day.key}">
          <div class="min-w-0">
            <p class="text-[11px] uppercase tracking-[.14em] ${day.isToday ? 'text-[#fafafa]' : 'faint'}">${esc(DAY_NAMES[day.plan.day])}${day.isToday ? ' · Hoy' : ''} · ${esc(formatDay(day.date))}</p>
            <h3 class="mt-1.5 text-lg font-semibold">${esc(day.plan.title)}</h3>
            <p class="mt-1 text-xs muted">${day.plan.steps.length} pasos · ${day.plan.suggestions.length ? `${day.plan.suggestions.length} sugerencia${day.plan.suggestions.length > 1 ? 's' : ''}` : 'inventario completo'}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            ${day.log.completed ? `<span class="chip chip-ok">${icon('check', 'h-3.5 w-3.5')}Hecho</span>` : ''}
            <span class="text-[#a1a1aa] transition ${expandedDay === day.key ? 'rotate-180' : ''}">${icon('calendar', 'h-4 w-4')}</span>
          </div>
        </button>
        ${expandedDay === day.key ? `<div class="border-t border-[#27272a] px-5 py-4 sm:px-6">
          <ol class="divide-y divide-[#27272a]">${steps || '<li class="py-4 text-sm muted">Sin pasos disponibles con tu inventario actual.</li>'}</ol>
          ${day.plan.suggestions.length ? `<div class="surface-flat mt-4 p-3.5"><p class="text-xs font-semibold muted">Podrías potenciar este día con:</p><ul class="mt-1.5 space-y-1 text-xs faint">${day.plan.suggestions.map((item) => `<li>· ${esc(item)}</li>`).join('')}</ul></div>` : ''}
          ${day.log.completed && (day.log.definition || day.log.frizz) ? `<p class="mt-4 text-xs faint">Resultado · Definición ${day.log.definition || '—'}/5 · Frizz ${day.log.frizz || '—'}/5</p>` : ''}
          <button class="btn-ghost mt-4 w-full" type="button" data-open-log="${day.key}">${icon(day.log.completed ? 'edit' : 'check', 'h-4 w-4')}${day.log.completed ? 'Editar registro' : 'Registrar este día'}</button>
        </div>` : ''}
      </article>`;
    }).join('');

    $('#routineNote').innerHTML = `${icon('spark', 'mr-1 inline h-3.5 w-3.5')}El horario se recalcula al cambiar tu perfil o al marcar productos y herramientas como disponibles. Las sugerencias solo proponen lo que falta; nunca se incluye en los pasos. Análisis de compatibilidad orientativo, no sustituye el criterio de un profesional.`;
  }

  /* ---------------- Render: Ajustes ---------------- */
  function renderSettings() {
    renderReminderSettings();
    renderSyncStatus();
    renderAccount();
  }

  function renderReminderSettings() {
    $('#reminderTime').value = state.settings.reminderTime;
    syncPicker($('#reminderTime'));
    $$('#reminderToggle .seg-btn').forEach((button) => {
      button.dataset.active = String((button.dataset.value === 'on') === Boolean(state.settings.reminderEnabled));
    });
    const permission = ('Notification' in window) ? Notification.permission : 'unsupported';
    const text = {
      granted: 'Permiso concedido. Recibirás el aviso a la hora configurada.',
      denied: 'Permiso bloqueado en el navegador. Debes habilitarlo desde los permisos del sitio.',
      default: 'Aún no has concedido permiso. Las notificaciones no se enviarán.',
      unsupported: 'Este navegador no admite notificaciones locales.'
    }[permission] || 'Estado desconocido.';
    $('#permissionStatus').textContent = text;
    $('#askPermissionBtn').classList.toggle('hidden', permission === 'granted' || permission === 'denied' || permission === 'unsupported');
    $('#notifIcon').innerHTML = icon('bell', 'h-5 w-5 text-[#a1a1aa]');
  }

  function renderSyncStatus() {
    const online = Boolean(syncState.ready);
    const label = online ? 'Sincronizado' : 'Modo local';
    ['sideSyncDot', 'topSyncDot'].forEach((id) => { const node = $('#' + id); if (node) node.dataset.online = String(online); });
    const side = $('#sideSyncLabel');
    if (side) side.textContent = label;
    const cloud = $('#cloudStatus');
    if (cloud) cloud.innerHTML = `<span class="badge-dot" data-online="${online}"></span><span>${label}</span>`;
  }

  function renderAccount() {
    const email = syncState.session && syncState.session.user && syncState.session.user.email
      ? syncState.session.user.email
      : 'Invitado';
    ['sideEmail', 'accountEmail'].forEach((id) => { const node = $('#' + id); if (node) node.textContent = email; });
    const initial = email === 'Invitado' ? 'C' : email.charAt(0).toUpperCase();
    ['sideAvatar', 'topAvatar'].forEach((id) => { const node = $('#' + id); if (node) node.textContent = initial; });
  }

  /* ---------------- Modales ---------------- */
  function openModal(html) {
    const root = $('#modalRoot');
    root.innerHTML = `<div class="modal-backdrop fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" data-modal-overlay>
      <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-[#27272a] bg-[#121214] p-5 shadow-2xl animate-in sm:rounded-2xl sm:p-6">${html}</div>
    </div>`;
    document.body.style.overflow = 'hidden';
    initSelects(root);
    initPickers(root);
    const firstField = $('input:not([type="hidden"]), .select-trigger, textarea', root);
    if (firstField) setTimeout(() => firstField.focus(), 60);
  }

  function closeModal() {
    $('#modalRoot').innerHTML = '';
    document.body.style.overflow = '';
  }

  function modalHeader(title, subtitle) {
    return `<div class="mb-5 flex items-start justify-between gap-4">
      <div><h2 class="text-xl font-semibold">${esc(title)}</h2>${subtitle ? `<p class="mt-1 text-sm muted">${esc(subtitle)}</p>` : ''}</div>
      <button class="rounded-lg p-2 muted hover:text-white" type="button" data-close-modal aria-label="Cerrar">${icon('close', 'h-5 w-5')}</button>
    </div>`;
  }

  function renderIngredientTags() {
    const holder = $('#ingredientTags');
    if (!holder) return;
    holder.innerHTML = modalIngredients.length
      ? modalIngredients.map((item, index) => `<span class="chip">${esc(item)}<button class="text-[#a1a1aa] hover:text-white" type="button" data-remove-ingredient="${index}" aria-label="Quitar ${esc(item)}">${icon('close', 'h-3 w-3')}</button></span>`).join('')
      : '<span class="text-xs faint">Sin etiquetas todavía</span>';
  }

  function addIngredient(raw) {
    const value = String(raw || '').trim().replace(/,$/, '').trim();
    if (!value) return;
    if (!modalIngredients.some((item) => item.toLowerCase() === value.toLowerCase())) modalIngredients.push(value);
    renderIngredientTags();
  }

  function openProductModal(product, category) {
    editingProductId = product ? product.id : null;
    modalIngredients = product ? [...(product.ingredients || [])] : [];
    const selectedCategory = product ? product.category : category;
    const selectedStatus = product ? product.status : STATUSES[0];

    openModal(`${modalHeader(product ? 'Editar producto' : 'Nuevo producto', 'El análisis de compatibilidad se calcula con tu perfil.')}
      <form id="productForm" class="space-y-4">
        <div>
          <label class="label" for="productName">Nombre</label>
          <input class="field" id="productName" required maxlength="80" placeholder="Ej. Curl Defining Cream" value="${esc(product ? product.name : '')}" />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="label" for="productBrand">Marca</label>
            <input class="field" id="productBrand" maxlength="60" placeholder="Ej. Marca X" value="${esc(product ? product.brand : '')}" />
          </div>
          <div>
            <label class="label" for="productCategory">Categoría</label>
            <select class="field" id="productCategory">${CATEGORIES.map((item) => `<option value="${esc(item)}" ${item === selectedCategory ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select>
          </div>
        </div>
        <div>
          <label class="label" for="productStatus">Estado</label>
          <select class="field" id="productStatus">${STATUSES.map((item) => `<option value="${esc(item)}" ${item === selectedStatus ? 'selected' : ''}>${esc(item)}</option>`).join('')}</select>
        </div>
        <div>
          <label class="label" for="ingredientInput">Componentes clave</label>
          <div class="flex gap-2">
            <input class="field" id="ingredientInput" placeholder="Escribe y pulsa Enter" maxlength="40" />
            <button class="btn-ghost shrink-0" type="button" id="addIngredientBtn">${icon('plus', 'h-4 w-4')}</button>
          </div>
          <div id="ingredientTags" class="mt-3 flex flex-wrap gap-1.5"></div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            ${INGREDIENT_SUGGESTIONS.map((item) => `<button class="chip hover:border-[#52525b]" type="button" data-suggest-ingredient="${esc(item)}">+ ${esc(item)}</button>`).join('')}
          </div>
        </div>
        <div>
          <label class="label" for="productNotes">Notas (opcional)</label>
          <textarea class="field" id="productNotes" rows="2" maxlength="240" placeholder="Textura, aroma, frecuencia de uso…">${esc(product ? product.notes : '')}</textarea>
        </div>
        <p class="text-xs faint">La compatibilidad es una guía orientativa basada en componentes y marcas; no sustituye el diagnóstico de un profesional.</p>
        <div class="flex gap-2 pt-1">
          <button class="btn-primary flex-1" type="submit">${product ? 'Guardar cambios' : 'Añadir producto'}</button>
          <button class="btn-ghost" type="button" data-close-modal>Cancelar</button>
        </div>
      </form>`);
    renderIngredientTags();

    $('#productForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const name = $('#productName').value.trim();
      if (!name) { toast('Escribe el nombre del producto'); return; }
      const payload = {
        id: editingProductId || uid(),
        name,
        brand: $('#productBrand').value.trim(),
        category: $('#productCategory').value,
        status: $('#productStatus').value,
        ingredients: [...modalIngredients],
        notes: $('#productNotes').value.trim()
      };
      if (editingProductId) {
        state.products = state.products.map((item) => item.id === editingProductId ? payload : item);
      } else {
        state.products.push(payload);
      }
      currentCategory = payload.category;
      closeModal();
      persist();
      renderAll();
      toast(product ? 'Producto actualizado' : 'Producto añadido');
    });
  }

  function openToolModal() {
    openModal(`${modalHeader('Nueva herramienta', 'Añade cualquier herramienta que uses en tu rutina.')}
      <form id="toolForm" class="space-y-4">
        <div>
          <label class="label" for="toolName">Nombre</label>
          <input class="field" id="toolName" required maxlength="80" placeholder="Ej. Cepillo de cerdas suaves" />
        </div>
        <label class="flex items-center gap-3 surface-flat p-3.5 text-sm">
          <input id="toolOwned" type="checkbox" class="h-4 w-4" style="accent-color:#fafafa" />
          <span>Lo tengo disponible</span>
        </label>
        <div class="flex gap-2 pt-1">
          <button class="btn-primary flex-1" type="submit">Añadir herramienta</button>
          <button class="btn-ghost" type="button" data-close-modal>Cancelar</button>
        </div>
      </form>`);
    $('#toolForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const name = $('#toolName').value.trim();
      if (!name) { toast('Escribe el nombre de la herramienta'); return; }
      if (state.tools.some((tool) => tool.name.toLowerCase() === name.toLowerCase())) {
        toast('Esa herramienta ya está en tu inventario');
        return;
      }
      state.tools.push({ id: uid(), name, owned: $('#toolOwned').checked, preset: false });
      closeModal();
      persist();
      renderAll();
      toast('Herramienta añadida');
    });
  }

  function ratingRow(label, group) {
    return `<div>
      <p class="label">${label}</p>
      <div class="seg" data-rate-group="${group}">
        ${[1, 2, 3, 4, 5].map((value) => `<button class="seg-btn" type="button" data-rate="${group}" data-value="${value}">${value}</button>`).join('')}
      </div>
    </div>`;
  }

  function openLogModal(key) {
    const date = parseDateKey(key);
    const log = state.logs[key] || {};
    const plan = planForDay(date);
    const suggestedProducts = Array.from(new Set([
      ...plan.steps.flatMap((step) => step.products || []),
      ...(log.productsUsed || [])
    ])).map((id) => state.products.find((product) => product.id === id)).filter(Boolean);
    const suggestedTools = Array.from(new Set([
      ...plan.steps.flatMap((step) => step.tools || []),
      ...(log.toolsUsed || [])
    ])).filter((tool) => ownsTool(tool));

    openModal(`${modalHeader('Registrar día', new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date))}
      <form id="logForm" class="space-y-5">
        <div>
          <label class="label" for="logDate">Fecha</label>
          <input class="field" id="logDate" type="date" value="${esc(key)}" max="${dateKey()}" />
        </div>
        <label class="flex items-center gap-3 surface-flat p-3.5 text-sm">
          <input id="logCompleted" type="checkbox" class="h-4 w-4" style="accent-color:#fafafa" ${log.completed ? 'checked' : ''} />
          <span>Marcar el día como completado</span>
        </label>
        <div>
          <p class="label">Productos usados</p>
          <div class="max-h-40 space-y-2 overflow-y-auto surface-flat p-3">
            ${suggestedProducts.length ? suggestedProducts.map((product) => `<label class="flex items-center gap-3 text-sm"><input type="checkbox" class="h-4 w-4" style="accent-color:#fafafa" data-used-product="${esc(product.id)}" ${(log.productsUsed || []).includes(product.id) ? 'checked' : ''} /><span class="truncate">${esc(product.name)}</span></label>`).join('') : '<p class="text-xs faint">Añade productos a tu inventario para registrarlos aquí.</p>'}
          </div>
        </div>
        <div>
          <p class="label">Herramientas usadas</p>
          <div class="max-h-40 space-y-2 overflow-y-auto surface-flat p-3">
            ${suggestedTools.length ? suggestedTools.map((tool) => `<label class="flex items-center gap-3 text-sm"><input type="checkbox" class="h-4 w-4" style="accent-color:#fafafa" data-used-tool="${esc(tool)}" ${(log.toolsUsed || []).includes(tool) ? 'checked' : ''} /><span class="truncate">${esc(tool)}</span></label>`).join('') : '<p class="text-xs faint">Marca herramientas como disponibles para registrarlas aquí.</p>'}
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          ${ratingRow('Definición (1–5)', 'definition')}
          ${ratingRow('Frizz (1–5)', 'frizz')}
        </div>
        <div>
          <label class="label" for="logNotes">Notas (opcional)</label>
          <textarea class="field" id="logNotes" rows="2" maxlength="240" placeholder="Qué funcionó, qué cambiar…">${esc(log.notes || '')}</textarea>
        </div>
        <div class="flex gap-2">
          <button class="btn-primary flex-1" type="submit">Guardar registro</button>
          <button class="btn-ghost" type="button" data-close-modal>Cancelar</button>
        </div>
      </form>`);

    const ratings = { definition: log.definition || null, frizz: log.frizz || null };
    const paintRatings = () => {
      $$('[data-rate]').forEach((button) => {
        button.dataset.active = String(Number(button.dataset.value) === ratings[button.dataset.rate]);
      });
    };
    paintRatings();
    $$('[data-rate]').forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.dataset.rate;
        const value = Number(button.dataset.value);
        ratings[group] = ratings[group] === value ? null : value;
        paintRatings();
      });
    });

    $('#logForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const targetKey = $('#logDate').value || key;
      state.logs[targetKey] = {
        completed: $('#logCompleted').checked,
        steps: plan.steps.map((step) => ({ title: step.title, products: step.products, tools: step.tools })),
        productsUsed: $$('[data-used-product]:checked').map((input) => input.dataset.usedProduct),
        toolsUsed: $$('[data-used-tool]:checked').map((input) => input.dataset.usedTool),
        definition: ratings.definition,
        frizz: ratings.frizz,
        notes: $('#logNotes').value.trim()
      };
      expandedDay = targetKey;
      closeModal();
      persist();
      renderAll();
      toast('Registro guardado');
    });
  }

  /* ---------------- Supabase ---------------- */
  function setSyncState(ready, session) {
    syncState.ready = ready;
    syncState.session = session || null;
    renderSyncStatus();
    renderAccount();
  }

  function mapProfile(row) {
    return {
      curl_pattern: row.curl_pattern || state.profile.curl_pattern,
      porosity: row.porosity || state.profile.porosity,
      thickness: row.thickness || state.profile.thickness,
      goal: row.goal || state.profile.goal,
      reminder_enabled: row.reminder_enabled !== false,
      reminder_time: row.reminder_time || state.settings.reminderTime
    };
  }

  function mapProduct(row) {
    return {
      id: isUuid(row.id) ? row.id : uid(),
      name: row.name,
      brand: row.brand || '',
      category: CATEGORIES.includes(row.category) ? row.category : CATEGORIES[0],
      status: STATUSES.includes(row.status) ? row.status : STATUSES[0],
      ingredients: Array.isArray(row.ingredients) ? row.ingredients.map(String) : [],
      notes: row.notes || ''
    };
  }

  function mapLog(row) {
    return {
      completed: Boolean(row.completed),
      steps: Array.isArray(row.steps) ? row.steps : [],
      productsUsed: Array.isArray(row.products_used) ? row.products_used.map(String) : [],
      toolsUsed: Array.isArray(row.tools_used) ? row.tools_used.map(String) : [],
      definition: Number.isInteger(row.definition) ? row.definition : null,
      frizz: Number.isInteger(row.frizz) ? row.frizz : null,
      notes: row.notes || ''
    };
  }

  async function loadCloud(session) {
    if (!sb) return;
    const userId = session.user.id;
    const [profileRes, productsRes, toolsRes, logsRes] = await Promise.all([
      sb.from('user_profile').select('*').eq('user_id', userId).maybeSingle(),
      sb.from('products').select('*').eq('user_id', userId),
      sb.from('tools').select('*').eq('user_id', userId),
      sb.from('schedule_logs').select('*').eq('user_id', userId)
    ]);

    const failed = [profileRes, productsRes, toolsRes, logsRes].some((result) => result && result.error);
    if (failed) {
      setSyncState(false, session);
      console.warn('Curly Tracker: tablas no disponibles, se usa modo local.', { profileRes, productsRes, toolsRes, logsRes });
      return;
    }

    if (profileRes.data) {
      const profile = mapProfile(profileRes.data);
      state.profile = { curl_pattern: profile.curl_pattern, porosity: profile.porosity, thickness: profile.thickness, goal: profile.goal };
      state.settings.reminderEnabled = profile.reminder_enabled;
      state.settings.reminderTime = profile.reminder_time;
    }
    if (productsRes.data && productsRes.data.length) state.products = productsRes.data.map(mapProduct);
    if (toolsRes.data && toolsRes.data.length) state.tools = mergeTools(toolsRes.data);
    if (logsRes.data && logsRes.data.length) {
      const remoteLogs = {};
      logsRes.data.forEach((row) => { remoteLogs[row.log_date] = mapLog(row); });
      state.logs = Object.assign({}, state.logs, remoteLogs);
    }

    saveLocal();
    setSyncState(true, session);
    renderAll();
    await pushCloud(false);
  }

  async function pushCloud(showToast) {
    if (!sb || !syncState.session || !syncState.ready || syncState.syncing) return;
    syncState.syncing = true;
    const userId = syncState.session.user.id;
    try {
      const profilePayload = {
        user_id: userId,
        curl_pattern: state.profile.curl_pattern,
        porosity: state.profile.porosity,
        thickness: state.profile.thickness,
        goal: state.profile.goal,
        reminder_enabled: state.settings.reminderEnabled,
        reminder_time: state.settings.reminderTime
      };
      let result = await sb.from('user_profile').upsert(profilePayload, { onConflict: 'user_id' });
      if (result.error) throw result.error;

      const products = state.products.map((product) => ({
        id: isUuid(product.id) ? product.id : uid(),
        user_id: userId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        status: product.status,
        ingredients: product.ingredients,
        notes: product.notes
      }));
      const remoteProducts = await sb.from('products').select('id').eq('user_id', userId);
      if (remoteProducts.error) throw remoteProducts.error;
      const productIds = new Set(products.map((item) => item.id));
      const staleProducts = (remoteProducts.data || []).map((row) => row.id).filter((id) => !productIds.has(id));
      if (staleProducts.length) {
        result = await sb.from('products').delete().in('id', staleProducts).eq('user_id', userId);
        if (result.error) throw result.error;
      }
      if (products.length) {
        result = await sb.from('products').upsert(products, { onConflict: 'id' });
        if (result.error) throw result.error;
      }

      const tools = state.tools.map((tool) => ({
        id: isUuid(tool.id) ? tool.id : uid(),
        user_id: userId,
        name: tool.name,
        owned: tool.owned,
        preset: tool.preset
      }));
      const remoteTools = await sb.from('tools').select('id').eq('user_id', userId);
      if (remoteTools.error) throw remoteTools.error;
      const toolIds = new Set(tools.map((item) => item.id));
      const staleTools = (remoteTools.data || []).map((row) => row.id).filter((id) => !toolIds.has(id));
      if (staleTools.length) {
        result = await sb.from('tools').delete().in('id', staleTools).eq('user_id', userId);
        if (result.error) throw result.error;
      }
      if (tools.length) {
        result = await sb.from('tools').upsert(tools, { onConflict: 'id' });
        if (result.error) throw result.error;
      }

      const logs = Object.entries(state.logs).map(([logDate, log]) => ({
        user_id: userId,
        log_date: logDate,
        completed: log.completed,
        steps: log.steps || [],
        products_used: log.productsUsed || [],
        tools_used: log.toolsUsed || [],
        definition: log.definition,
        frizz: log.frizz,
        notes: log.notes || ''
      }));
      const remoteLogs = await sb.from('schedule_logs').select('log_date').eq('user_id', userId);
      if (remoteLogs.error) throw remoteLogs.error;
      const logDates = new Set(logs.map((item) => item.log_date));
      const staleLogs = (remoteLogs.data || []).map((row) => row.log_date).filter((date) => !logDates.has(date));
      if (staleLogs.length) {
        result = await sb.from('schedule_logs').delete().in('log_date', staleLogs).eq('user_id', userId);
        if (result.error) throw result.error;
      }
      if (logs.length) {
        result = await sb.from('schedule_logs').upsert(logs, { onConflict: 'user_id,log_date' });
        if (result.error) throw result.error;
      }

      setSyncState(true, syncState.session);
      syncState.errorShown = false;
      if (showToast) toast('Datos sincronizados');
    } catch (error) {
      console.warn('Curly Tracker: sincronización no disponible.', error);
      setSyncState(false, syncState.session);
      if (!syncState.errorShown) {
        toast('Sincronización no disponible: datos guardados en este dispositivo');
        syncState.errorShown = true;
      }
    } finally {
      syncState.syncing = false;
    }
  }

  function showApp() {
    $('#loginScreen').classList.add('hidden');
    $('#appShell').classList.remove('hidden');
    $('#appShell').classList.add('lg:grid');
  }

  function showLogin() {
    $('#loginScreen').classList.remove('hidden');
    $('#appShell').classList.add('hidden');
  }

  async function enterWithSession(session) {
    showApp();
    const userId = session && session.user && session.user.id;
    if (lastEnteredUser === userId && syncState.ready) return;
    lastEnteredUser = userId;
    setSyncState(false, session);
    await loadCloud(session);
    renderAll();
  }

  async function initAuth() {
    if (!sb) {
      showLogin();
      $('#authError').textContent = 'Supabase no está disponible ahora. Puedes continuar en modo local.';
      $('#authError').classList.remove('hidden');
      return;
    }
    const { data } = await sb.auth.getSession();
    if (data && data.session) await enterWithSession(data.session);
    else showLogin();

    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        enterWithSession(session);
      } else if (event === 'SIGNED_OUT') {
        syncState.ready = false;
        lastEnteredUser = null;
        showLogin();
        setSyncState(false, null);
      }
    });
  }

  /* ---------------- Notificaciones ---------------- */
  const Notifications = {
    permission() {
      return ('Notification' in window) ? Notification.permission : 'unsupported';
    },
    async register() {
      if (!('serviceWorker' in navigator)) return;
      try {
        await navigator.serviceWorker.register('./sw.js');
        this.postSchedule();
      } catch (error) {
        console.warn('Curly Tracker: service worker no registrado.', error);
      }
    },
    postSchedule() {
      if (!('serviceWorker' in navigator)) return;
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'SET_REMINDER',
            enabled: state.settings.reminderEnabled,
            time: state.settings.reminderTime
          });
        }
      }).catch(() => {});
    },
    async requestPermission() {
      if (this.permission() === 'unsupported') { toast('Este navegador no admite notificaciones'); return; }
      try {
        const permission = await Notification.requestPermission();
        renderReminderSettings();
        if (permission === 'granted') {
          toast('Notificaciones activadas');
          await this.send('Notificaciones activadas', 'Te avisaremos a la hora que configuraste.');
          this.postSchedule();
        } else {
          toast('Permiso no concedido');
        }
      } catch (error) {
        toast('No se pudo solicitar el permiso');
      }
    },
    async send(title, body) {
      if (this.permission() !== 'granted') return;
      const options = { body, icon: './icon.svg', tag: 'curly-tracker', renotify: true };
      try {
        const registration = ('serviceWorker' in navigator) ? await navigator.serviceWorker.ready : null;
        if (registration && registration.showNotification) await registration.showNotification(title, options);
        else new Notification(title, options);
      } catch (error) {
        try { new Notification(title, options); } catch (ignored) { /* sin permiso */ }
      }
    },
    async test() {
      if (this.permission() !== 'granted') { await this.requestPermission(); return; }
      const plan = planForDay(new Date());
      await this.send('Curly Tracker · Prueba', `Hoy tienes ${plan.steps.length} pasos programados con tu inventario.`);
      toast('Notificación de prueba enviada');
    },
    check() {
      if (!state.settings.reminderEnabled || this.permission() !== 'granted') return;
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const key = dateKey(now);
      if (current !== state.settings.reminderTime || state.lastNotified === key) return;
      state.lastNotified = key;
      saveLocal();
      const plan = planForDay(now);
      const body = plan.steps.length
        ? `Hoy: ${plan.steps.length} pasos · ${plan.title}. ${plan.suggestions.length ? plan.suggestions[0] : 'Todo listo con tu inventario.'}`
        : 'Revisa tu inventario para generar la rutina de hoy.';
      this.send('Tu rutina capilar de hoy', body);
    },
    start() {
      this.register();
      this.check();
      setInterval(() => this.check(), 30000);
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) this.check();
      });
    }
  };

  /* ---------------- Eventos ---------------- */
  document.addEventListener('click', (event) => {
    const target = event.target;

    const selectTrigger = target.closest('.select-trigger');
    if (selectTrigger) { toggleSelect(selectTrigger); return; }

    const selectOption = target.closest('.select-option');
    if (selectOption) { chooseSelectOption(selectOption); return; }

    const pickerTrigger = target.closest('.picker-trigger');
    if (pickerTrigger) { togglePicker(pickerTrigger); return; }

    const pickerPart = target.closest('[data-picker-part]');
    if (pickerPart) {
      const wrapper = pickerPart.closest('.custom-picker');
      const input = wrapper && $('input', wrapper);
      if (input) {
        const parts = String(input.value || '08:00').split(':');
        const value = pickerPart.dataset.pickerPart === 'hour'
          ? `${pickerPart.dataset.value}:${parts[1] || '00'}`
          : `${parts[0] || '08'}:${pickerPart.dataset.value}`;
        setPickerValue(input, value, false);
      }
      return;
    }

    const pickerPreset = target.closest('[data-picker-preset]');
    if (pickerPreset) {
      const input = $('input', pickerPreset.closest('.custom-picker'));
      if (input) setPickerValue(input, pickerPreset.dataset.pickerPreset);
      return;
    }

    const pickerNav = target.closest('[data-picker-nav]');
    if (pickerNav) {
      const wrapper = pickerNav.closest('.custom-picker');
      const next = new Date(Number(wrapper.dataset.viewYear), Number(wrapper.dataset.viewMonth) + Number(pickerNav.dataset.pickerNav), 1);
      wrapper.dataset.viewYear = String(next.getFullYear());
      wrapper.dataset.viewMonth = String(next.getMonth());
      renderDatePicker(wrapper, $('input', wrapper));
      return;
    }

    const pickerToday = target.closest('[data-picker-today]');
    if (pickerToday) {
      const input = $('input', pickerToday.closest('.custom-picker'));
      if (input) setPickerValue(input, dateKey());
      return;
    }

    const pickerClear = target.closest('[data-picker-clear]');
    if (pickerClear) {
      const input = $('input', pickerClear.closest('.custom-picker'));
      if (input) setPickerValue(input, '');
      return;
    }

    const pickerDay = target.closest('[data-picker-date]');
    if (pickerDay) {
      const input = $('input', pickerDay.closest('.custom-picker'));
      if (input) setPickerValue(input, pickerDay.dataset.pickerDate);
      return;
    }

    if (!target.closest('.custom-select') && !target.closest('.custom-picker')) closeAllSelects();

    const nav = target.closest('[data-nav]');
    if (nav) { closeModal(); setView(nav.dataset.nav); return; }

    if (target.closest('[data-close-modal]') || target.closest('[data-modal-overlay]') === target.closest('.modal-backdrop')) {
      if (target.closest('[data-close-modal]') || target.classList.contains('modal-backdrop')) closeModal();
    }

    const addProduct = target.closest('[data-add-product]');
    if (addProduct) { openProductModal(null, addProduct.dataset.addProduct); return; }

    const editProduct = target.closest('[data-edit-product]');
    if (editProduct) {
      const product = state.products.find((item) => item.id === editProduct.dataset.editProduct);
      if (product) openProductModal(product, product.category);
      return;
    }

    const deleteProduct = target.closest('[data-delete-product]');
    if (deleteProduct) {
      const product = state.products.find((item) => item.id === deleteProduct.dataset.deleteProduct);
      if (product && confirm(`¿Eliminar "${product.name}" del inventario?`)) {
        state.products = state.products.filter((item) => item.id !== product.id);
        persist(); renderAll(); toast('Producto eliminado');
      }
      return;
    }

    const cycleStatus = target.closest('[data-cycle-status]');
    if (cycleStatus) {
      state.products = state.products.map((product) => {
        if (product.id !== cycleStatus.dataset.cycleStatus) return product;
        const index = STATUSES.indexOf(product.status);
        return Object.assign({}, product, { status: STATUSES[(index + 1) % STATUSES.length] });
      });
      persist(); renderAll();
      return;
    }

    const category = target.closest('[data-category]');
    if (category) { currentCategory = category.dataset.category; renderInventory(); return; }

    const toggleTool = target.closest('[data-toggle-tool]');
    if (toggleTool) {
      state.tools = state.tools.map((tool) => tool.id === toggleTool.dataset.toggleTool ? Object.assign({}, tool, { owned: !tool.owned }) : tool);
      persist(); renderAll();
      return;
    }

    const deleteTool = target.closest('[data-delete-tool]');
    if (deleteTool) {
      const tool = state.tools.find((item) => item.id === deleteTool.dataset.deleteTool);
      if (tool && confirm(`¿Eliminar "${tool.name}"?`)) {
        state.tools = state.tools.filter((item) => item.id !== tool.id);
        persist(); renderAll(); toast('Herramienta eliminada');
      }
      return;
    }

    const openLog = target.closest('[data-open-log]');
    if (openLog) { openLogModal(openLog.dataset.openLog); return; }

    const toggleDay = target.closest('[data-toggle-day]');
    if (toggleDay) {
      expandedDay = expandedDay === toggleDay.dataset.toggleDay ? '' : toggleDay.dataset.toggleDay;
      renderRoutine();
      return;
    }

    const jumpDay = target.closest('[data-jump-day]');
    if (jumpDay) {
      expandedDay = jumpDay.dataset.jumpDay;
      renderRoutine();
      const node = $('#day-' + expandedDay);
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const removeIngredient = target.closest('[data-remove-ingredient]');
    if (removeIngredient) {
      modalIngredients.splice(Number(removeIngredient.dataset.removeIngredient), 1);
      renderIngredientTags();
      return;
    }

    const suggest = target.closest('[data-suggest-ingredient]');
    if (suggest) { addIngredient(suggest.dataset.suggestIngredient); return; }

    const rate = target.closest('[data-rate]');
    if (rate) { /* manejado dentro del modal */ return; }
  });

  document.addEventListener('keydown', (event) => {
    const openTrigger = $('.select-trigger[data-open="true"]') || $('.picker-trigger[data-open="true"]');
    if (openTrigger) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAllSelects();
        openTrigger.focus();
        return;
      }
      if (openTrigger.classList.contains('select-trigger')) {
        const menu = openTrigger.nextElementSibling;
        const options = (menu && menu.classList.contains('select-menu')) ? $$('.select-option', menu) : [];
        const focusedIndex = options.findIndex((option) => option.dataset.focused === 'true');

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!options.length) return;
          const next = event.key === 'ArrowDown'
            ? (focusedIndex + 1) % options.length
            : (focusedIndex <= 0 ? options.length - 1 : focusedIndex - 1);
          options.forEach((option, index) => { option.dataset.focused = String(index === next); });
          options[next].scrollIntoView({ block: 'nearest' });
          return;
        }
        if ((event.key === 'Enter' || event.key === ' ') && focusedIndex >= 0) {
          event.preventDefault();
          chooseSelectOption(options[focusedIndex]);
          return;
        }
      }
      return;
    }
    if (event.key === 'Escape' && $('#modalRoot').innerHTML) closeModal();
  });

  function init() {
    ['loginMark', 'sideMark', 'topMark'].forEach((id) => { const node = $('#' + id); if (node) node.innerHTML = curlMark('h-6 w-6'); });
    initSelects();
    initPickers();
    renderNav();
    renderAll();

    $('#addProductBtn').addEventListener('click', () => openProductModal(null, currentCategory));
    $('#addToolBtn').addEventListener('click', openToolModal);
    $('#openLogBtn').addEventListener('click', () => openLogModal(dateKey()));

    $('#saveProfileBtn').addEventListener('click', () => {
      state.profile = {
        curl_pattern: $('#profilePattern').value,
        porosity: $('#profilePorosity').value,
        thickness: $('#profileThickness').value,
        goal: $('#profileGoal').value
      };
      persist(); renderAll(); toast('Perfil guardado · horario recalculado');
    });

    $('#saveNotifBtn').addEventListener('click', () => {
      const time = $('#reminderTime').value;
      if (!/^\d{2}:\d{2}$/.test(time)) { toast('Selecciona una hora válida'); return; }
      state.settings.reminderTime = time;
      persist();
      renderReminderSettings();
      Notifications.postSchedule();
      toast('Recordatorio guardado');
    });

    $('#reminderToggle').addEventListener('click', (event) => {
      const button = event.target.closest('[data-value]');
      if (!button) return;
      state.settings.reminderEnabled = button.dataset.value === 'on';
      persist();
      renderReminderSettings();
      Notifications.postSchedule();
    });

    $('#askPermissionBtn').addEventListener('click', () => Notifications.requestPermission());
    $('#testNotifBtn').addEventListener('click', () => Notifications.test());

    $('#forceSyncBtn').addEventListener('click', () => {
      if (!syncState.session) { toast('Inicia sesión para sincronizar'); return; }
      if (!syncState.ready) { loadCloud(syncState.session).then(() => pushCloud(true)); return; }
      pushCloud(true);
    });

    $('#signOutBtn').addEventListener('click', async () => {
      if (sb) await sb.auth.signOut();
      syncState.ready = false;
      lastEnteredUser = null;
      showLogin();
      setSyncState(false, null);
      toast('Sesión cerrada');
    });
    $('#sideSignOut').addEventListener('click', () => $('#signOutBtn').click());

    $('#exportBtn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `curly-tracker-${dateKey()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast('Copia JSON exportada');
    });

    $('#resetLocalBtn').addEventListener('click', () => {
      if (!confirm('¿Borrar todos los datos guardados en este dispositivo? Esta acción no se puede deshacer.')) return;
      localStorage.removeItem(LS_KEY);
      state = defaultState();
      currentCategory = CATEGORIES[0];
      persist(); renderAll();
      toast('Datos locales borrados');
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('#addIngredientBtn')) addIngredient($('#ingredientInput').value);
      if (event.target.id === 'ingredientInput' && event.target.dataset.bound !== 'true') {
        event.target.dataset.bound = 'true';
        event.target.addEventListener('keydown', (keyEvent) => {
          if (keyEvent.key === 'Enter' || keyEvent.key === ',') {
            keyEvent.preventDefault();
            addIngredient($('#ingredientInput').value);
            $('#ingredientInput').value = '';
          }
        });
      }
    });

    $('#authToggle').addEventListener('click', () => {
      authMode = authMode === 'login' ? 'signup' : 'login';
      const signup = authMode === 'signup';
      $('#authTitle').textContent = signup ? 'Crear cuenta' : 'Bienvenido de nuevo';
      $('#authSubtitle').textContent = signup ? 'Sincroniza tu rutina entre todos tus dispositivos.' : 'Entra para sincronizar tu perfil, inventario y rutina.';
      $('#authSubmit').textContent = signup ? 'Crear cuenta' : 'Entrar';
      $('#authToggle').textContent = signup ? '¿Ya tienes cuenta? Entrar' : '¿No tienes cuenta? Crear cuenta';
      $('#authPassword').autocomplete = signup ? 'new-password' : 'current-password';
      $('#authError').classList.add('hidden');
    });

    $('#authForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorBox = $('#authError');
      errorBox.classList.add('hidden');
      if (!sb) { errorBox.textContent = 'Supabase no está disponible. Usa el modo local.'; errorBox.classList.remove('hidden'); return; }
      const email = $('#authEmail').value.trim();
      const password = $('#authPassword').value;
      if (!email || password.length < 6) {
        errorBox.textContent = 'Introduce un email válido y una contraseña de al menos 6 caracteres.';
        errorBox.classList.remove('hidden');
        return;
      }
      const submit = $('#authSubmit');
      submit.disabled = true;
      submit.textContent = 'Un momento…';
      try {
        if (authMode === 'signup') {
          const { data, error } = await sb.auth.signUp({ email, password });
          if (error) throw error;
          if (data && data.session) {
            await enterWithSession(data.session);
          } else {
            errorBox.textContent = 'Cuenta creada. Revisa tu email para confirmarla y vuelve a entrar.';
            errorBox.classList.remove('hidden');
          }
        } else {
          const { data, error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw error;
          await enterWithSession(data.session);
        }
      } catch (error) {
        errorBox.textContent = error && error.message ? error.message : 'No se pudo completar la acción.';
        errorBox.classList.remove('hidden');
      } finally {
        submit.disabled = false;
        submit.textContent = authMode === 'signup' ? 'Crear cuenta' : 'Entrar';
      }
    });

    $('#localModeBtn').addEventListener('click', () => {
      lastEnteredUser = null;
      showApp();
      setSyncState(false, null);
      setView('hoy');
      toast('Modo local activado · tus datos se guardan en este dispositivo');
    });

    $('#googleBtn').addEventListener('click', async () => {
      if (!sb) { toast('Supabase no está disponible'); return; }
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) toast(error.message || 'No se pudo iniciar con Google');
    });

    const requestedView = new URLSearchParams(window.location.search).get('view');
    if (requestedView && VIEW_LABELS[requestedView]) setView(requestedView);
    else setView('hoy');

    Notifications.start();
    initAuth();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
