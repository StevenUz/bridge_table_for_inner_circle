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
        console.log('========== clearAllCards() called ==========');
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        positions.forEach(position => {
            // Чиства Player View
            const containerId = `${position.toLowerCase()}-cards`;
            const container = document.getElementById(containerId);
            if (container) {
                const cardsBefore = container.querySelectorAll('.card').length;
                // Премахваме всички дъчерни елементи един по един за гарантия
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                const cardsAfter = container.querySelectorAll('.card').length;
                console.log(`  Player View ${containerId}: ${cardsBefore} → ${cardsAfter} cards`);
            } else {
                console.warn(`  ⚠️ Player View ${containerId}: NOT FOUND`);
            }

            // Чиства Spectator View
            const spectatorContainerId = `${position.toLowerCase()}-cards-spectator`;
            const spectatorContainer = document.getElementById(spectatorContainerId);
            if (spectatorContainer) {
                const cardsBefore = spectatorContainer.querySelectorAll('.card').length;
                // Премахваме всички дъчерни елементи един по един за гарантия
                while (spectatorContainer.firstChild) {
                    spectatorContainer.removeChild(spectatorContainer.firstChild);
                }
                const cardsAfter = spectatorContainer.querySelectorAll('.card').length;
                console.log(`  Spectator View ${spectatorContainerId}: ${cardsBefore} → ${cardsAfter} cards`);
            } else {
                console.warn(`  ⚠️ Spectator View ${spectatorContainerId}: NOT FOUND`);
            }
        });
        this.cardElements = {};
        console.log('========== clearAllCards() complete ==========\n');
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

        console.log(`displayPlayerCardsAsBack: Clearing ${containerId}`);
        container.innerHTML = '';

        if (!numberOfCards || numberOfCards === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Няма карти</p>';
            return;
        }

        console.log(`displayPlayerCardsAsBack: Adding ${numberOfCards} card backs to ${containerId}`);

        // За West и East (вертикално подреждане), показваме гръбчетата в обратен ред
        // което е еквивалентно на показване на картите с най-силните отгоре
        for (let i = 0; i < numberOfCards; i++) {
            // За West и East, добави в обратен ред (от 0 до numberOfCards-1, но покази обратно)
            const index = (position === 'WEST' || position === 'EAST') ? (numberOfCards - 1 - i) : i;
            const cardBack = this.createCardBackElement(deckColor);
            container.appendChild(cardBack);
        }
    },

    /**
     * Визуализира картите на играч в Player View
     * За SOUTH показва реални карти, за други показва гръбчета
     */
    displayPlayerCardsPlayerView(position, cards, deckColor = 'blue') {
        console.log(`displayPlayerCardsPlayerView called for ${position}, ${cards ? cards.length : 0} cards`);
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

        console.log(`displayPlayerCards: Clearing ${containerId}`);
        container.innerHTML = '';

        if (!cards || cards.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Няма карти</p>';
            return;
        }

        console.log(`displayPlayerCards: Adding ${cards.length} cards to ${containerId}`);

        // За West и East (вертикално подреждане), обръщаме реда на картите
        // така че най-силните (A, K, Q) да са отгоре
        let cardsToDisplay = cards;
        if (position === 'WEST' || position === 'EAST') {
            cardsToDisplay = [...cards].reverse();
        }

        cardsToDisplay.forEach(card => {
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

        // ГАРАНТИРАМЕ че контейнерът е чист преди да добавяме
        console.log(`\n>>> displayPlayerCardsSpectator: Processing ${position}`);
        const beforeChildren = container.children.length;
        const beforeCards = container.querySelectorAll('.card').length;
        console.log(`    Before clear: ${beforeCards} card elements, ${beforeChildren} total children`);
        
        // Премахваме всички дъчерни елементи един по един за абсолютна гарантия
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        const afterChildren = container.children.length;
        const afterCards = container.querySelectorAll('.card').length;
        console.log(`    After clear: ${afterCards} card elements, ${afterChildren} total children`);

        if (!cards || cards.length === 0) {
            const p = document.createElement('p');
            p.style.textAlign = 'center';
            p.style.color = '#aaa';
            p.textContent = 'Няма карти';
            container.appendChild(p);
            console.log(`    ${position}: No cards to display`);
            return;
        }

        console.log(`    Adding ${cards.length} cards to ${position}`);
        console.log(`    Cards: ${cards.map(c => `${c.rank}${c.suit}`).join(', ')}`);

        // За West и East (вертикално подреждане), обръщаме реда на картите
        let cardsToDisplay = cards;
        if (position === 'WEST' || position === 'EAST') {
            cardsToDisplay = [...cards].reverse();
        }

        let addedCount = 0;
        cardsToDisplay.forEach((card, idx) => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
            addedCount++;
        });
        
        const cardsInDOM = container.querySelectorAll('.card').length;
        console.log(`<<< ${position} complete - Added ${addedCount} elements, DOM has ${cardsInDOM} card elements\n`);
        
        if (cardsInDOM !== addedCount) {
            console.error(`    ⚠️ MISMATCH: Added ${addedCount} but DOM has ${cardsInDOM}!`);
        }
    },

    /**
     * Визуализира всички играчи и техните карти
     */
    displayAllPlayers(deckColor = 'blue') {
        console.log(`displayAllPlayers called with deckColor=${deckColor}`);
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];

        positions.forEach(position => {
            console.log(`Processing position: ${position}`);
            const hand = PlayerManager.getPlayerHand(position);
            console.log(`Hand for ${position}:`, hand ? hand.length : 0, 'cards');
            this.displayPlayerCardsPlayerView(position, hand, deckColor);
        });
    },

    /**
     * Визуализира всички играчи в Spectator режим
     */
    displayAllPlayersSpectator() {
        console.log(`\n>>> displayAllPlayersSpectator() called`);
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];

        positions.forEach(position => {
            const hand = PlayerManager.getPlayerHand(position);
            console.log(`  ${position}: ${hand ? hand.length : 0} карти в ръката`);
            this.displayPlayerCardsSpectator(position, hand);
        });
        console.log('>>> displayAllPlayersSpectator() complete\n');
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
     * DEBUG: Проверява дублирани карти в Spectator режим
     */
    checkForDuplicatesSpectator() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        console.log('=== CHECKING FOR DUPLICATES IN SPECTATOR MODE ===');
        
        positions.forEach(position => {
            const containerId = `${position.toLowerCase()}-cards-spectator`;
            const container = document.getElementById(containerId);
            
            if (!container) {
                console.log(`${position}: Container not found!`);
                return;
            }
            
            const cardElements = container.querySelectorAll('.card');
            console.log(`\n${position}: Брой карт елементи в DOM: ${cardElements.length}`);
            
            // Събира всички карти да видя дали има дублирани
            const cards = [];
            cardElements.forEach((elem, index) => {
                const rankSpans = elem.querySelectorAll('.card-rank');
                const suitSpans = elem.querySelectorAll('.card-suit');
                
                if (rankSpans.length > 0 && suitSpans.length > 0) {
                    const rank = rankSpans[0].textContent.trim();
                    const suit = suitSpans[0].textContent.trim();
                    const cardKey = `${rank}${suit}`;
                    cards.push(cardKey);
                    console.log(`  [${index}] ${cardKey}`);
                }
            });
            
            // Проверя дублирани
            const duplicates = cards.filter((card, index) => cards.indexOf(card) !== index);
            if (duplicates.length > 0) {
                console.warn(`  ⚠️ ДУБЛИРАНИ КАРТИ: ${[...new Set(duplicates)].join(', ')}`);
            } else {
                console.log(`  ✓ Няма дублирани карти`);
            }
        });
        console.log('=== END DUPLICATE CHECK ===\n');
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
