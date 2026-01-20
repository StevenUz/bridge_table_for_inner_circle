// ===== LOBBY UI LOGIC =====

// DOM елементи
const loginSection = document.getElementById('login-section');
const tablesSection = document.getElementById('tables-section');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginLanguageSelect = document.getElementById('login-language');
const languageSelectorContainer = document.getElementById('language-selector-container');
const usernameDisplay = document.getElementById('current-username');
const logoutBtn = document.getElementById('logout-btn');
const createTableBtn = document.getElementById('create-table-btn');
const refreshTablesBtn = document.getElementById('refresh-tables-btn');
const tablesList = document.getElementById('tables-list');
const positionModal = document.getElementById('position-modal');
const modalTableName = document.getElementById('modal-table-name');
const closeModalBtn = document.getElementById('close-modal');
const playerPositionsDiv = document.getElementById('player-positions');
const spectatorModeDiv = document.getElementById('spectator-mode');
const confirmSpectatorBtn = document.getElementById('confirm-spectator');

let selectedTableId = null;
let selectedRole = 'player'; // 'player' or 'spectator'

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    console.log('Lobby initialized');
    
    // Инициализира език
    initializeLanguage();
    
    // Проверка дали потребителят е вече логнат
    if (window.authManager.isLoggedIn()) {
        showTablesSection();
    } else {
        showLoginSection();
    }

    setupEventListeners();
});

// ===== LANGUAGE INITIALIZATION =====

function initializeLanguage() {
    // Задава избрания език в login формата
    const currentLang = window.i18n.getLanguage();
    loginLanguageSelect.value = currentLang;
    
    // Добавя селектор за език в lobby header
    const langSelector = window.i18n.createLanguageSelector();
    languageSelectorContainer.appendChild(langSelector);
    
    // Subscribe за промени в езика
    window.i18n.subscribe((lang) => {
        console.log('Language changed, updating translations...');
        window.i18n.updatePageTranslations();
        renderTables(); // Презарежда масите с нов език
    });
    
    // Слуша за промени в login селектора
    loginLanguageSelect.addEventListener('change', (e) => {
        window.i18n.setLanguage(e.target.value);
    });
    
    // Първоначална актуализация на преводите
    window.i18n.updatePageTranslations();
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Create table
    createTableBtn.addEventListener('click', handleCreateTable);

    // Refresh tables
    refreshTablesBtn.addEventListener('click', renderTables);

    // Close modal
    closeModalBtn.addEventListener('click', closePositionModal);
    positionModal.addEventListener('click', (e) => {
        if (e.target === positionModal) {
            closePositionModal();
        }
    });
    
    // Role selector
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', () => handleRoleSelect(btn.dataset.role));
    });
    
    // Confirm spectator
    confirmSpectatorBtn.addEventListener('click', handleJoinAsSpectator);
}

// ===== LOGIN LOGIC =====

async function handleLogin(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        await window.authManager.login(username, password);
        showTablesSection();
    } catch (error) {
        alert(window.i18n.t('msg.loginError') + ' ' + error.message);
    }
}

function handleLogout() {
    if (confirm(window.i18n.t('msg.logoutConfirm'))) {
        const user = window.authManager.getCurrentUser();
        
        // Изчистваме текущата селекция
        const selection = window.tableManager.getCurrentSelection();
        if (selection.tableId) {
            if (selection.role === 'spectator') {
                // Премахваме от списъка с наблюдатели
                window.tableManager.leaveAsSpectator(selection.tableId, user.username);
            } else if (selection.position) {
                // Освобождаваме позицията
                window.tableManager.leavePosition(selection.tableId, selection.position);
            }
        }
        
        window.authManager.logout();
        showLoginSection();
    }
}

// ===== SECTION SWITCHING =====

