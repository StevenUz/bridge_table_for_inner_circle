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

        // Актуализира всички позиции според ролята
        this.updatePositionLabels();

        // Конфигурира UI според ролята
        this.configureUIForRole();
    },

    /**
     * Актуализира имената на позициите
     */
    updatePositionLabels() {
        if (this.currentRole === 'spectator') {
            // За наблюдател показваме имената на играчите на всички позиции
            const positions = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
            positions.forEach(pos => {
                const labelEl = document.getElementById(`${pos.toLowerCase()}-label`);
                if (labelEl && this.currentTable) {
                    const playerName = this.currentTable.positions[pos];
                    if (playerName) {
                        labelEl.textContent = `${pos} (${playerName})`;
                    } else {
                        labelEl.textContent = `${pos} (${window.i18n.t('modal.empty')})`;
                    }
                }
            });
        } else {
            // За играч ротираме позициите според неговата позиция
            const rotationMap = this.getRotatedPositions(this.currentPosition || 'SOUTH');
            
            ['NORTH', 'SOUTH', 'EAST', 'WEST'].forEach(screenPos => {
                const actualPos = rotationMap[screenPos];
                const labelEl = document.getElementById(`${screenPos.toLowerCase()}-label`);
                
                if (labelEl && this.currentTable) {
                    const playerName = this.currentTable.positions[actualPos];
                    
                    if (actualPos === this.currentPosition && this.currentUser) {
                        // Текущата позиция на играча (винаги се показва долу)
                        labelEl.textContent = `${actualPos} (${this.currentUser.username})`;
                    } else if (playerName) {
                        // Други позиции с играчи
                        labelEl.textContent = `${actualPos} (${playerName})`;
                    } else {
                        // Празни позиции
                        labelEl.textContent = `${actualPos} (${window.i18n.t('modal.empty')})`;
                    }
                }
            });
        }

        // Обновяваме индикатора за наблюдатели
        this.updateSpectatorIndicator();
    },

    updateSpectatorIndicator() {
        const indicator = document.getElementById('table-spectator-indicator');
        const countElement = document.getElementById('spectator-count');
        
        if (!indicator || !countElement || !this.currentTable) return;

        const spectators = this.currentTable.spectators || [];
        const spectatorCount = spectators.length;
        const hasSpectators = spectatorCount > 0;

        // Обновяваме състоянието
        if (hasSpectators) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }

        // Обновяваме броя
        countElement.textContent = spectatorCount;

        // Обновяваме tooltip
        const tooltipText = hasSpectators 
            ? `${window.i18n.t('table.spectators')}: ${spectators.join(', ')}`
            : window.i18n.t('table.noSpectators');
        indicator.setAttribute('title', tooltipText);
    },

    /**
     * Връща mapping на позиции според това къде е текущият играч
     */
    getRotatedPositions(currentPlayerPosition) {
        const rotationMap = {
            'SOUTH': { SOUTH: 'SOUTH', WEST: 'WEST', NORTH: 'NORTH', EAST: 'EAST' },
            'WEST': { SOUTH: 'WEST', WEST: 'NORTH', NORTH: 'EAST', EAST: 'SOUTH' },
            'NORTH': { SOUTH: 'NORTH', WEST: 'EAST', NORTH: 'SOUTH', EAST: 'WEST' },
            'EAST': { SOUTH: 'EAST', WEST: 'SOUTH', NORTH: 'WEST', EAST: 'NORTH' }
        };
        
        return rotationMap[currentPlayerPosition] || rotationMap['SOUTH'];
    },

    /**
     * Конфигурира UI според ролята (Player vs Spectator)
     */
    configureUIForRole() {
        const dealButton = document.getElementById('deal-button');
        const backToLobbyBtn = document.getElementById('back-to-lobby-btn');

        if (this.currentRole === 'spectator') {
            // Spectator режим: не може да раздава, само да гледа
            if (dealButton) {
                dealButton.disabled = true;
                dealButton.style.opacity = '0.5';
                dealButton.style.cursor = 'not-allowed';
                dealButton.title = window.i18n.t('game.spectatorCannotDeal') || 'Наблюдателят не може да раздава карти';
            }

            // Променяме текста на бутона за връщане
            if (backToLobbyBtn) {
                backToLobbyBtn.innerHTML = window.i18n.t('game.leaveTable') || '← Напусни масата';
            }
        } else {
            // Player режим: може да раздава
            if (dealButton) {
                dealButton.disabled = false;
                dealButton.style.opacity = '1';
                dealButton.style.cursor = 'pointer';
                dealButton.title = '';
            }

            // Бутонът за player също се казва "Напусни масата"
            if (backToLobbyBtn) {
                backToLobbyBtn.innerHTML = window.i18n.t('game.leaveTable') || '← Напусни масата';
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
            // Освобождаваме позицията/spectator мястото преди да напуснем
            const selection = window.tableManager.getCurrentSelection();
            
            if (selection.tableId) {
                if (selection.role === 'spectator') {
                    // Премахваме от списъка с наблюдатели
                    window.tableManager.leaveAsSpectator(selection.tableId, this.currentUser.username);
                } else if (selection.position) {
                    // Освобождаваме позицията
                    window.tableManager.leavePosition(selection.tableId, selection.position);
                }
            }
            
            window.location.href = 'lobby.html';
        }
    },

    /**
     * Раздава нова игра
     */
    dealNewGame() {
        // Проверка дали потребителят е наблюдател
        if (this.currentRole === 'spectator') {
            alert(window.i18n.t('game.spectatorCannotDeal') || 'Наблюдателят не може да раздава карти!');
            return;
        }

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
                
                // Показваме картите според ролята и позицията
                const isSpectator = this.currentRole === 'spectator';
                const playerPosition = isSpectator ? 'SOUTH' : (this.currentPosition || 'SOUTH');
                UIManager.displayAllPlayers(deckColor, isSpectator, playerPosition);

                // Показва картите и в Spectator режим
                UIManager.displayAllPlayersSpectator();

                // Показва точките на текущия играч в Player режим
                const currentPlayerPoints = PlayerManager.getPlayerPoints(playerPosition);
                UIManager.displaySouthPoints(currentPlayerPoints);

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
