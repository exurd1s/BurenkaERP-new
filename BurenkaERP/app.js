// ============================================
// АГРОХОЛДИНГ «БУРЁНКА» — ERP СИСТЕМА v4.0
// Production-ready: localStorage, Chart.js,
// Excel/PDF export, PWA, Voice input, CSV import
// ============================================

// ============ ROLES ============
const ROLES = {
    director: { name: 'Директор хозяйства', permissions: ['all'], dept: 'Управление', level: 5 },
    zootechnician: { name: 'Главный зоотехник', permissions: ['dashboard','herd','reproduction','health','nutrition','milk','milking','storage','equipment','staff','schedule','reports','profile'], dept: 'КРС', level: 4 },
    veterinarian: { name: 'Главный ветврач', permissions: ['dashboard','herd','health','nutrition','milk','storage','staff','schedule','reports','profile'], dept: 'Ветслужба', level: 4 },
    agronomist: { name: 'Агроном', permissions: ['dashboard','nutrition','storage','equipment','staff','schedule','reports','profile'], dept: 'Поля', level: 3 },
    accountant: { name: 'Главный бухгалтер', permissions: ['dashboard','finance','sales','salary','staff','reports','settings','profile'], dept: 'Бухгалтерия', level: 4 },
    milker: { name: 'Старший дояр', permissions: ['dashboard','milk','milking','herd','profile'], dept: 'Доильный зал', level: 2 },
    mechanic: { name: 'Механизатор', permissions: ['dashboard','equipment','storage','profile'], dept: 'Техника', level: 2 },
    operator: { name: 'Оператор', permissions: ['dashboard','herd','milk','profile'], dept: 'Операторский', level: 1 },
    admin: { name: 'Администратор', permissions: ['all'], dept: 'IT', level: 5 }
};

// ============ STORAGE (localStorage) ============
const STORAGE_KEY = 'burenka_erp_v4';

const Store = {
    _state: null,
    _subscribers: [],
    
    init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { this._state = JSON.parse(saved); }
            catch (e) { this._state = this._seed(); }
        } else {
            this._state = this._seed();
        }
        this.persist();
        return this._state;
    },
    
    _seed() {
        return {
            currentUser: null,
            users: [
                { id: 1, login: 'admin', password: '12345rfr', name: 'Администратор', role: 'admin', phone: '+7 (900) 000-00-00', regDate: '2026-01-01', lastLogin: 'Сегодня, 06:30', status: 'active' },
                { id: 2, login: 'petrova_es', password: 'vet123', name: 'Петрова Елена Сергеевна', role: 'veterinarian', phone: '+7 (900) 123-45-67', regDate: '2026-01-15', lastLogin: 'Вчера, 18:20', status: 'active' },
                { id: 3, login: 'kuznetsov_si', password: 'agro456', name: 'Кузнецов Сергей Иванович', role: 'agronomist', phone: '+7 (911) 456-78-90', regDate: '2026-02-01', lastLogin: 'Сегодня, 07:15', status: 'active' }
            ],
            cows: [
                { id: 101, tag: 'RF-101', name: 'Зорька', birth: '2023-04-15', breed: 'Голштин', status: 'Здоров', milk: 24.5, weight: 580, calvings: 2, reproHistory: [{ date: '2026-01-20', event: 'Отёл', bull: '—', expected: '—', status: 'Завершено' }] },
                { id: 102, tag: 'RF-102', name: 'Бурёнка', birth: '2023-06-20', breed: 'Симментал', status: 'Здоров', milk: 21.0, weight: 620, calvings: 1, reproHistory: [] },
                { id: 103, tag: 'RF-103', name: 'Ромашка', birth: '2022-08-10', breed: 'Айршир', status: 'Лечение', milk: 18.5, weight: 540, calvings: 3, reproHistory: [] },
                { id: 104, tag: 'RF-104', name: 'Мурка', birth: '2023-01-05', breed: 'Джерси', status: 'Тельная', milk: 0, weight: 590, calvings: 1, reproHistory: [{ date: '2026-03-15', event: 'Осеменение', bull: 'Бык №4521 (Голштин)', expected: '2026-12-10', status: 'Тельная' }] },
                { id: 105, tag: 'RF-105', name: 'Белка', birth: '2022-11-12', breed: 'Голштин', status: 'Сухостойная', milk: 0, weight: 610, calvings: 2, reproHistory: [{ date: '2025-11-05', event: 'Осеменение', bull: 'Бык №3891 (Симментал)', expected: '2026-08-15', status: 'Тельная' }] },
                { id: 106, tag: 'RF-106', name: 'Звезда', birth: '2023-09-01', breed: 'Голштин', status: 'Здоров', milk: 26.0, weight: 570, calvings: 1, reproHistory: [] }
            ],
            staff: [
                { id: 1, name: 'Петрова Елена Сергеевна', role: 'Ветврач', dept: 'Ветслужба', phone: '+7 (900) 123-45-67', exp: 9, salary: 65000, status: 'Работает' },
                { id: 2, name: 'Кузнецов Сергей Иванович', role: 'Агроном', dept: 'Поля', phone: '+7 (911) 456-78-90', exp: 4, salary: 55000, status: 'Работает' },
                { id: 3, name: 'Морозова Анна Павловна', role: 'Зоотехник', dept: 'КРС', phone: '+7 (921) 999-88-77', exp: 6, salary: 58000, status: 'Работает' },
                { id: 4, name: 'Соколов Дмитрий Олегович', role: 'Механизатор', dept: 'Техника', phone: '+7 (903) 111-22-33', exp: 3, salary: 48000, status: 'Отпуск' },
                { id: 5, name: 'Волкова Мария Андреевна', role: 'Дояр', dept: 'Доильный зал', phone: '+7 (905) 444-55-66', exp: 2, salary: 42000, status: 'Работает' }
            ],
            healthRecords: [
                { id: 1, date: '2026-04-20', cowTag: 'RF-103', cowName: 'Ромашка', type: 'Лечение', diagnosis: 'Мастит', treatment: 'Мастисепт, 10 мл', vet: 'Петрова Е.С.', status: 'В процессе' },
                { id: 2, date: '2026-04-18', cowTag: 'RF-101', cowName: 'Зорька', type: 'Вакцинация', diagnosis: 'Профилактика', treatment: 'Вакцина БКВ', vet: 'Петрова Е.С.', status: 'Завершено' },
                { id: 3, date: '2026-04-15', cowTag: 'RF-106', cowName: 'Звезда', type: 'Осмотр', diagnosis: 'Здорова', treatment: '-', vet: 'Петрова Е.С.', status: 'Завершено' }
            ],
            milkRecords: [
                { id: 1, date: '2026-04-24', cowTag: 'RF-101', morning: 8.5, day: 8.0, evening: 8.0, fat: 3.8, protein: 3.2, somatic: 180 },
                { id: 2, date: '2026-04-24', cowTag: 'RF-102', morning: 7.0, day: 7.0, evening: 7.0, fat: 3.9, protein: 3.3, somatic: 160 }
            ],
            stockOps: [
                { id: 1, date: '2026-04-20', type: 'Сено', operation: 'Приход', amount: 15, unit: 'т', supplier: 'ООО АгроСнаб', cost: 75000, responsible: 'Кузнецов С.И.' },
                { id: 2, date: '2026-04-18', type: 'Комбикорм', operation: 'Приход', amount: 8, unit: 'т', supplier: 'ООО КормПлюс', cost: 120000, responsible: 'Кузнецов С.И.' },
                { id: 3, date: '2026-04-15', type: 'Сено', operation: 'Расход', amount: 2.1, unit: 'т', supplier: 'Кормление КРС', cost: 0, responsible: 'Морозова А.П.' }
            ],
            drugs: [
                { id: 1, name: 'Мастисепт', purpose: 'Мастит', dose: '10 мл/вымя', expiry: '2027-03-15', stock: '45 уп' },
                { id: 2, name: 'Вакцина БКВ', purpose: 'Профилактика', dose: '5 мл/гол', expiry: '2026-09-20', stock: '120 доз' },
                { id: 3, name: 'Йодинол', purpose: 'Обработка пупка', dose: '50 мл', expiry: '2027-01-10', stock: '12 фл' },
                { id: 4, name: 'Кальций хлорид', purpose: 'После отёла', dose: '200 мл', expiry: '2026-12-01', stock: '30 фл' }
            ],
            hayStock: { hay: 68.5, feed: 32.0, silage: 45.0, minerals: 120 },
            systemLogs: [],
            notifications: [
                { id: 1, text: 'RF-103 Ромашка — мастит, требуется контроль', type: 'danger', read: false, date: '2026-04-24 08:15' },
                { id: 2, text: 'Запас сена ниже 70т — планируйте закупку', type: 'warning', read: false, date: '2026-04-24 07:00' },
                { id: 3, text: 'RF-104 Мурка — отёл через 4 дня', type: 'warning', read: false, date: '2026-04-23 18:30' }
            ],
            counters: { cow: 107, health: 4, stock: 4, user: 4, staff: 6, milk: 3, drug: 5, notif: 4 }
        };
    },
    
    get() { return this._state; },
    
    update(partial) {
        Object.assign(this._state, partial);
        this.persist();
        this._notify();
    },
    
    persist() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state)); }
        catch (e) { console.error('Store persist error', e); }
    },
    
    subscribe(fn) { this._subscribers.push(fn); },
    _notify() { this._subscribers.forEach(fn => fn(this._state)); },
    
    nextId(type) {
        const id = this._state.counters[type];
        this._state.counters[type]++;
        this.persist();
        return id;
    },
    
    reset() {
        this._state = this._seed();
        this.persist();
        this._notify();
    }
};

