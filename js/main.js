// main.js - Главна логика и инициализация

/**
 * Главен обект за контрол на играта
 */
const Game = {
    initialized: false,

    /**
     * Инициализира играта
     */
    init() {
        if (this.initialized) return;

        PlayerManager.createPlayers();
        this.attachEventListeners();
        this.initialized = true;

        console.log('Играта е инициализирана успешно');
    },

    /**
     * Прикачва event listeners
     */
    attachEventListeners() {
        const dealButton = document.getElementById('deal-button');
        if (dealButton) {
            dealButton.addEventListener('click', () => this.dealNewGame());
        }
    },

    /**
     * Раздава нова игра
     */
    dealNewGame() {
        UIManager.clearAllCards();
        UIManager.setDealButtonState(false);
        UIManager.showStatus('Раздавам карти...');

        // Симулира малка забавка за по-добър UX
        setTimeout(() => {
            try {
                // Раздава картите
                const distribution = CardManager.dealToPlayers();

                // Задава картите на играчите
                PlayerManager.dealHands(distribution);

                // Показва картите
                UIManager.displayAllPlayers();

                // Показва информация
                const cardCounts = UIManager.getCardCountByPosition();
                console.log('Карти раздадени:');
                console.log('SOUTH:', cardCounts.SOUTH);
                console.log('WEST:', cardCounts.WEST);
                console.log('NORTH:', cardCounts.NORTH);
                console.log('EAST:', cardCounts.EAST);

                UIManager.showStatus('Карти раздадени успешно');
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
