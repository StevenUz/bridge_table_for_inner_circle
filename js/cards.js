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
     * Ред: черни (♠, ♣) → червени (♥, ♦), чередуващ се
     * Целта е да не имаме два костюма от един цвят един до друг (освен ако целия цвят липсва)
     */
    static sortCards(cards) {
        if (!cards || cards.length === 0) {
            console.log('sortCards: No cards to sort');
            return cards;
        }

        console.log(`sortCards INPUT: ${cards.length} cards:`, cards.map(c => c.rank + c.suit).join(', '));

        // Стандартен редовен ред на костюмите
        const suitOrder = ['♠', '♣', '♥', '♦'];
        
        // Намери какви костюми са налични (в редовия ред)
        const presentSuits = suitOrder.filter(suit => cards.some(c => c.suit === suit));
        console.log(`Present suits: ${presentSuits.join(', ')}`);

        // Разделяй на черни и червени костюми (запазвай техния редовен ред)
        // ♠, ♣ са черни; ♥, ♦ са червени
        const blackSuits = [];
        const redSuits = [];
        
        // Вземи костюмите в техния редовен ред
        for (const suit of presentSuits) {
            if (suit === '♠' || suit === '♣') {
                blackSuits.push(suit);
            } else {
                redSuits.push(suit);
            }
        }
        
        console.log(`Black suits: ${blackSuits.join(', ')}, Red suits: ${redSuits.join(', ')}`);

        // Чередуване за визуално разделение
        // ПРАВИЛО: Разделяме костюми от ЕДИН цвят с костюми от ДРУГ цвят
        let finalOrder = [];
        
        if (blackSuits.length > 0 && redSuits.length > 0) {
            const maxLength = Math.max(blackSuits.length, redSuits.length);
            
            // Ако червените са повече, започни с червен (за да разделят черните)
            // Ако черните са повече или равни, започни с черен (за да разделят червените)
            const startWithRed = redSuits.length > blackSuits.length;
            
            for (let i = 0; i < maxLength; i++) {
                if (startWithRed) {
                    // Започни с червен: червен → черен → червен → черен...
                    if (i < redSuits.length) {
                        finalOrder.push(redSuits[i]);
                    }
                    if (i < blackSuits.length) {
                        finalOrder.push(blackSuits[i]);
                    }
                } else {
                    // Започни с черен: черен → червен → черен → червен...
                    if (i < blackSuits.length) {
                        finalOrder.push(blackSuits[i]);
                    }
                    if (i < redSuits.length) {
                        finalOrder.push(redSuits[i]);
                    }
                }
            }
        } else {
            // Ако всички от един цвят, просто ги подреди
            finalOrder = presentSuits;
        }

        console.log(`Final suit order after interleaving: ${finalOrder.join(', ')}`);

        // Подреди картите по костюм и сила
        const result = [];
        for (const suit of finalOrder) {
            const cardsOfSuit = cards.filter(c => c.suit === suit)
                .sort((a, b) => a.getValue() - b.getValue());
            console.log(`  Adding ${cardsOfSuit.length} cards of ${suit}`);
            result.push(...cardsOfSuit);
        }

        console.log(`sortCards OUTPUT: ${result.length} cards:`, result.map(c => c.rank + c.suit).join(', '));
        
        // Проверка за дублирани
        const cardKeys = result.map(c => c.rank + c.suit);
        const duplicates = cardKeys.filter((card, index) => cardKeys.indexOf(card) !== index);
        if (duplicates.length > 0) {
            console.error('⚠️ ДУБЛИРАНИ КАРТИ В sortCards:', duplicates);
        }
        
        if (result.length !== cards.length) {
            console.warn('⚠️ WARNING: Card count mismatch! Input:', cards.length, 'Output:', result.length);
        }

        return result;
    }
}

/**
 * Глобален обект за управление на игровата логика с карти
 */
const CardManager = {
    deck: null,
    currentDeckColor: 'blue', // 'blue' или 'red'

    /**
     * Инициализира CardManager при първи път
     */
    init() {
        // Прочита последния използан цвят от localStorage
        const lastDeckColor = localStorage.getItem('lastDeckColor');
        if (lastDeckColor) {
            // Алтернира на противоположния цвят
            this.currentDeckColor = lastDeckColor === 'blue' ? 'red' : 'blue';
        } else {
            // При първи път, началния цвят е син
            this.currentDeckColor = 'blue';
        }
        console.log('CardManager инициализиран. Текущо тесте:', this.currentDeckColor);
    },

    /**
     * Връща текущия цвят на тестето
     */
    getDeckColor() {
        return this.currentDeckColor;
    },

    /**
     * Запазва текущия цвят в localStorage за следващо раздаване
     */
    saveDeckColor() {
        localStorage.setItem('lastDeckColor', this.currentDeckColor);
    },

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
