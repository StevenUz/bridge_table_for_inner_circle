// ui.js - Управление на UI/визуализацията

/**
 * Обект за управление на потребителския интерфейс
 */
const UIManager = {
    cardElements: {},

    /**
     * Чиства всички карти от UI
     */
    clearAllCards() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        positions.forEach(position => {
            const containerId = `${position.toLowerCase()}-cards`;
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
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

        const rankSpan = document.createElement('span');
        rankSpan.className = 'card-rank';
        rankSpan.textContent = card.rank;

        const suitSpan = document.createElement('span');
        suitSpan.className = 'card-suit';
        suitSpan.textContent = card.suit;

        cardDiv.appendChild(rankSpan);
        cardDiv.appendChild(suitSpan);

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
     * Визуализира всички играчи и техните карти
     */
    displayAllPlayers() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];

        positions.forEach(position => {
            const hand = PlayerManager.getPlayerHand(position);
            this.displayPlayerCards(position, hand);
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
    }
};