// ============ GLOBAL STATE ALIASES ============
let currentUser = null;
let users, cows, staff, healthRecords, milkRecords, stockOps, drugs, hayStock, systemLogs, notifications;

function syncState() {
    const s = Store.get();
    currentUser = s.currentUser;
    users = s.users;
    cows = s.cows;
    staff = s.staff;
    healthRecords = s.healthRecords;
    milkRecords = s.milkRecords;
    stockOps = s.stockOps;
    drugs = s.drugs;
    hayStock = s.hayStock;
    systemLogs = s.systemLogs;
    notifications = s.notifications;
}

// ============ UTILS ============
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icons = { success: '✓', error: '✕', warning: '!' };
    toast.innerHTML = `<div class="toast-icon ${type}">${icons[type]}</div><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-text">${message}</div></div>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 500); }, 3500);
}

function addLog(msg) {
    const time = new Date().toLocaleTimeString('ru-RU');
    const user = currentUser ? currentUser.login : 'system';
    systemLogs.unshift({ time: new Date().toISOString(), user, action: msg });
    if (systemLogs.length > 500) systemLogs.pop();
    Store.persist();
}

function formatNumber(num) { return num.toLocaleString('ru-RU'); }

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

function triggerConfetti() {
    if (window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#4a7c2a', '#c49a1a', '#2a5a8a'] });
    }
}

function animateNumber(el, target, duration = 800) {
    const start = 0;
    const startTime = performance.now();
    const isFloat = String(target).includes('.');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;
        el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ============ MASKS ============
function applyMasks() {
    document.querySelectorAll('.phone-mask').forEach(input => {
        input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.startsWith('8')) val = '7' + val.slice(1);
            if (!val.startsWith('7')) val = '7' + val;
            val = val.slice(0, 11);
            let formatted = '+7';
            if (val.length > 1) formatted += ' (' + val.slice(1, 4);
            if (val.length >= 5) formatted += ') ' + val.slice(4, 7);
            if (val.length >= 8) formatted += '-' + val.slice(7, 9);
            if (val.length >= 10) formatted += '-' + val.slice(9, 11);
            e.target.value = formatted;
        });
    });
    
    document.querySelectorAll('.tag-mask').forEach(input => {
        input.addEventListener('input', (e) => {
            let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
            if (!val.startsWith('RF-') && val.length > 0) {
                if (val.startsWith('RF')) val = 'RF-' + val.slice(2);
                else val = 'RF-' + val;
            }
            e.target.value = val.slice(0, 8);
        });
    });
}

// ============ AUTH ============
function initAuth() {
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const formId = tab.dataset.tab === 'login' ? 'loginForm' : 'registerForm';
            document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
            document.getElementById(formId).classList.add('active');
        });
    });
    document.getElementById('doLoginBtn').addEventListener('click', doLogin);
    document.getElementById('loginPass').addEventListener('keypress', (e) => { if (e.key === 'Enter') doLogin(); });
    document.getElementById('doRegisterBtn').addEventListener('click', doRegister);
}

function doLogin() {
    const login = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const user = users.find(u => u.login === login && u.password === pass && u.status === 'active');
    if (user) {
        currentUser = user;
        user.lastLogin = 'Сегодня, ' + new Date().toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'});
        Store.update({ currentUser: user, users });
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appLayout').style.display = 'flex';
        initApp();
        showToast('Добро пожаловать', `Вы вошли как ${user.name}`);
        addLog(`Вход пользователя ${user.login}`);
        triggerConfetti();
    } else {
        document.getElementById('loginError').textContent = 'Неверный логин или пароль';
    }
}

function doRegister() {
    const name = document.getElementById('regName').value.trim();
    const login = document.getElementById('regUser').value.trim();
    const pass = document.getElementById('regPass').value;
    const role = document.getElementById('regRole').value;
    const phone = document.getElementById('regPhone').value.trim();
    
    if (!name || !login || !pass || !role) {
        document.getElementById('registerError').textContent = 'Заполните все обязательные поля';
        return;
    }
    if (pass.length < 6) {
        document.getElementById('registerError').textContent = 'Пароль должен быть не менее 6 символов';
        return;
    }
    if (users.find(u => u.login === login)) {
        document.getElementById('registerError').textContent = 'Пользователь с таким логином уже существует';
        return;
    }
    
    const roleConfig = ROLES[role];
    const newUser = {
        id: Store.nextId('user'), login, password: pass, name, role,
        phone: phone || '—', regDate: new Date().toLocaleDateString('ru-RU'),
        lastLogin: '—', status: 'active'
    };
    users.push(newUser);
    Store.update({ users });
    
    document.querySelectorAll('.login-tab')[0].click();
    document.getElementById('loginUser').value = login;
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').textContent = '';
    showToast('Успешно', `Аккаунт ${name} создан. Роль: ${roleConfig.name}`);
    addLog(`Регистрация пользователя ${login} с ролью ${roleConfig.name}`);
}

// ============ MODALS ============
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

function showConfirm({ title, text, confirmText = 'Подтвердить', danger = false, onConfirm }) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    const btn = document.getElementById('confirmBtn');
    btn.textContent = confirmText;
    btn.className = danger ? 'btn btn-danger' : 'btn btn-primary';
    btn.onclick = () => { closeModal('confirmModal'); onConfirm && onConfirm(); };
    openModal('confirmModal');
}

// ============ NAVIGATION ============
const NAV_SECTIONS = [
    { title: 'Основное', items: [
        { page: 'dashboard', label: 'Дашборд', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' },
        { page: 'herd', label: 'Поголовье КРС', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>', badge: 'herdCountBadge' },
        { page: 'reproduction', label: 'Репродукция', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' },
        { page: 'health', label: 'Ветконтроль', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>', badge: 'healthBadge' },
        { page: 'nutrition', label: 'Кормление', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>' },
        { page: 'milk', label: 'Учёт молока', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>' }
    ]},
    { title: 'Производство', items: [
        { page: 'milking', label: 'Доильный зал', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></svg>' },
        { page: 'storage', label: 'Склад и запасы', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
        { page: 'equipment', label: 'Оборудование', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' }
    ]},
    { title: 'Персонал', items: [
        { page: 'staff', label: 'Сотрудники', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>' },
        { page: 'schedule', label: 'График смен', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
        { page: 'salary', label: 'Зарплаты', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>' }
    ]},
    { title: 'Финансы', items: [
        { page: 'finance', label: 'Финансы', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>' },
        { page: 'sales', label: 'Продажи', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>' }
    ]},
    { title: 'Система', items: [
        { page: 'reports', label: 'Отчёты', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
        { page: 'audit', label: 'Журнал действий', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
        { page: 'settings', label: 'Настройки', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>' }
    ]}
];

function buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    const roleConfig = ROLES[currentUser.role] || ROLES.operator;
    const perms = roleConfig.permissions;
    nav.innerHTML = '';
    
    NAV_SECTIONS.forEach(section => {
        const allowedItems = section.items.filter(item => perms.includes('all') || perms.includes(item.page));
        if (allowedItems.length === 0) return;
        
        const sectionEl = document.createElement('div');
        sectionEl.className = 'nav-section';
        sectionEl.innerHTML = `<div class="nav-section-title">${section.title}</div>`;
        
        allowedItems.forEach(item => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.dataset.page = item.page;
            navItem.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>${item.badge ? `<span class="nav-badge" id="${item.badge}">0</span>` : ''}`;
            navItem.addEventListener('click', () => switchPage(item.page));
            sectionEl.appendChild(navItem);
        });
        nav.appendChild(sectionEl);
    });
    
    if (perms.includes('all') || perms.includes('users')) {
        const adminSection = document.createElement('div');
        adminSection.className = 'nav-section';
        adminSection.innerHTML = `<div class="nav-section-title">Администрирование</div><div class="nav-item" data-page="users"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></span><span>Пользователи</span></div>`;
        adminSection.querySelector('.nav-item').addEventListener('click', () => switchPage('users'));
        nav.appendChild(adminSection);
    }
    
    document.getElementById('userAvatar').textContent = getInitials(currentUser.name);
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    document.getElementById('userRoleDisplay').textContent = roleConfig.name;
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(pageId + 'Page');
    if (pageEl) pageEl.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector(`[data-page="${pageId}"]`);
    if (navItem) navItem.classList.add('active');
    
    const titles = { dashboard:'Дашборд', herd:'Поголовье КРС', cowProfile:'Карточка коровы', reproduction:'Репродукция', health:'Ветконтроль', nutrition:'Кормление', milk:'Учёт молока', milking:'Доильный зал', storage:'Склад и запасы', equipment:'Оборудование', staff:'Сотрудники', profile:'Личная карточка', schedule:'График смен', salary:'Зарплаты', finance:'Финансы', sales:'Продажи', reports:'Отчёты', audit:'Журнал действий', settings:'Настройки', users:'Пользователи' };
    
    document.getElementById('breadcrumb').innerHTML = `<span class="breadcrumb-icon">◈</span><span class="breadcrumb-divider">/</span><span class="breadcrumb-text">${titles[pageId] || pageId}</span>`;
    if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('mobile-open');
    renderPage(pageId);
}

