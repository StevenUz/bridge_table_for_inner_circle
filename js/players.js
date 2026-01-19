// players.js - Управление на играчите

/**
 * Клас за представяне на един играч
 */
class Player {
    constructor(name, position) {
        this.name = name;
        this.position = position; // 'SOUTH', 'WEST', 'NORTH', 'EAST'
        this.hand = [];
        this.points = 0; // Точки за текущата игра
    }

    /**
     * Задава ръката на играча
     */
    setHand(cards) {
        this.hand = cards || [];
    }

    /**
     * Връща картите на играча
     */
    getHand() {
        return this.hand;
    }

    /**
     * Връща брой карти в ръката
     */
    getCardCount() {
        return this.hand.length;
    }

    /**
     * Задава точките на играча
     */
    setPoints(points) {
        this.points = points;
    }

    /**
     * Връща точките на играча
     */
    getPoints() {
        return this.points;
    }

    /**
     * Нулира точките (при нова игра)
     */
    resetPoints() {
        this.points = 0;
    }

    /**
     * Сортира ръката на играча
     * Ред: ♠ (черен) → ♥ (червен) → ♣ (черен) → ♦ (червен)
     */
    sortHand() {
        const suitOrder = { '♠': 0, '♥': 1, '♣': 2, '♦': 3 };
        this.hand.sort((a, b) => {
            const suitDiff = suitOrder[a.suit] - suitOrder[b.suit];
            if (suitDiff !== 0) return suitDiff;
            return a.getValue() - b.getValue();
        });
    }

    /**
     * Връща информация за играча
     */
    getInfo() {
        return {
            name: this.name,
            position: this.position,
            cardCount: this.hand.length,
            points: this.points
        };
    }
}

/**
 * Класс за управление на групата от играчи
 */
class Players {
    constructor() {
        this.players = {
            'SOUTH': new Player('SOUTH', 'SOUTH'),
            'WEST': new Player('WEST', 'WEST'),
            'NORTH': new Player('NORTH', 'NORTH'),
            'EAST': new Player('EAST', 'EAST')
        };
    }

    /**
     * Задава ръката на всеки играч
     */
    dealHands(distribution) {
        for (const [position, cards] of Object.entries(distribution)) {
            this.players[position].setHand(cards);
            this.players[position].sortHand();
        }
    }

    /**
     * Връща конкретен играч по позиция
     */
    getPlayer(position) {
        return this.players[position];
    }

    /**
     * Връща всички играчи
     */
    getAllPlayers() {
        return this.players;
    }

    /**
     * Връща всички играчи като масив
     */
    getPlayersArray() {
        return Object.values(this.players);
    }

    /**
     * Връща информация за всички играчи
     */
    getPlayersInfo() {
        const info = {};
        for (const [position, player] of Object.entries(this.players)) {
            info[position] = player.getInfo();
        }
        return info;
    }

    /**
     * Връща статистика по костюм за играч
     */
    getPlayerSuitDistribution(position) {
        const player = this.players[position];
        const distribution = { '♠': [], '♥': [], '♦': [], '♣': [] };

        for (const card of player.getHand()) {
            distribution[card.suit].push(card);
        }

        return distribution;
    }
}

/**
 * Глобален обект за управление на играчите
 */
const PlayerManager = {
    players: null,

    /**
     * Инициализира новa група от играчи
     */
    createPlayers() {
        this.players = new Players();
        return this.players;
    },

    /**
     * Разпределя картите между играчите
     */
    dealHands(distribution) {
        if (!this.players) {
            this.createPlayers();
        }
        this.players.dealHands(distribution);
        return this.players;
    },

    /**
     * Връща конкретен играч
     */
    getPlayer(position) {
        return this.players ? this.players.getPlayer(position) : null;
    },

    /**
     * Връща всички играчи
     */
    getAllPlayers() {
        return this.players ? this.players.getAllPlayers() : {};
    },

    /**
     * Връща картите на конкретен играч
     */
    getPlayerHand(position) {
        const player = this.getPlayer(position);
        return player ? player.getHand() : [];
    },

    /**
     * Задава точките на конкретен играч
     */
    setPlayerPoints(position, points) {
        const player = this.getPlayer(position);
        if (player) {
            player.setPoints(points);
        }
    },

    /**
     * Връща точките на конкретен играч
     */
    getPlayerPoints(position) {
        const player = this.getPlayer(position);
        return player ? player.getPoints() : 0;
    },

    /**
     * Връща точките на всички играчи
     */
    getAllPlayerPoints() {
        const points = {};
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        positions.forEach(position => {
            points[position] = this.getPlayerPoints(position);
        });
        return points;
    },

    /**
     * Нулира точките на всички играчи (при нова игра)
     */
    resetAllPoints() {
        const positions = ['SOUTH', 'WEST', 'NORTH', 'EAST'];
        positions.forEach(position => {
            const player = this.getPlayer(position);
            if (player) {
                player.resetPoints();
            }
        });
    }
};
