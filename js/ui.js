// ui.js - Управление на UI/визуализацията

/**
 * Обект за управление на потребителския интерфейс
 */
const UIManager = {
    cardElements: {},
    currentView: 'player', // 'player' или 'spectator'

    /**
     * Инициализира UI
     */
    init() {
        this.attachViewSwitchers();
    },

    /**
     * Прикачва event listeners за превключване на екраните
     */
    attachViewSwitchers() {
        const playerViewBtn = document.getElementById('player-view-btn');
        const spectatorViewBtn = document.getElementById('spectator-view-btn');

        if (playerViewBtn) {
            playerViewBtn.addEventListener('click', () => this.switchView('player'));
        }

        if (spectatorViewBtn) {
            spectatorViewBtn.addEventListener('click', () => this.switchView('spectator'));
        }
    },

    /**
     * Преключва между Player и Spectator изгледите
     */
    switchView(viewType) {
        this.currentView = viewType;

        // Намираме view елементите
        const playerView = document.getElementById('player-view');
        const spectatorView = document.getElementById('spectator-view');
        const playerViewBtn = document.getElementById('player-view-btn');
        const spectatorViewBtn = document.getElementById('spectator-view-btn');

        if (viewType === 'player') {
            playerView.classList.remove('hidden');
            spectatorView.classList.add('hidden');
            playerViewBtn.classList.add('active');
            spectatorViewBtn.classList.remove('active');
        } else {
            playerView.classList.add('hidden');
            spectatorView.classList.remove('hidden');
            playerViewBtn.classList.remove('active');
            spectatorViewBtn.classList.add('active');
            
            // Ако вече има раздадени карти, показваме ги и в spectator режим
            this.displayAllPlayersSpectator();
            this.displayAllPointsSpectator();
        }
    },

    /**
     * Чиства всички карти от UI
     */
    clearAllCards() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        positions.forEach(position => {
            // Чиства Player View
            const containerId = `${position.toLowerCase()}-cards`;
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }

            // Чиства Spectator View
            const spectatorContainerId = `${position.toLowerCase()}-cards-spectator`;
            const spectatorContainer = document.getElementById(spectatorContainerId);
            if (spectatorContainer) {
                spectatorContainer.innerHTML = '';
            }
        });
        this.cardElements = {};
    },

    /**
     * Визуализира карта в DOM
     */
    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${this.getSuitClass(card.suit)}`;
        cardDiv.title = `${card.rank}${card.suit}`;

        // Горен ляв ъгъл
        const topLeft = document.createElement('span');
        topLeft.className = 'card-corner top-left';
        topLeft.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;

        // Горен десен ъгъл (еднаква ориентация)
        const topRight = document.createElement('span');
        topRight.className = 'card-corner top-right';
        topRight.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;

        // Средина - голям костюм
        const center = document.createElement('span');
        center.className = 'card-center';
        center.textContent = card.suit;

        // Долен ляв ъгъл (обърнат)
        const bottomLeft = document.createElement('span');
        bottomLeft.className = 'card-corner bottom-left';
        bottomLeft.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;

        // Долен десен ъгъл (обърнат)
        const bottomRight = document.createElement('span');
        bottomRight.className = 'card-corner bottom-right';
        bottomRight.innerHTML = `<span class="rank">${card.rank}</span><span class="suit">${card.suit}</span>`;

        cardDiv.appendChild(topLeft);
        cardDiv.appendChild(topRight);
        cardDiv.appendChild(center);
        cardDiv.appendChild(bottomLeft);
        cardDiv.appendChild(bottomRight);

        return cardDiv;
    },

    /**
     * Връща CSS класа за костюма
     */
    getSuitClass(suit) {
        const suitClasses = {
            '♠': 'spades',
            '♥': 'hearts',
            '♦': 'diamonds',
            '♣': 'clubs'
        };
        return suitClasses[suit] || '';
    },

    /**
     * Създава елемент за гръб на карта с определен цвят
     */
    createCardBackElement(color = 'blue') {
        const cardDiv = document.createElement('div');
        cardDiv.className = `card card-back ${color === 'red' ? 'red' : ''}`;
        return cardDiv;
    },

    /**
     * Визуализира гръбчета на карти за позиция (скрива картите)
     */
    displayPlayerCardsAsBack(position, numberOfCards, deckColor = 'blue') {
        const containerId = `${position.toLowerCase()}-cards`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container not found for ${position}`);
            return;
        }

        container.innerHTML = '';

        if (!numberOfCards || numberOfCards === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Няма карти</p>';
            return;
        }

        for (let i = 0; i < numberOfCards; i++) {
            const cardBack = this.createCardBackElement(deckColor);
            container.appendChild(cardBack);
        }
    },

    /**
     * Визуализира картите на играч в Player View
     * За SOUTH показва реални карти, за други показва гръбчета
     */
    displayPlayerCardsPlayerView(position, cards, deckColor = 'blue') {
        if (position === 'SOUTH') {
            // Показва реални карти за South
            this.displayPlayerCards(position, cards);
        } else {
            // Показва гръбчета за другите играчи
            const numberOfCards = cards ? cards.length : 0;
            this.displayPlayerCardsAsBack(position, numberOfCards, deckColor);
        }
    },

    /**
     * Визуализира картите на играч
     */
    displayPlayerCards(position, cards) {
        const containerId = `${position.toLowerCase()}-cards`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Container not found for ${position}`);
            return;
        }

        container.innerHTML = '';

        if (!cards || cards.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Няма карти</p>';
            return;
        }

        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    },

    /**
     * Визуализира картите на играч в Spectator режим
     */
    displayPlayerCardsSpectator(position, cards) {
        const containerId = `${position.toLowerCase()}-cards-spectator`;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Spectator container not found for ${position}`);
            return;
        }

        container.innerHTML = '';

        if (!cards || cards.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Няма карти</p>';
            return;
        }

        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    },

    /**
     * Визуализира всички играчи и техните карти
     */
    displayAllPlayers(deckColor = 'blue') {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];

        positions.forEach(position => {
            const hand = PlayerManager.getPlayerHand(position);
            this.displayPlayerCardsPlayerView(position, hand, deckColor);
        });
    },

    /**
     * Визуализира всички играчи в Spectator режим
     */
    displayAllPlayersSpectator() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];

        positions.forEach(position => {
            const hand = PlayerManager.getPlayerHand(position);
            this.displayPlayerCardsSpectator(position, hand);
        });
    },

    /**
     * Добива броя карти за всяка позиция
     */
    getCardCountByPosition() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        const counts = {};

        positions.forEach(position => {
            const hand = PlayerManager.getPlayerHand(position);
            counts[position] = hand ? hand.length : 0;
        });

        return counts;
    },

    /**
     * Показва съобщение за статус
     */
    showStatus(message) {
        console.log(`[Status] ${message}`);
        // Можеш да добавиш визуално съобщение на екрана
    },

    /**
     * Активира/деактивира бутона за раздаване
     */
    setDealButtonState(enabled) {
        const button = document.getElementById('deal-button');
        if (button) {
            button.disabled = !enabled;
        }

        // Също и в Spectator режим
        const spectatorButton = document.getElementById('deal-button-spectator');
        if (spectatorButton) {
            spectatorButton.disabled = !enabled;
        }
    },

    /**
     * Показва точките на South в Player режим
     */
    displaySouthPoints(points) {
        // Намираме контейнера на South
        const southSection = document.querySelector('#player-view .player-south');
        if (!southSection) return;

        // Намираме или създаваме елемент за точките
        let pointsElement = southSection.querySelector('.player-points');
        if (!pointsElement) {
            pointsElement = document.createElement('div');
            pointsElement.className = 'player-points';
            // Поставяме го след player-header
            const header = southSection.querySelector('.player-header');
            if (header) {
                header.insertAdjacentElement('afterend', pointsElement);
            }
        }

        // Обновяваме текста
        pointsElement.innerHTML = `<strong>Точки: ${points}</strong>`;
    },

    /**
     * Показва точките на всички играчи в Spectator режим
     */
    displayAllPointsSpectator() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];

        positions.forEach(position => {
            const points = PlayerManager.getPlayerPoints(position);
            const pointsElement = document.getElementById(`${position.toLowerCase()}-points-spectator`);
            if (pointsElement) {
                pointsElement.innerHTML = `Точки: <strong>${points}</strong>`;
            }
        });
    },

    /**
     * Скрива точките на South
     */
    hideSouthPoints() {
        const pointsElement = document.querySelector('.player-south .player-points');
        if (pointsElement) {
            pointsElement.innerHTML = '';
        }
    }
};