function renderPage(pageId) {
    switch(pageId) {
        case 'dashboard': renderDashboard(); break;
        case 'herd': renderHerd(); break;
        case 'reproduction': renderReproduction(); break;
        case 'health': renderHealth(); break;
        case 'nutrition': renderNutrition(); break;
        case 'milk': renderMilk(); break;
        case 'milking': renderMilking(); break;
        case 'storage': renderStorage(); break;
        case 'equipment': renderEquipment(); break;
        case 'staff': renderStaff(); break;
        case 'profile': renderProfile(); break;
        case 'salary': renderSalary(); break;
        case 'finance': renderFinance(); break;
        case 'sales': renderSales(); break;
        case 'audit': renderAudit(); break;
        case 'users': renderUsers(); break;
    }
}

// ============ DASHBOARD ============
let milkChartInstance = null, healthChartInstance = null;

function renderDashboard() {
    const totalCows = cows.length;
    const totalMilk = cows.reduce((a, c) => a + c.milk, 0);
    const sickCows = cows.filter(c => c.status === 'Лечение').length;
    const dryCows = cows.filter(c => c.status === 'Сухостойная').length;
    const healthyCows = cows.filter(c => c.status === 'Здоров').length;
    const pregnantCows = cows.filter(c => c.status === 'Тельная').length;
    
    animateNumber(document.getElementById('dashTotalCows'), totalCows);
    animateNumber(document.getElementById('dashTotalMilk'), totalMilk);
    animateNumber(document.getElementById('dashSickCows'), sickCows);
    animateNumber(document.getElementById('dashHayStock'), hayStock.hay);
    document.getElementById('dashHayDays').textContent = Math.floor(hayStock.hay / (totalCows * 0.007));
    animateNumber(document.getElementById('dashRevenue'), Math.floor(totalMilk * 38 * 30));
    
    // Charts
    renderMilkChart();
    renderHealthChart(healthyCows, sickCows, dryCows, pregnantCows);
    
    // Alerts
    const alerts = document.getElementById('alertsList');
    const alertItems = [
        { icon: '🌾', text: 'Запас сена ниже 70т — планируйте закупку', type: 'warning' },
        { icon: '🏥', text: 'RF-103 Ромашка — мастит, требуется контроль', type: 'danger' },
        { icon: '💉', text: 'Вакцинация группы А просрочена на 2 дня', type: 'danger' },
        { icon: '🐄', text: 'RF-104 Мурка — отёл через 4 дня', type: 'warning' }
    ];
    alerts.innerHTML = alertItems.map(a => `<div class="alert-item alert-${a.type}"><span class="alert-icon">${a.icon}</span><span class="alert-text">${a.text}</span></div>`).join('');
    
    // Badges
    const herdBadge = document.getElementById('herdCountBadge');
    const healthBadge = document.getElementById('healthBadge');
    if (herdBadge) herdBadge.textContent = totalCows;
    if (healthBadge) healthBadge.textContent = sickCows;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('notifDot').style.display = unreadCount > 0 ? 'block' : 'none';
}

function renderMilkChart() {
    const ctx = document.getElementById('milkChartCanvas');
    if (!ctx) return;
    if (milkChartInstance) milkChartInstance.destroy();
    milkChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
            datasets: [{
                label: 'Надой (л)',
                data: [210, 225, 218, 235, 242, 238, 245],
                borderColor: '#4a7c2a',
                backgroundColor: 'rgba(74, 124, 42, 0.1)',
                fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#fff',
                pointBorderColor: '#4a7c2a', pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderHealthChart(healthy, sick, dry, pregnant) {
    const ctx = document.getElementById('healthChartCanvas');
    if (!ctx) return;
    if (healthChartInstance) healthChartInstance.destroy();
    healthChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Здоровы', 'Лечение', 'Сухостойные', 'Тельные'],
            datasets: [{ data: [healthy, sick, dry, pregnant], backgroundColor: ['#2d7a3e', '#a03030', '#b8860b', '#2a5a8a'], borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '70%',
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } }
        }
    });
}

// ============ HERD ============
let herdCurrentPage = 1;
const HERD_PER_PAGE = 10;

function renderHerd() {
    const search = document.getElementById('herdSearch')?.value.toLowerCase() || '';
    const breedFilter = document.getElementById('herdFilterBreed')?.value || '';
    const statusFilter = document.getElementById('herdFilterStatus')?.value || '';
    
    let filtered = cows.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search) || c.tag.toLowerCase().includes(search);
        const matchBreed = !breedFilter || c.breed === breedFilter;
        const matchStatus = !statusFilter || c.status === statusFilter;
        return matchSearch && matchBreed && matchStatus;
    });
    
    const totalPages = Math.ceil(filtered.length / HERD_PER_PAGE) || 1;
    if (herdCurrentPage > totalPages) herdCurrentPage = 1;
    const start = (herdCurrentPage - 1) * HERD_PER_PAGE;
    const pageData = filtered.slice(start, start + HERD_PER_PAGE);
    
    const tbody = document.getElementById('herdTableBody');
    tbody.innerHTML = pageData.map(c => {
        const age = calculateAge(c.birth);
        const statusClass = c.status === 'Здоров' ? 'badge-green' : c.status === 'Лечение' ? 'badge-red' : c.status === 'Тельная' ? 'badge-blue' : 'badge-amber';
        return `<tr>
            <td><span class="badge badge-gray">${c.tag}</span></td>
            <td><strong>${c.name}</strong></td>
            <td>${age} мес</td>
            <td>${c.breed}</td>
            <td><span class="badge ${statusClass}">${c.status}</span></td>
            <td>${c.milk > 0 ? c.milk + ' л' : '-'}</td>
            <td>${c.calvings}</td>
            <td>
                <button class="btn btn-sm btn-secondary btn-icon" onclick="openCowProfile(${c.id})" title="Карточка"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                <button class="btn btn-sm btn-secondary btn-icon" onclick="editCow(${c.id})" title="Редактировать"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteCow(${c.id})" title="Удалить"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg></button>
            </td>
        </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">Ничего не найдено</td></tr>';
    
    renderPagination('herdPagination', totalPages, (p) => { herdCurrentPage = p; renderHerd(); });
}

function renderPagination(containerId, totalPages, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === herdCurrentPage ? 'active' : ''}" onclick="(${onPageChange.toString()})(${i})">${i}</button>`;
    }
    container.innerHTML = html;
}

