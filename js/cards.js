// cards.js - Управление на картите

/**
 * Клас за представяне на една карта
 */
class Card {
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }

    /**
     * Връща номерицата на картата за сортиране
     */
    getValue() {
        const rankValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return rankValues[this.rank];
    }

    /**
     * Връща уникален идентификатор за картата
     */
    getId() {
        return `${this.rank}${this.suit}`;
    }

    /**
     * ВръщаDisplayable текст за картата
     */
    getDisplayText() {
        return `${this.rank}${this.suit}`;
    }
}

/**
 * Клас за управление на тестето
 */
class Deck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
    }

    /**
     * Инициализира ново тесте с 52 карти
     */
    initializeDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        this.cards = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                this.cards.push(new Card(rank, suit));
            }
        }
    }

    /**
     * Разбърква тестето
     */
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    /**
     * Раздава N карти от тестето
     */
    deal(numberOfCards) {
        if (numberOfCards > this.cards.length) {
            throw new Error('Не е възможно раздаване - недостатъчно карти');
        }
        return this.cards.splice(0, numberOfCards);
    }

    /**
     * Връща останалия брой карти в тестето
     */
    getRemainingCount() {
        return this.cards.length;
    }

    /**
     * Сортира карти по костюм, като костюмите се чередуват по цвят
     * Ред: ♠ (черен) → ♥ (червен) → ♣ (черен) → ♦ (червен)
     * Картите в рамките на всеки костюм са сортирани по сила
     */
    static sortCards(cards) {
        // Разделяме по костюм и сортираме по сила (от най-малка към най-голяма)
        const spades = cards.filter(c => c.suit === '♠').sort((a, b) => a.getValue() - b.getValue());
        const hearts = cards.filter(c => c.suit === '♥').sort((a, b) => a.getValue() - b.getValue());
        const clubs = cards.filter(c => c.suit === '♣').sort((a, b) => a.getValue() - b.getValue());
        const diamonds = cards.filter(c => c.suit === '♦').sort((a, b) => a.getValue() - b.getValue());

        // Подреждаме костюмите: черен-червен-черен-червен
        // ♠ → ♥ → ♣ → ♦
        return [...spades, ...hearts, ...clubs, ...diamonds];
    }
}

/**
 * Глобален обект за управление на игровата логика с карти
 */
const CardManager = {
    deck: null,

    /**
     * Инициализира нов deck
     */
    createNewDeck() {
        this.deck = new Deck();
        return this.deck;
    },

    /**
     * Разбърква и раздава карти на 4 играчи (13 карти на всеки)
     */
    dealToPlayers() {
        if (!this.deck) {
            this.createNewDeck();
        }

        this.deck.initializeDeck();
        this.deck.shuffle();

        const distribution = {
            'SOUTH': Deck.sortCards(this.deck.deal(13)),
            'WEST': Deck.sortCards(this.deck.deal(13)),
            'NORTH': Deck.sortCards(this.deck.deal(13)),
            'EAST': Deck.sortCards(this.deck.deal(13))
        };

        return distribution;
    },

    /**
     * Сортира карти по костюм и номер
     */
    sortCards(cards) {
        return Deck.sortCards(cards);
    },

    /**
     * Изчислява точките в ръка
     * Асо - 4 точки, Поп (K) - 3 точки, Дама (Q) - 2 точки, Вале (J) - 1 точка
     */
    calculatePoints(cards) {
        if (!cards || cards.length === 0) {
            return 0;
        }

        let points = 0;
        cards.forEach(card => {
            switch (card.rank) {
                case 'A':
                    points += 4;
                    break;
                case 'K':
                    points += 3;
                    break;
                case 'Q':
                    points += 2;
                    break;
                case 'J':
                    points += 1;
                    break;
            }
        });

        return points;
    }
};
