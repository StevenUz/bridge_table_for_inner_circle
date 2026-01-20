// main.js - Главна логика и инициализация

/**
 * Главен обект за контрол на играта
 */
const Game = {
    initialized: false,
    currentTable: null,
    currentPosition: null,
    currentUser: null,

    /**
     * Инициализира играта
     */
    init() {
        if (this.initialized) return;

        // Инициализира език
        this.initializeLanguage();

        // Проверка дали има потребител и маса/позиция
        this.checkAuthAndTable();

        CardManager.init();
        UIManager.init();
        PlayerManager.createPlayers();
        this.attachEventListeners();
        this.initialized = true;

        console.log('Играта е инициализирана успешно');
    },

    /**
     * Инициализира езиковата система
     */
    initializeLanguage() {
        // Добавя селектор за език в game header
        const langSelectorContainer = document.getElementById('game-language-selector-container');
        if (langSelectorContainer) {
            const langSelector = window.i18n.createLanguageSelector();
            langSelectorContainer.appendChild(langSelector);
        }
        
        // Subscribe за промени в езика
        window.i18n.subscribe((lang) => {
            console.log('Language changed in game, updating translations...');
            window.i18n.updatePageTranslations();
            this.updateGameInfo(); // Обновява информацията
        });
        
        // Първоначална актуализация на преводите
        window.i18n.updatePageTranslations();
    },

    /**
     * Проверява дали има валидна сесия
     */
    checkAuthAndTable() {
        // Проверка за автентикация
        if (!window.authManager.isLoggedIn()) {
            console.warn('Няма влязъл потребител - пренасочване към lobby');
            window.location.href = 'lobby.html';
            return;
        }

        this.currentUser = window.authManager.getCurrentUser();

        // Проверка за маса и позиция
        const selection = window.tableManager.getCurrentSelection();
        if (!selection.tableId) {
            console.warn('Няма избрана маса - пренасочване към lobby');
            window.location.href = 'lobby.html';
            return;
        }

        this.currentTable = window.tableManager.getTable(selection.tableId);
        this.currentPosition = selection.position;
        this.currentRole = selection.role || 'player';

        // Актуализира UI с информация
        this.updateGameInfo();
    },

    /**
     * Актуализира информацията за масата и играча
     */
    updateGameInfo() {
        const tableInfoEl = document.getElementById('current-table');
        const positionInfoEl = document.getElementById('current-position');
        const roleInfoEl = document.getElementById('current-role');
        const southLabelEl = document.getElementById('south-label');

        if (tableInfoEl && this.currentTable) {
            tableInfoEl.textContent = this.currentTable.name;
        }

        if (positionInfoEl) {
            if (this.currentRole === 'spectator') {
                positionInfoEl.textContent = '-';
            } else if (this.currentPosition) {
                positionInfoEl.textContent = this.currentPosition;
            }
        }

        if (roleInfoEl) {
            const roleText = this.currentRole === 'spectator' 
                ? window.i18n.t('game.spectator') 
                : window.i18n.t('game.player');
            roleInfoEl.textContent = roleText;
        }

        if (southLabelEl && this.currentUser) {
            if (this.currentRole === 'spectator') {
                // За наблюдател показваме просто името
                southLabelEl.textContent = `${window.i18n.t('game.spectator')} (${this.currentUser.username})`;
            } else if (this.currentPosition) {
                // Показваме реалната позиция на играча
                southLabelEl.textContent = `${this.currentPosition} (${this.currentUser.username})`;
            }
        }
    },

    /**
     * Прикачва event listeners
     */
    attachEventListeners() {
        const dealButton = document.getElementById('deal-button');
        if (dealButton) {
            dealButton.addEventListener('click', () => this.dealNewGame());
        }

        // Бутон за връщане към lobby
        const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
        if (backToLobbyBtn) {
            backToLobbyBtn.addEventListener('click', () => this.returnToLobby());
        }
    },

    /**
     * Връща към lobby
     */
    returnToLobby() {
        if (confirm(window.i18n.t('msg.backToLobbyConfirm'))) {
            window.location.href = 'lobby.html';
        }
    },

    /**
     * Раздава нова игра
     */
    dealNewGame() {
        console.log('\n\n╔════════════════════════════════════════╗');
        console.log('║      DEAL NEW GAME - START');
        console.log('╚════════════════════════════════════════╝');
        
        UIManager.clearAllCards();
        UIManager.setDealButtonState(false);
        UIManager.showStatus('Раздавам карти...');

        // Симулира малка забавка за по-добър UX
        setTimeout(() => {
            try {
                console.log('► setTimeout callback - начало на раздаването');
                
                // Прочита последния използан цвят и алтернира за текущото раздаване
                const lastDeckColor = localStorage.getItem('lastDeckColor');
                if (lastDeckColor) {
                    CardManager.currentDeckColor = lastDeckColor === 'blue' ? 'red' : 'blue';
                } else {
                    CardManager.currentDeckColor = 'blue';
                }

                // Раздава картите
                const distribution = CardManager.dealToPlayers();

                // Задава картите на играчите
                PlayerManager.dealHands(distribution);

                // Изчислява точките за всеки играч
                const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
                positions.forEach(position => {
                    const hand = PlayerManager.getPlayerHand(position);
                    const points = CardManager.calculatePoints(hand);
                    PlayerManager.setPlayerPoints(position, points);
                });

                // Показва картите с текущия цвят на тестето
                const deckColor = CardManager.getDeckColor();
                
                // DEBUG: Показва картите преди визуализиране
                console.log('=== DEBUG: Преди displayAllPlayers ===');
                const debugCounts = UIManager.getCardCountByPosition();
                console.log('Брой карти:', debugCounts);
                const allDebugHands = {};
                ['SOUTH', 'WEST', 'NORTH', 'EAST'].forEach(pos => {
                    const hand = PlayerManager.getPlayerHand(pos);
                    allDebugHands[pos] = hand.length;
                });
                console.log('Размер на ръката:', allDebugHands);
                
                // Гарантираме че контейнерите са чисти преди показване
                console.log('Повторно очищаване преди показване на картите...');
                UIManager.clearAllCards();
                
                UIManager.displayAllPlayers(deckColor);

                // Показва картите и в Spectator режим
                UIManager.displayAllPlayersSpectator();

                // Показва точките на South в Player режим
                const southPoints = PlayerManager.getPlayerPoints('SOUTH');
                UIManager.displaySouthPoints(southPoints);

                // Показва точките на всички в Spectator режим
                UIManager.displayAllPointsSpectator();

                // Показва информация в конзолата
                const cardCounts = UIManager.getCardCountByPosition();
                const allPoints = PlayerManager.getAllPlayerPoints();
                console.log('=== Карти раздадени ===');
                console.log('SOUTH:', cardCounts.SOUTH, 'Точки:', allPoints.SOUTH);
                console.log('WEST:', cardCounts.WEST, 'Точки:', allPoints.WEST);
                console.log('NORTH:', cardCounts.NORTH, 'Точки:', allPoints.NORTH);
                console.log('EAST:', cardCounts.EAST, 'Точки:', allPoints.EAST);
                console.log('Текущо тесте:', deckColor);

                // Запазва текущия цвят за следващия път
                localStorage.setItem('lastDeckColor', deckColor);

                UIManager.showStatus('Карти раздадени успешно');
                
                console.log('\n✓ DEAL COMPLETE - Всички карти разиграни успешно');
                console.log('╔════════════════════════════════════════╗');
                console.log('║      DEAL NEW GAME - END');
                console.log('╚════════════════════════════════════════╝\n');
                
                // DEBUG: Проверяет за дублирани карти
                setTimeout(() => {
                    UIManager.checkForDuplicatesSpectator();
                }, 100);
                
                UIManager.setDealButtonState(true);
            } catch (error) {
                console.error('Грешка при раздаване:', error);
                UIManager.showStatus('Грешка при раздаване на картите');
                UIManager.setDealButtonState(true);
            }
        }, 300);
    }
};

/**
 * Инициализира играта при загрузване на страницата
 */
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
    console.log('Спортен Бридж - готово към игра');
});