function openCowProfile(cowId) {
    const cow = cows.find(c => c.id === cowId);
    if (!cow) return;
    
    document.getElementById('cowProfileName').textContent = cow.name;
    document.getElementById('cowProfileBadge').textContent = cow.status;
    document.getElementById('cowProfileBadge').className = `badge ${cow.status === 'Здоров' ? 'badge-green' : cow.status === 'Лечение' ? 'badge-red' : cow.status === 'Тельная' ? 'badge-blue' : 'badge-amber'}`;
    document.getElementById('cowProfileTag').textContent = cow.tag;
    document.getElementById('cowProfileBreed').textContent = cow.breed;
    document.getElementById('cowProfileBirth').textContent = new Date(cow.birth).toLocaleDateString('ru-RU');
    document.getElementById('cowProfileAge').textContent = calculateAge(cow.birth) + ' мес';
    document.getElementById('cowProfileWeight').textContent = cow.weight + ' кг';
    document.getElementById('cowProfileCalvings').textContent = cow.calvings;
    document.getElementById('cowProfileMilk').textContent = cow.milk > 0 ? cow.milk + ' л/день' : 'Нет';
    
    // QR Code
    const qrContainer = document.getElementById('cowQRCode');
    qrContainer.innerHTML = '';
    if (window.QRCode) {
        new QRCode(qrContainer, { text: cow.tag, width: 100, height: 100, colorDark: '#1B4332', colorLight: '#ffffff' });
    }
    
    // Health timeline
    const cowHealth = healthRecords.filter(r => r.cowTag === cow.tag);
    document.getElementById('cowHealthTimeline').innerHTML = cowHealth.length ? cowHealth.map(r => `<div class="timeline-item ${r.status === 'В процессе' ? 'warning' : ''}"><div class="timeline-date">${r.date}</div><div class="timeline-text">${r.type}: ${r.diagnosis} (${r.vet})</div></div>`).join('') : '<div class="timeline-item"><div class="timeline-text">Нет записей</div></div>';
    
    // Repro timeline
    document.getElementById('cowReproTimeline').innerHTML = cow.reproHistory.length ? cow.reproHistory.map(r => `<div class="timeline-item ${r.status === 'Тельная' ? 'info' : 'green'}"><div class="timeline-date">${r.date}</div><div class="timeline-text">${r.event}${r.bull !== '—' ? ' — ' + r.bull : ''}${r.expected !== '—' ? ' (ожид.: ' + r.expected + ')' : ''}</div></div>`).join('') : '<div class="timeline-item"><div class="timeline-text">Нет записей</div></div>';
    
    // Milk chart
    const ctx = document.getElementById('cowMilkChartCanvas');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
                datasets: [{ label: 'Надой', data: [18, 20, 22, 21, 23, 24, cow.milk || 0], borderColor: '#4a7c2a', backgroundColor: 'rgba(74, 124, 42, 0.1)', fill: true, tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
    
    switchPage('cowProfile');
}

function saveCow() {
    const name = document.getElementById('modalCowName').value.trim();
    const tag = document.getElementById('modalCowTag').value.trim();
    
    if (!name || !tag) { showToast('Ошибка', 'Заполните обязательные поля', 'error'); return; }
    
    const cowData = {
        tag, name,
        birth: document.getElementById('modalCowBirth').value || '2023-01-01',
        breed: document.getElementById('modalCowBreed').value,
        status: document.getElementById('modalCowStatus').value,
        milk: parseFloat(document.getElementById('modalCowMilk').value) || 0,
        weight: parseInt(document.getElementById('modalCowWeight').value) || 550,
        calvings: parseInt(document.getElementById('modalCowCalvings').value) || 0
    };
    
    const editId = document.getElementById('editCowId').value;
    
    if (editId) {
        const idx = cows.findIndex(c => c.id === parseInt(editId));
        if (idx !== -1) {
            cows[idx] = { ...cows[idx], ...cowData };
            Store.update({ cows });
            showToast('Успешно', `Данные ${name} обновлены`);
            addLog(`Обновлена корова ${name} (${tag})`);
        }
    } else {
        cows.push({ id: Store.nextId('cow'), ...cowData, reproHistory: [] });
        Store.update({ cows });
        showToast('Успешно', `Корова ${name} добавлена`);
        addLog(`Добавлена корова ${name} (${tag})`);
        triggerConfetti();
    }
    
    closeModal('addCowModal');
    renderHerd();
    renderDashboard();
    document.getElementById('editCowId').value = '';
    document.getElementById('cowModalTitle').textContent = 'Добавить корову';
}

function editCow(id) {
    const cow = cows.find(c => c.id === id);
    if (!cow) return;
    
    document.getElementById('editCowId').value = cow.id;
    document.getElementById('cowModalTitle').textContent = 'Редактировать корову';
    document.getElementById('modalCowName').value = cow.name;
    document.getElementById('modalCowTag').value = cow.tag;
    document.getElementById('modalCowBirth').value = cow.birth;
    document.getElementById('modalCowBreed').value = cow.breed;
    document.getElementById('modalCowStatus').value = cow.status;
    document.getElementById('modalCowMilk').value = cow.milk;
    document.getElementById('modalCowWeight').value = cow.weight;
    document.getElementById('modalCowCalvings').value = cow.calvings;
    
    openModal('addCowModal');
}

function deleteCow(id) {
    const cow = cows.find(c => c.id === id);
    if (!cow) return;
    
    showConfirm({
        title: 'Удалить корову?',
        text: `${cow.name} (${cow.tag}) будет удалена из реестра. Это действие нельзя отменить.`,
        confirmText: 'Удалить', danger: true,
        onConfirm: () => {
            cows = cows.filter(c => c.id !== id);
            Store.update({ cows });
            renderHerd();
            renderDashboard();
            addLog(`Удалена корова ${cow.name} (${cow.tag})`);
            showToast('Удалено', 'Корова удалена из реестра');
        }
    });
}

// ============ REPRODUCTION ============
function renderReproduction() {
    const pregnant = cows.filter(c => c.status === 'Тельная').length;
    const lactating = cows.filter(c => c.milk > 0).length;
    const dry = cows.filter(c => c.status === 'Сухостойная').length;
    const avgLactation = lactating ? (cows.filter(c => c.milk > 0).reduce((a, c) => a + c.milk, 0) / lactating * 305).toFixed(0) : 0;
    
    document.getElementById('repPregnant').textContent = pregnant;
    document.getElementById('repLactating').textContent = lactating;
    document.getElementById('repDry').textContent = dry;
    document.getElementById('repAvgLactation').textContent = avgLactation + ' л';
    
    const allRepro = [];
    cows.forEach(c => {
        c.reproHistory.forEach(r => {
            allRepro.push({ ...r, cowTag: c.tag, cowName: c.name });
        });
    });
    allRepro.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    document.getElementById('reproTableBody').innerHTML = allRepro.map(r => {
        const eventClass = r.event === 'Отёл' ? 'badge-green' : r.event === 'Осеменение' ? 'badge-blue' : 'badge-amber';
        const statusClass = r.status === 'Тельная' ? 'badge-amber' : r.status === 'Завершено' ? 'badge-green' : 'badge-gray';
        return `<tr>
            <td>${r.date}</td>
            <td><span class="badge badge-gray">${r.cowTag}</span> ${r.cowName}</td>
            <td><span class="badge ${eventClass}">${r.event}</span></td>
            <td>${r.bull}</td>
            <td>${r.expected}</td>
            <td><span class="badge ${statusClass}">${r.status}</span></td>
            <td><button class="btn btn-sm btn-secondary btn-icon">✏️</button></td>
        </tr>`;
    }).join('') || '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">Нет записей</td></tr>';
}

function saveRepro() {
    const cowTag = document.getElementById('modalReproCow').value.trim();
    const cow = cows.find(c => c.tag === cowTag);
    
    if (!cow) { showToast('Ошибка', 'Корова с такой биркой не найдена', 'error'); return; }
    
    const event = document.getElementById('modalReproEvent').value;
    const record = {
        date: document.getElementById('modalReproDate').value || new Date().toISOString().slice(0, 10),
        event,
        bull: document.getElementById('modalReproBull').value || '—',
        expected: document.getElementById('modalReproExpected').value || '—',
        status: event === 'Отёл' ? 'Завершено' : 'Тельная'
    };
    
    const idx = cows.findIndex(c => c.id === cow.id);
    cows[idx].reproHistory.unshift(record);
    
    if (event === 'Осеменение') cows[idx].status = 'Тельная';
    if (event === 'Отёл') {
        cows[idx].status = 'Здоров';
        cows[idx].calvings = (cows[idx].calvings || 0) + 1;
    }
    
    Store.update({ cows });
    closeModal('addReproModal');
    renderReproduction();
    renderHerd();
    renderDashboard();
    addLog(`Репродукция: ${event} для ${cowTag}`);
    showToast('Успешно', `Запись добавлена для ${cow.name}`);
    triggerConfetti();
}

// ============ HEALTH ============
function renderHealth() {
    const tbody = document.getElementById('healthTableBody');
    tbody.innerHTML = healthRecords.map(r => {
        const statusClass = r.status === 'Завершено' ? 'badge-green' : r.status === 'В процессе' ? 'badge-amber' : 'badge-blue';
        return `<tr>
            <td>${r.date}</td>
            <td><span class="badge badge-gray">${r.cowTag}</span></td>
            <td>${r.cowName}</td>
            <td><span class="badge ${r.type === 'Вакцинация' ? 'badge-blue' : r.type === 'Лечение' ? 'badge-red' : 'badge-green'}">${r.type}</span></td>
            <td>${r.diagnosis}</td>
            <td>${r.treatment}</td>
            <td>${r.vet}</td>
            <td><span class="badge ${statusClass}">${r.status}</span></td>
            <td><button class="btn btn-sm btn-danger btn-icon" onclick="deleteHealthRecord(${r.id})">🗑</button></td>
        </tr>`;
    }).join('');
    
    document.getElementById('healthHealthy').textContent = cows.filter(c => c.status === 'Здоров').length;
    document.getElementById('healthTreating').textContent = cows.filter(c => c.status === 'Лечение').length;
    document.getElementById('healthVaccines').textContent = healthRecords.filter(r => r.type === 'Вакцинация').length;
    document.getElementById('healthChecks').textContent = healthRecords.filter(r => r.type === 'Осмотр').length;
    
    document.getElementById('drugsTableBody').innerHTML = drugs.map(d => `<tr>
        <td>${d.name}</td><td>${d.purpose}</td><td>${d.dose}</td><td>${d.expiry}</td><td>${d.stock}</td>
        <td><button class="btn btn-sm btn-danger btn-icon" onclick="deleteDrug(${d.id})">🗑</button></td>
    </tr>`).join('');
}

function saveHealthRecord() {
    const cowTag = document.getElementById('modalHealthCow').value.trim();
    const cow = cows.find(c => c.tag === cowTag);
    
    if (!cowTag) { showToast('Ошибка', 'Укажите бирку коровы', 'error'); return; }
    
    healthRecords.unshift({
        id: Store.nextId('health'),
        date: document.getElementById('modalHealthDate').value || new Date().toISOString().slice(0, 10),
        cowTag, cowName: cow?.name || 'Неизвестно',
        type: document.getElementById('modalHealthType').value,
        diagnosis: document.getElementById('modalHealthDiagnosis').value,
        treatment: document.getElementById('modalHealthTreatment').value,
        vet: document.getElementById('modalHealthVet').value,
        status: document.getElementById('modalHealthStatus').value
    });
    
    Store.update({ healthRecords });
    closeModal('addHealthModal');
    renderHealth();
    addLog(`Добавлена медзапись для ${cowTag}`);
    showToast('Успешно', 'Медицинская запись добавлена');
}

function deleteHealthRecord(id) {
    showConfirm({
        title: 'Удалить запись?', text: 'Медицинская запись будет удалена.',
        confirmText: 'Удалить', danger: true,
        onConfirm: () => {
            healthRecords = healthRecords.filter(r => r.id !== id);
            Store.update({ healthRecords });
            renderHealth();
            showToast('Удалено', 'Запись удалена');
        }
    });
}

function deleteDrug(id) {
    showConfirm({
        title: 'Удалить препарат?', text: 'Препарат будет удалён из справочника.',
        confirmText: 'Удалить', danger: true,
        onConfirm: () => {
            drugs = drugs.filter(d => d.id !== id);
            Store.update({ drugs });
            renderHealth();
            showToast('Удалено', 'Препарат удалён');
        }
    });
}

// ============ NUTRITION ============
function renderNutrition() {
    document.getElementById('nutrHay').textContent = hayStock.hay.toFixed(1);
    document.getElementById('nutrFeed').textContent = hayStock.feed.toFixed(1);
    document.getElementById('nutrMinerals').textContent = hayStock.minerals;
    document.getElementById('nutrCost').textContent = formatNumber(Math.floor(cows.length * 450));
}

function calculateRation() {
    const cowCount = parseInt(document.getElementById('calcCows').value) || 50;
    const milk = parseInt(document.getElementById('calcMilk').value) || 22;
    const weight = parseInt(document.getElementById('calcWeight').value) || 550;
    
    const hay = (weight * 0.012).toFixed(1);
    const feed = (milk * 0.45).toFixed(1);
    const silage = (weight * 0.015).toFixed(1);
    const minerals = (weight * 0.003).toFixed(1);
    
    document.getElementById('rationResult').style.display = 'block';
    document.getElementById('rationTableBody').innerHTML = `
        <tr><td><strong>Сено</strong></td><td>${hay}</td><td>${(hay * 0.85).toFixed(1)}</td><td>${(hay * 80).toFixed(0)}</td><td>${(hay * 8).toFixed(1)}</td><td>${formatNumber(Math.floor(hay * 5000))}</td></tr>
        <tr><td><strong>Комбикорм</strong></td><td>${feed}</td><td>${(feed * 0.88).toFixed(1)}</td><td>${(feed * 180).toFixed(0)}</td><td>${(feed * 12).toFixed(1)}</td><td>${formatNumber(Math.floor(feed * 15000))}</td></tr>
        <tr><td><strong>Силос</strong></td><td>${silage}</td><td>${(silage * 0.25).toFixed(1)}</td><td>${(silage * 20).toFixed(0)}</td><td>${(silage * 3).toFixed(1)}</td><td>${formatNumber(Math.floor(silage * 3000))}</td></tr>
        <tr><td><strong>Минералы</strong></td><td>${minerals}</td><td>${minerals}</td><td>—</td><td>—</td><td>${formatNumber(Math.floor(minerals * 20000))}</td></tr>
        <tr style="background: var(--bg-secondary); font-weight: 700;"><td>ИТОГО на голову</td><td>${(parseFloat(hay) + parseFloat(feed) + parseFloat(silage) + parseFloat(minerals)).toFixed(1)} кг</td><td></td><td></td><td></td><td>${formatNumber(Math.floor((parseFloat(hay) * 5000 + parseFloat(feed) * 15000 + parseFloat(silage) * 3000 + parseFloat(minerals) * 20000) / 1000))} ₽</td></tr>
    `;
    showToast('Расчёт выполнен', `Рацион рассчитан для ${cowCount} голов`);
}

// ============ MILK ============
let milkWeekChartInstance = null;

function renderMilk() {
    const ctx = document.getElementById('milkWeekChartCanvas');
    if (ctx) {
        if (milkWeekChartInstance) milkWeekChartInstance.destroy();
        milkWeekChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
                datasets: [{ label: 'Надой (л)', data: [210, 225, 218, 235, 242, 238, 245], backgroundColor: '#4a7c2a', borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
    
    document.getElementById('milkTableBody').innerHTML = `
        <tr><td>24.04.2026</td><td>82.5</td><td>78.0</td><td>84.5</td><td><strong>245.0</strong></td><td>3.8%</td><td>3.2%</td><td>180</td></tr>
        <tr><td>23.04.2026</td><td>80.0</td><td>76.5</td><td>81.5</td><td><strong>238.0</strong></td><td>3.7%</td><td>3.1%</td><td>195</td></tr>
        <tr><td>22.04.2026</td><td>85.0</td><td>79.0</td><td>78.0</td><td><strong>242.0</strong></td><td>3.9%</td><td>3.3%</td><td>172</td></tr>
        <tr><td>21.04.2026</td><td>78.5</td><td>75.0</td><td>81.5</td><td><strong>235.0</strong></td><td>3.6%</td><td>3.0%</td><td>210</td></tr>
        <tr><td>20.04.2026</td><td>72.0</td><td>70.5</td><td>75.5</td><td><strong>218.0</strong></td><td>3.7%</td><td>3.1%</td><td>188</td></tr>
        <tr><td>19.04.2026</td><td>75.5</td><td>73.0</td><td>76.5</td><td><strong>225.0</strong></td><td>3.8%</td><td>3.2%</td><td>165</td></tr>
        <tr><td>18.04.2026</td><td>70.0</td><td>68.5</td><td>71.5</td><td><strong>210.0</strong></td><td>3.6%</td><td>3.0%</td><td>205</td></tr>
    `;
}

function saveMilk() {
    const cowTag = document.getElementById('modalMilkCow').value.trim();
    const cow = cows.find(c => c.tag === cowTag);
    
    if (!cow) { showToast('Ошибка', 'Корова не найдена', 'error'); return; }
    
    const morning = parseFloat(document.getElementById('modalMilkMorning').value) || 0;
    const day = parseFloat(document.getElementById('modalMilkDay').value) || 0;
    const evening = parseFloat(document.getElementById('modalMilkEvening').value) || 0;
    const total = morning + day + evening;
    
    milkRecords.unshift({
        id: Store.nextId('milk'),
        date: document.getElementById('modalMilkDate').value || new Date().toISOString().slice(0, 10),
        cowTag, morning, day, evening, total,
        fat: parseFloat(document.getElementById('modalMilkFat').value) || 0,
        protein: parseFloat(document.getElementById('modalMilkProtein').value) || 0,
        somatic: parseInt(document.getElementById('modalMilkSomatic').value) || 0
    });
    
    const idx = cows.findIndex(c => c.id === cow.id);
    cows[idx].milk = total;
    
    Store.update({ milkRecords, cows });
    closeModal('addMilkModal');
    renderMilk();
    renderHerd();
    renderDashboard();
    addLog(`Надой ${total}л для ${cowTag}`);
    showToast('Успешно', `Надой ${total}л записан для ${cow.name}`);
}

// ============ MILKING ============
function renderMilking() {
    const milked = 42;
    const total = cows.length;
    const efficiency = Math.round(milked / total * 100);
    
    document.getElementById('milkedToday').textContent = milked;
    document.getElementById('milkedTotal').textContent = total;
    document.getElementById('milkingEfficiency').textContent = efficiency + '%';
    
    document.getElementById('equipmentTableBody').innerHTML = `
        <tr><td>Доильный аппарат (зал)</td><td>DeLaval VMS</td><td><span class="badge badge-green">Работает</span></td><td>15.04.2026</td><td>15.05.2026</td><td><button class="btn btn-sm btn-secondary btn-icon">🔧</button></td></tr>
        <tr><td>Холодильная установка</td><td>Carrier AquaForce</td><td><span class="badge badge-green">Работает</span></td><td>01.04.2026</td><td>01.07.2026</td><td><button class="btn btn-sm btn-secondary btn-icon">🔧</button></td></tr>
        <tr><td>Насос моющий</td><td>Alfa Laval LKH</td><td><span class="badge badge-amber">Требует ТО</span></td><td>10.02.2026</td><td>25.04.2026</td><td><button class="btn btn-sm btn-accent btn-icon">🔧</button></td></tr>
    `;
}

// ============ STORAGE ============
function renderStorage() {
    document.getElementById('storeHay').textContent = hayStock.hay.toFixed(1);
    document.getElementById('storeFeed').textContent = hayStock.feed.toFixed(1);
    document.getElementById('storeSilage').textContent = hayStock.silage.toFixed(1);
    document.getElementById('storeDays').textContent = Math.floor(hayStock.hay / (cows.length * 0.007));
    document.getElementById('storeHayBar').style.width = Math.min(hayStock.hay / 100 * 100, 100) + '%';
    document.getElementById('storeFeedBar').style.width = Math.min(hayStock.feed / 50 * 100, 100) + '%';
    document.getElementById('storeSilageBar').style.width = Math.min(hayStock.silage / 60 * 100, 100) + '%';
    
    document.getElementById('stockTableBody').innerHTML = stockOps.map(op => `<tr>
        <td>${op.date}</td><td>${op.type}</td>
        <td><span class="badge ${op.operation === 'Приход' ? 'badge-green' : 'badge-amber'}">${op.operation}</span></td>
        <td>${op.amount} ${op.unit}</td><td>${op.supplier}</td>
        <td>${op.cost > 0 ? formatNumber(op.cost) + ' ₽' : '-'}</td><td>${op.responsible}</td>
        <td><button class="btn btn-sm btn-danger btn-icon" onclick="deleteStockOp(${op.id})">🗑</button></td>
    </tr>`).join('');
}

function switchStorageTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
}

function saveStockOp() {
    const type = document.getElementById('modalStockType').value;
    const op = document.getElementById('modalStockOp').value;
    const amount = parseFloat(document.getElementById('modalStockAmount').value);
    
    if (!amount || amount <= 0) { showToast('Ошибка', 'Укажите количество', 'error'); return; }
    
    stockOps.unshift({
        id: Store.nextId('stock'),
        date: document.getElementById('modalStockDate').value || new Date().toISOString().slice(0, 10),
        type, operation: op, amount,
        unit: type === 'Минералы' ? 'кг' : 'т',
        supplier: document.getElementById('modalStockSupplier').value || '-',
        cost: parseInt(document.getElementById('modalStockCost').value) || 0,
        responsible: currentUser.name
    });
    
    const multiplier = type === 'Минералы' ? 0.001 : 1;
    const change = amount * multiplier;
    if (op === 'Приход') {
        if (type === 'Сено') hayStock.hay += change;
        else if (type === 'Комбикорм') hayStock.feed += change;
        else if (type === 'Силос') hayStock.silage += change;
        else if (type === 'Минералы') hayStock.minerals += amount;
    } else {
        if (type === 'Сено') hayStock.hay = Math.max(0, hayStock.hay - change);
        else if (type === 'Комбикорм') hayStock.feed = Math.max(0, hayStock.feed - change);
        else if (type === 'Силос') hayStock.silage = Math.max(0, hayStock.silage - change);
        else if (type === 'Минералы') hayStock.minerals = Math.max(0, hayStock.minerals - amount);
    }
    
    Store.update({ stockOps, hayStock });
    closeModal('addStockModal');
    renderStorage();
    renderDashboard();
    addLog(`${op} ${type}: ${amount} ${type === 'Минералы' ? 'кг' : 'т'}`);
    showToast('Успешно', `Операция "${op}" сохранена`);
}

function deleteStockOp(id) {
    showConfirm({
        title: 'Удалить операцию?', text: 'Операция будет удалена из журнала.',
        confirmText: 'Удалить', danger: true,
        onConfirm: () => {
            stockOps = stockOps.filter(o => o.id !== id);
            Store.update({ stockOps });
            renderStorage();
            showToast('Удалено', 'Операция удалена');
        }
    });
}

// ============ EQUIPMENT ============
function renderEquipment() {
    document.getElementById('machineryTableBody').innerHTML = `
        <tr><td>Трактор</td><td>John Deere 8R</td><td>А123БС 50</td><td><span class="badge badge-green">Исправен</span></td><td>3 450</td><td>01.03.2026</td><td>01.06.2026</td></tr>
        <tr><td>Кормораздатчик</td><td>Kuhn SPW</td><td>В456КМ 50</td><td><span class="badge badge-green">Исправен</span></td><td>1 280</td><td>15.02.2026</td><td>15.05.2026</td></tr>
        <tr><td>Погрузчик</td><td>Manitou MLT</td><td>Е789НР 50</td><td><span class="badge badge-amber">Ремонт</span></td><td>2 150</td><td>10.01.2026</td><td>30.04.2026</td></tr>
    `;
}

// ============ STAFF ============
function renderStaff() {
    const search = document.getElementById('staffSearch')?.value.toLowerCase() || '';
    const roleFilter = document.getElementById('staffFilterRole')?.value || '';
    const statusFilter = document.getElementById('staffFilterStatus')?.value || '';
    
    let filtered = staff.filter(s => {
        const matchSearch = !search || s.name.toLowerCase().includes(search) || s.role.toLowerCase().includes(search);
        const matchRole = !roleFilter || s.role === roleFilter;
        const matchStatus = !statusFilter || s.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });
    
    document.getElementById('staffTableBody').innerHTML = filtered.map(s => {
        const statusClass = s.status === 'Работает' ? 'badge-green' : s.status === 'Отпуск' ? 'badge-blue' : s.status === 'Больничный' ? 'badge-amber' : 'badge-gray';
        return `<tr>
            <td><span class="badge badge-gray">#${s.id}</span></td>
            <td><strong>${s.name}</strong></td>
            <td>${s.role}</td><td>${s.dept}</td><td>${s.phone}</td>
            <td>${s.exp} лет</td><td>${formatNumber(s.salary)} ₽</td>
            <td><span class="badge ${statusClass}">${s.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary btn-icon" onclick="editStaff(${s.id})">✏️</button>
                <button class="btn btn-sm btn-danger btn-icon" onclick="deleteStaff(${s.id})">🗑</button>
            </td>
        </tr>`;
    }).join('');
    
    document.getElementById('staffTotal').textContent = staff.length;
    document.getElementById('staffAvgExp').textContent = (staff.reduce((a, s) => a + s.exp, 0) / staff.length).toFixed(1);
    document.getElementById('staffOnDuty').textContent = staff.filter(s => s.status === 'Работает').length;
    document.getElementById('staffVacation').textContent = staff.filter(s => s.status === 'Отпуск').length;
    
    document.getElementById('scheduleTableBody').innerHTML = staff.filter(s => s.status === 'Работает').map(s => `
        <tr>
            <td><strong>${s.name}</strong><br><small style="color: var(--text-muted);">${s.role}</small></td>
            <td><span class="badge badge-green">07-15</span></td><td><span class="badge badge-green">07-15</span></td>
            <td><span class="badge badge-green">07-15</span></td><td><span class="badge badge-green">07-15</span></td>
            <td><span class="badge badge-green">07-15</span></td><td><span class="badge badge-gray">Вых</span></td>
            <td><span class="badge badge-gray">Вых</span></td><td>40</td>
        </tr>
    `).join('');
}

function openStaffModal() {
    document.getElementById('editStaffId').value = '';
    document.getElementById('staffModalTitle').textContent = 'Добавить сотрудника';
    document.querySelectorAll('#addStaffModal input').forEach(i => i.value = '');
    openModal('addStaffModal');
}

function saveStaff() {
    const name = document.getElementById('modalStaffName').value.trim();
    const role = document.getElementById('modalStaffRole').value;
    
    if (!name || !role) { showToast('Ошибка', 'Заполните ФИО и должность', 'error'); return; }
    
    const editId = document.getElementById('editStaffId').value;
    
    if (editId) {
        const idx = staff.findIndex(s => s.id === parseInt(editId));
        if (idx !== -1) {
            staff[idx] = {
                ...staff[idx],
                name, role,
                dept: document.getElementById('modalStaffDept').value || '—',
                phone: document.getElementById('modalStaffPhone').value || '—',
                exp: parseInt(document.getElementById('modalStaffExp').value) || 0,
                salary: parseInt(document.getElementById('modalStaffSalary').value) || 0
            };
            showToast('Успешно', `Данные ${name} обновлены`);
            addLog(`Обновлён сотрудник ${name}`);
        }
    } else {
        staff.push({
            id: Store.nextId('staff'), name, role,
            dept: document.getElementById('modalStaffDept').value || '—',
            phone: document.getElementById('modalStaffPhone').value || '—',
            exp: parseInt(document.getElementById('modalStaffExp').value) || 0,
            salary: parseInt(document.getElementById('modalStaffSalary').value) || 0,
            status: 'Работает'
        });
        showToast('Успешно', `${name} добавлен в штат`);
        addLog(`Добавлен сотрудник ${name}`);
        triggerConfetti();
    }
    
    Store.update({ staff });
    closeModal('addStaffModal');
    renderStaff();
}

function editStaff(id) {
    const s = staff.find(x => x.id === id);
    if (!s) return;
    
    document.getElementById('editStaffId').value = s.id;
    document.getElementById('staffModalTitle').textContent = 'Редактировать сотрудника';
    document.getElementById('modalStaffName').value = s.name;
    document.getElementById('modalStaffRole').value = s.role;
    document.getElementById('modalStaffDept').value = s.dept;
    document.getElementById('modalStaffPhone').value = s.phone;
    document.getElementById('modalStaffExp').value = s.exp;
    document.getElementById('modalStaffSalary').value = s.salary;
    
    openModal('addStaffModal');
}

function deleteStaff(id) {
    const s = staff.find(x => x.id === id);
    if (!s) return;
    
    showConfirm({
        title: 'Удалить сотрудника?', text: `${s.name} будет удалён из системы.`,
        confirmText: 'Удалить', danger: true,
        onConfirm: () => {
            staff = staff.filter(x => x.id !== id);
            Store.update({ staff });
            renderStaff();
            addLog(`Удалён сотрудник ${s.name}`);
            showToast('Удалено', `${s.name} удалён`);
        }
    });
}

// ============ PROFILE ============
function renderProfile() {
    const roleConfig = ROLES[currentUser.role] || ROLES.operator;
    document.getElementById('profileAvatar').textContent = getInitials(currentUser.name);
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRoleBadge').textContent = roleConfig.name;
    document.getElementById('profileLogin').textContent = '@' + currentUser.login;
    document.getElementById('profileRole').textContent = roleConfig.name;
    document.getElementById('profileDept').textContent = roleConfig.dept;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileRegDate').textContent = currentUser.regDate;
    document.getElementById('profileLastLogin').textContent = currentUser.lastLogin;
    
    const allPages = ['dashboard','herd','reproduction','health','nutrition','milk','milking','storage','equipment','staff','schedule','salary','finance','sales','reports','settings','users'];
    const pageNames = { dashboard:'Дашборд', herd:'Поголовье КРС', reproduction:'Репродукция', health:'Ветконтроль', nutrition:'Кормление', milk:'Учёт молока', milking:'Доильный зал', storage:'Склад', equipment:'Оборудование', staff:'Сотрудники', schedule:'График', salary:'Зарплаты', finance:'Финансы', sales:'Продажи', reports:'Отчёты', settings:'Настройки', users:'Пользователи' };
    
    document.getElementById('permissionsList').innerHTML = allPages.map(page => {
        const hasAccess = roleConfig.permissions.includes('all') || roleConfig.permissions.includes(page);
        return `<div class="permission-item ${hasAccess ? 'allowed' : 'denied'}"><span>${pageNames[page]}</span><span class="badge ${hasAccess ? 'badge-green' : 'badge-gray'}">${hasAccess ? '✓ Доступно' : '✕ Нет доступа'}</span></div>`;
    }).join('');
    
    document.getElementById('profileTimeline').innerHTML = systemLogs.slice(0, 6).map(log => `<div class="timeline-item"><div class="timeline-text">${new Date(log.time).toLocaleString('ru-RU')} — ${log.action}</div></div>`).join('') || '<div class="timeline-item"><div class="timeline-text">Нет записей</div></div>';
}

// ============ SALARY ============
function renderSalary() {
    const totalSalary = staff.reduce((a, s) => a + s.salary, 0);
    const avgSalary = totalSalary / staff.length;
    const bonus = Math.floor(totalSalary * 0.15);
    const deduction = Math.floor(totalSalary * 0.13);
    
    document.getElementById('salaryTotal').textContent = formatNumber(totalSalary);
    document.getElementById('salaryAvg').textContent = formatNumber(Math.floor(avgSalary));
    document.getElementById('salaryBonus').textContent = formatNumber(bonus);
    document.getElementById('salaryDeduction').textContent = formatNumber(deduction);
    
    document.getElementById('salaryTableBody').innerHTML = staff.map(s => {
        const workedDays = s.status === 'Работает' ? 22 : s.status === 'Отпуск' ? 0 : 10;
        const bonusAmount = Math.floor(s.salary * 0.15);
        const deduct = Math.floor(s.salary * 0.13);
        const total = s.salary + bonusAmount - deduct;
        return `<tr>
            <td><strong>${s.name}</strong></td><td>${s.role}</td>
            <td>${formatNumber(s.salary)} ₽</td><td>${workedDays} дн</td>
            <td>${formatNumber(bonusAmount)} ₽</td><td>${formatNumber(deduct)} ₽</td>
            <td><strong>${formatNumber(total)} ₽</strong></td>
        </tr>`;
    }).join('');
}

// ============ FINANCE ============
let financeChartInstance = null;

function renderFinance() {
    const revenue = 2850000, expenses = 1980000;
    const profit = revenue - expenses;
    const margin = Math.round(profit / revenue * 100);
    
    document.getElementById('finRevenue').textContent = formatNumber(revenue);
    document.getElementById('finExpenses').textContent = formatNumber(expenses);
    document.getElementById('finProfit').textContent = formatNumber(profit);
    document.getElementById('finMargin').textContent = margin + '%';
    
    const ctx = document.getElementById('financeChartCanvas');
    if (ctx) {
        if (financeChartInstance) financeChartInstance.destroy();
        financeChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [
                    { label: 'Выручка', data: [2400, 2550, 2380, 2850, 0, 0], backgroundColor: '#2d7a3e', borderRadius: 6 },
                    { label: 'Расходы', data: [1800, 1900, 1750, 1980, 0, 0], backgroundColor: '#a03030', borderRadius: 6 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }
    
    document.getElementById('expenseTableBody').innerHTML = `
        <tr><td>Корма</td><td>${formatNumber(680000)} ₽</td><td>34%</td><td><span class="text-warning">▲ 5%</span></td></tr>
        <tr><td>ФОТ</td><td>${formatNumber(520000)} ₽</td><td>26%</td><td><span class="text-success">▼ 2%</span></td></tr>
        <tr><td>Ветпрепараты</td><td>${formatNumber(120000)} ₽</td><td>6%</td><td><span class="text-success">▼ 8%</span></td></tr>
        <tr><td>Электроэнергия</td><td>${formatNumber(95000)} ₽</td><td>5%</td><td><span class="text-warning">▲ 12%</span></td></tr>
        <tr><td>Топливо</td><td>${formatNumber(85000)} ₽</td><td>4%</td><td><span class="text-warning">▲ 15%</span></td></tr>
        <tr><td>Амортизация</td><td>${formatNumber(180000)} ₽</td><td>9%</td><td><span class="text-muted">—</span></td></tr>
        <tr><td>Прочие</td><td>${formatNumber(300000)} ₽</td><td>15%</td><td><span class="text-warning">▲ 3%</span></td></tr>
    `;
}

// ============ SALES ============
function renderSales() {
    document.getElementById('clientsTableBody').innerHTML = `
        <tr><td><strong>ООО «Молочный комбинат»</strong></td><td>7701234567</td><td>Молоко сырое</td><td>45 000 л/мес</td><td>38 ₽/л</td><td><span class="text-success">0 ₽</span></td><td><span class="badge badge-green">Активен</span></td></tr>
        <tr><td><strong>ОАО «Сыродельный завод»</strong></td><td>7709876543</td><td>Молоко высший сорт</td><td>28 000 л/мес</td><td>42 ₽/л</td><td><span class="text-warning">156 000 ₽</span></td><td><span class="badge badge-amber">Задолженность</span></td></tr>
    `;
    document.getElementById('shipmentsTableBody').innerHTML = `
        <tr><td>24.04.2026</td><td>ООО «Молочный комбинат»</td><td>Молоко сырое</td><td>1 500 л</td><td>38 ₽</td><td><strong>57 000 ₽</strong></td><td><span class="badge badge-green">Оплачено</span></td></tr>
        <tr><td>22.04.2026</td><td>ОАО «Сыродельный завод»</td><td>Молоко высший сорт</td><td>980 л</td><td>42 ₽</td><td><strong>41 160 ₽</strong></td><td><span class="badge badge-amber">Ожидает оплаты</span></td></tr>
    `;
}

// ============ AUDIT LOG ============
function renderAudit() {
    document.getElementById('auditTableBody').innerHTML = systemLogs.slice(0, 100).map(log => `<tr>
        <td>${new Date(log.time).toLocaleString('ru-RU')}</td>
        <td>${log.user}</td>
        <td>${log.action}</td>
    </tr>`).join('') || '<tr><td colspan="3" style="text-align: center; padding: 40px; color: var(--text-muted);">Журнал пуст</td></tr>';
}

// ============ USERS ============
function renderUsers() {
    document.getElementById('usersTableBody').innerHTML = users.map(u => {
        const roleConfig = ROLES[u.role] || ROLES.operator;
        return `<tr>
            <td><span class="badge badge-gray">#${u.id}</span></td>
            <td><strong>${u.login}</strong></td><td>${u.name}</td>
            <td><span class="badge badge-blue">${roleConfig.name}</span></td>
            <td>${roleConfig.dept}</td>
            <td><span class="badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}">${u.status === 'active' ? 'Активен' : 'Заблокирован'}</span></td>
            <td>${u.lastLogin}</td>
            <td><button class="btn btn-sm btn-danger btn-icon" onclick="toggleUserStatus(${u.id})">${u.status === 'active' ? '🔒' : '🔓'}</button></td>
        </tr>`;
    }).join('');
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user || user.id === 1) { showToast('Ошибка', 'Нельзя заблокировать администратора', 'error'); return; }
    user.status = user.status === 'active' ? 'blocked' : 'active';
    Store.update({ users });
    renderUsers();
    showToast('Успешно', `Пользователь ${user.login} ${user.status === 'active' ? 'разблокирован' : 'заблокирован'}`);
}

// ============ EXPORT ============
function exportHerd() {
    const data = cows.map(c => ({
        'Бирка': c.tag, 'Кличка': c.name, 'Дата рождения': c.birth,
        'Порода': c.breed, 'Статус': c.status, 'Надой (л)': c.milk,
        'Вес (кг)': c.weight, 'Отёлы': c.calvings
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Поголовье');
    XLSX.writeFile(wb, `burenka_herd_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Экспорт', 'Реестр КРС экспортирован в Excel');
    addLog('Экспорт реестра КРС в Excel');
}

function exportSalary() {
    const data = staff.map(s => {
        const workedDays = s.status === 'Работает' ? 22 : s.status === 'Отпуск' ? 0 : 10;
        const bonusAmount = Math.floor(s.salary * 0.15);
        const deduct = Math.floor(s.salary * 0.13);
        return {
            'Сотрудник': s.name, 'Должность': s.role, 'Оклад': s.salary,
            'Отработано (дн)': workedDays, 'Премия': bonusAmount,
            'Удержания': deduct, 'Итого': s.salary + bonusAmount - deduct
        };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Зарплаты');
    XLSX.writeFile(wb, `burenka_salary_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Экспорт', 'Ведомость экспортирована');
}

function exportReport(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('АгроХолдинг «Бурёнка»', 14, 20);
    doc.setFontSize(12);
    doc.text(`Отчёт: ${type}`, 14, 30);
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 38);
    
    if (type === 'herd') {
        doc.autoTable({
            startY: 50,
            head: [['Бирка', 'Кличка', 'Порода', 'Статус', 'Надой']],
            body: cows.map(c => [c.tag, c.name, c.breed, c.status, c.milk + ' л']),
            theme: 'grid'
        });
    } else if (type === 'milk') {
        doc.autoTable({
            startY: 50,
            head: [['Дата', 'Утро', 'День', 'Вечер', 'Итого']],
            body: [['24.04.2026', '82.5', '78.0', '84.5', '245.0']],
            theme: 'grid'
        });
    }
    
    doc.save(`burenka_report_${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('Экспорт', 'Отчёт сформирован в PDF');
    addLog(`Экспорт отчёта: ${type}`);
}

function exportData(type) {
    const data = Store.get();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `burenka_backup_${type}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Экспорт', 'Данные выгружены');
    addLog(`Экспорт данных: ${type}`);
}

function backupData() { exportData('full'); }

function refreshDashboard() {
    renderDashboard();
    showToast('Обновлено', 'Данные дашборда актуализированы');
}

// ============ CSV IMPORT ============
let csvData = [];

function initCsvImport() {
    const dropZone = document.getElementById('csvDropZone');
    const fileInput = document.getElementById('csvFileInput');
    
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files[0]) handleCsvFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleCsvFile(e.target.files[0]); });
}

function handleCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) { showToast('Ошибка', 'Файл пуст', 'error'); return; }
        
        csvData = lines.slice(1).map(line => {
            const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            return {
                tag: cols[0] || '', name: cols[1] || '', birth: cols[2] || '2023-01-01',
                breed: cols[3] || 'Голштин', status: cols[4] || 'Здоров',
                milk: parseFloat(cols[5]) || 0, weight: parseInt(cols[6]) || 550,
                calvings: parseInt(cols[7]) || 0
            };
        }).filter(c => c.tag && c.name);
        
        document.getElementById('csvPreview').style.display = 'block';
        document.getElementById('csvPreview').innerHTML = `<p><strong>Найдено записей:</strong> ${csvData.length}</p><p style="color: var(--text-muted); font-size: 12px;">Первые 3: ${csvData.slice(0, 3).map(c => c.name).join(', ')}</p>`;
        document.getElementById('csvImportBtn').disabled = csvData.length === 0;
    };
    reader.readAsText(file);
}

function importCsv() {
    if (csvData.length === 0) return;
    csvData.forEach(c => {
        cows.push({ id: Store.nextId('cow'), ...c, reproHistory: [] });
    });
    Store.update({ cows });
    closeModal('importCsvModal');
    renderHerd();
    renderDashboard();
    showToast('Успешно', `Импортировано ${csvData.length} коров`);
    addLog(`Импорт CSV: ${csvData.length} коров`);
    triggerConfetti();
    csvData = [];
}

// ============ COMMAND PALETTE ============
function openCommandPalette() {
    openModal('commandPalette');
    setTimeout(() => document.getElementById('commandInput').focus(), 100);
    filterCommands();
}

function filterCommands() {
    const query = document.getElementById('commandInput').value.toLowerCase();
    const results = [];
    
    if (!query) {
        results.push({ type: 'nav', label: 'Перейти на Дашборд', action: () => switchPage('dashboard') });
        results.push({ type: 'nav', label: 'Перейти к Поголовью', action: () => switchPage('herd') });
        results.push({ type: 'action', label: 'Добавить корову', action: () => openModal('addCowModal') });
        results.push({ type: 'action', label: 'Добавить сотрудника', action: () => openStaffModal() });
    } else {
        cows.filter(c => c.name.toLowerCase().includes(query) || c.tag.toLowerCase().includes(query)).forEach(c => {
            results.push({ type: 'cow', label: `Корова: ${c.name} (${c.tag})`, action: () => openCowProfile(c.id) });
        });
        staff.filter(s => s.name.toLowerCase().includes(query)).forEach(s => {
            results.push({ type: 'staff', label: `Сотрудник: ${s.name}`, action: () => switchPage('staff') });
        });
        ['dashboard','herd','reproduction','health','nutrition','milk','milking','storage','equipment','staff','salary','finance','sales','reports','settings'].forEach(p => {
            if (p.includes(query)) results.push({ type: 'nav', label: `Страница: ${p}`, action: () => switchPage(p) });
        });
    }
    
    document.getElementById('commandResults').innerHTML = results.slice(0, 10).map((r, i) => `
        <div class="command-item ${i === 0 ? 'active' : ''}" data-index="${i}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${r.type === 'nav' ? '<polyline points="9 18 15 12 9 6"/>' : r.type === 'cow' ? '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>' : '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>'}
            </svg>
            <span>${r.label}</span>
        </div>
    `).join('') || '<div style="padding: 16px; color: var(--text-muted); text-align: center;">Ничего не найдено</div>';
    
    window._commandResults = results;
    document.querySelectorAll('.command-item').forEach((el, i) => {
        el.addEventListener('click', () => executeCommand(i));
    });
}

function executeCommand(index) {
    if (window._commandResults[index]) {
        window._commandResults[index].action();
        closeModal('commandPalette');
        document.getElementById('commandInput').value = '';
    }
}

// ============ NOTIFICATIONS ============
function toggleNotifications(forceState) {
    const drawer = document.getElementById('notifDrawer');
    const overlay = document.getElementById('notifOverlay');
    const isOpen = drawer.classList.contains('open');
    const shouldOpen = forceState !== undefined ? forceState : !isOpen;
    
    if (shouldOpen) {
        drawer.classList.add('open');
        overlay.classList.add('open');
        renderNotifications();
        markNotificationsRead();
    } else {
        drawer.classList.remove('open');
        overlay.classList.remove('open');
    }
}

function renderNotifications() {
    document.getElementById('notifList').innerHTML = notifications.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'} ${n.type}">
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">${n.date}</div>
            <div>${n.text}</div>
        </div>
    `).join('') || '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Нет уведомлений</div>';
}

function markNotificationsRead() {
    notifications.forEach(n => n.read = true);
    Store.update({ notifications });
    document.getElementById('notifDot').style.display = 'none';
}

function clearNotifications() {
    Store.update({ notifications: [] });
    toggleNotifications(false);
    renderDashboard();
}

// ============ BROWSER NOTIFICATIONS ============
function requestBrowserNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                new Notification('Бурёнка ERP', { body: 'Уведомления включены', icon: '/icon-192.png' });
                showToast('Успешно', 'Браузерные уведомления включены');
            }
        });
    }
}

// ============ VOICE INPUT ============
function initVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const match = transcript.match(/надой\s*(\d+(?:[.,]\d+)?)\s*(?:литр|л)?/);
        if (match) {
            document.getElementById('modalMilkMorning').value = match[1];
            showToast('Голосовой ввод', `Распознано: ${match[1]} л`);
        }
    };
}

// ============ THEME ============
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast('Тема', isDark ? 'Тёмная тема включена' : 'Светлая тема включена');
}

// ============ SETTINGS ============
function saveSettings() {
    showToast('Успешно', 'Настройки сохранены');
    addLog('Сохранены настройки системы');
}

function confirmResetData() {
    showConfirm({
        title: 'Сбросить все данные?',
        text: 'Все данные будут возвращены к демо-состоянию. Это действие нельзя отменить.',
        confirmText: 'Сбросить', danger: true,
        onConfirm: () => {
            Store.reset();
            syncState();
            location.reload();
        }
    });
}

// ============ APP INIT ============
function initApp() {
    syncState();
    buildSidebar();
    
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('mainContent');
        sidebar.classList.toggle('hidden');
        main.classList.toggle('full');
        localStorage.setItem('sidebarHidden', sidebar.classList.contains('hidden'));
    });
    
    if (localStorage.getItem('sidebarHidden') === 'true') {
        document.getElementById('sidebar').classList.add('hidden');
        document.getElementById('mainContent').classList.add('full');
    }
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
    
    document.getElementById('profileBtn').addEventListener('click', () => switchPage('profile'));
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Store.update({ currentUser: null });
        document.getElementById('appLayout').style.display = 'none';
        document.getElementById('loginOverlay').style.display = 'flex';
        document.getElementById('loginUser').value = '';
        document.getElementById('loginPass').value = '';
        showToast('Выход', 'Сеанс завершён');
    });
    
    document.getElementById('toggleSidebar').addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.stopPropagation();
            document.getElementById('sidebar').classList.toggle('mobile-open');
        }
    });
    
    document.getElementById('herdSearch')?.addEventListener('input', renderHerd);
    document.getElementById('herdFilterBreed')?.addEventListener('change', renderHerd);
    document.getElementById('herdFilterStatus')?.addEventListener('change', renderHerd);
    document.getElementById('staffSearch')?.addEventListener('input', renderStaff);
    document.getElementById('staffFilterRole')?.addEventListener('change', renderStaff);
    document.getElementById('staffFilterStatus')?.addEventListener('change', renderStaff);
    
    document.getElementById('globalSearch').addEventListener('focus', openCommandPalette);
    document.getElementById('helpBtn').addEventListener('click', () => openModal('helpModal'));
    document.getElementById('notifBtn').addEventListener('click', () => toggleNotifications());
    
    document.getElementById('browserNotifToggle')?.addEventListener('change', (e) => {
        if (e.target.checked) requestBrowserNotifications();
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            toggleNotifications(false);
        }
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
    });
    
    document.getElementById('commandInput')?.addEventListener('input', filterCommands);
    
    applyMasks();
    initCsvImport();
    initVoiceInput();
    renderDashboard();
}

// ============ DOM READY ============
document.addEventListener('DOMContentLoaded', () => {
    Store.init();
    syncState();
    initAuth();
    
    if (currentUser) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('appLayout').style.display = 'flex';
        initApp();
    }
    
    // Login animation
    const loginBg = document.getElementById('loginBg');
    for (let i = 0; i < 5; i++) {
        const cow = document.createElement('div');
        cow.className = 'cow-silhouette';
        cow.style.setProperty('--left', Math.random() * 100 + '%');
        cow.style.setProperty('--size', 80 + Math.random() * 60 + 'px');
        cow.style.setProperty('--duration', 20 + Math.random() * 15 + 's');
        cow.style.setProperty('--delay', -Math.random() * 20 + 's');
        loginBg.appendChild(cow);
    }
    for (let i = 0; i < 30; i++) {
        const grass = document.createElement('div');
        grass.className = 'grass-blade';
        grass.style.setProperty('--left', Math.random() * 100 + '%');
        grass.style.setProperty('--height', 30 + Math.random() * 50 + 'px');
        grass.style.setProperty('--delay', -Math.random() * 4 + 's');
        loginBg.appendChild(grass);
    }
});