function showLoginSection() {
    loginSection.classList.remove('hidden');
    tablesSection.classList.add('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
}

function showTablesSection() {
    const user = window.authManager.getCurrentUser();
    if (user) {
        usernameDisplay.textContent = user.username;
        loginSection.classList.add('hidden');
        tablesSection.classList.remove('hidden');
        renderTables();
    }
}

// ===== TABLE RENDERING =====

function renderTables() {
    const tables = window.tableManager.getAllTables();
    tablesList.innerHTML = '';

    if (tables.length === 0) {
        tablesList.innerHTML = `<p style="text-align: center; color: #666;" data-i18n="lobby.noTables">${window.i18n.t('lobby.noTables')}</p>`;
        return;
    }

    tables.forEach(table => {
        const tableCard = createTableCard(table);
        tablesList.appendChild(tableCard);
    });
}

function createTableCard(table) {
    const card = document.createElement('div');
    const isFull = window.tableManager.isTableFull(table.id);
    const availableSeats = window.tableManager.getAvailableSeats(table.id);
    const spectatorCount = table.spectators ? table.spectators.length : 0;
    const hasSpectators = spectatorCount > 0;
    
    card.className = 'table-card' + (isFull ? ' full' : '');
    
    card.innerHTML = `
        <div class="table-header">
            <div class="table-name">${escapeHtml(table.name)}</div>
            <div class="table-indicators">
                <div class="spectator-indicator ${hasSpectators ? 'active' : ''}" 
                     title="${hasSpectators ? window.i18n.t('table.spectators') + ': ' + table.spectators.join(', ') : window.i18n.t('table.noSpectators')}">
                    <span class="indicator-icon">👁️</span>
                    ${spectatorCount > 0 ? `<span class="indicator-count">${spectatorCount}</span>` : ''}
                </div>
                <div class="table-status ${isFull ? 'full' : 'waiting'}">
                    ${isFull ? window.i18n.t('table.full') : `${availableSeats} ${window.i18n.t('table.seats')}`}
                </div>
            </div>
        </div>
        <div class="table-players">
            ${renderPositions(table)}
        </div>
        <div class="table-actions">
            ${!isFull ? `<button class="btn-join" data-table-id="${table.id}">${window.i18n.t('table.join')}</button>` : 
                       `<button class="btn-join" disabled>${window.i18n.t('table.tableFull')}</button>`}
        </div>
    `;

    // Event listener за присъединяване
    const joinBtn = card.querySelector('.btn-join');
    if (joinBtn && !isFull) {
        joinBtn.addEventListener('click', () => openPositionModal(table));
    }

    return card;
}

function renderPositions(table) {
    const positions = ['NORTH', 'WEST', 'EAST', 'SOUTH'];
    const labels = {
        NORTH: window.i18n.t('position.north'),
        SOUTH: window.i18n.t('position.south'),
        EAST: window.i18n.t('position.east'),
        WEST: window.i18n.t('position.west')
    };

    return positions.map(pos => {
        const player = table.positions[pos];
        const isEmpty = player === null;
        
        return `
            <div class="player-slot ${isEmpty ? 'empty' : ''}">
                <span class="position-label">${labels[pos]}:</span>
                <span class="player-name-slot">${isEmpty ? window.i18n.t('modal.empty') : escapeHtml(player)}</span>
            </div>
        `;
    }).join('');
}

// ===== POSITION MODAL =====

function openPositionModal(table) {
    selectedTableId = table.id;
    modalTableName.textContent = table.name;
    selectedRole = 'player'; // Default

    // Попълваме позициите
    updateModalPositions(table);
    
    // Показваме player режим
    showPlayerMode();

    // Показваме modal
    positionModal.classList.remove('hidden');
}

function handleRoleSelect(role) {
    selectedRole = role;
    
    // Актуализира активния бутон
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.role === role);
    });
    
    // Показва съответния режим
    if (role === 'player') {
        showPlayerMode();
    } else {
        showSpectatorMode();
    }
}

function showPlayerMode() {
    playerPositionsDiv.classList.remove('hidden');
    spectatorModeDiv.classList.add('hidden');
    
    const table = window.tableManager.getTable(selectedTableId);
    if (table) {
        updateModalPositions(table);
    }
}

function showSpectatorMode() {
    playerPositionsDiv.classList.add('hidden');
    spectatorModeDiv.classList.remove('hidden');
}

function updateModalPositions(table) {
    const positions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
    const labels = {
        NORTH: window.i18n.t('modal.position.north'),
        SOUTH: window.i18n.t('modal.position.south'),
        EAST: window.i18n.t('modal.position.east'),
        WEST: window.i18n.t('modal.position.west')
    };
    
    positions.forEach(pos => {
        const btn = document.querySelector(`[data-position="${pos}"]`);
        const posNameEl = btn.querySelector('.position-name');
        const playerNameEl = btn.querySelector('.player-name');
        const player = table.positions[pos];

        // Актуализира лейбъла
        posNameEl.textContent = labels[pos];

        if (player) {
            playerNameEl.textContent = `${window.i18n.t('modal.taken')} ${escapeHtml(player)}`;
            btn.disabled = true;
        } else {
            playerNameEl.textContent = window.i18n.t('modal.empty');
            btn.disabled = false;
            
            // Event listener
            btn.onclick = () => handleJoinPosition(pos);
        }
    });
}

function closePositionModal() {
    positionModal.classList.add('hidden');
    selectedTableId = null;
}

async function handleJoinPosition(position) {
    const user = window.authManager.getCurrentUser();
    if (!user) {
        alert(window.i18n.t('msg.error') + ' ' + 'Not logged in');
        return;
    }

    try {
        window.tableManager.joinPosition(selectedTableId, position, user.username, 'player');
        
        // Затваряме modal
        closePositionModal();
        
        // Показваме съобщение
        alert(`${window.i18n.t('msg.joinSuccess')} ${position}!`);
        
        // Обновяваме списъка с маси
        renderTables();
        
        // Пренасочваме към играта след 1 секунда
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        alert(window.i18n.t('msg.error') + ' ' + error.message);
    }
}

async function handleJoinAsSpectator() {
    const user = window.authManager.getCurrentUser();
    if (!user) {
        alert(window.i18n.t('msg.error') + ' ' + 'Not logged in');
        return;
    }

    try {
        window.tableManager.joinAsSpectator(selectedTableId, user.username);
        
        // Затваряме modal
        closePositionModal();
        
        // Показваме съобщение
        alert(window.i18n.t('msg.joinSuccessSpectator'));
        
        // Обновяваме списъка с маси
        renderTables();
        
        // Пренасочваме към играта след 1 секунда
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        alert(window.i18n.t('msg.error') + ' ' + error.message);
    }
}

// ===== CREATE TABLE =====

function handleCreateTable() {
    const tableName = prompt(window.i18n.t('msg.enterTableName'));
    if (tableName && tableName.trim() !== '') {
        window.tableManager.createTable(tableName.trim());
        renderTables();
    }
}

// ===== UTILITY =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
