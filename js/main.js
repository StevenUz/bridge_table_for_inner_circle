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

        CardManager.init();
        UIManager.init();
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

        // Също и бутона в spectator режим
        const spectatorDealButton = document.getElementById('deal-button-spectator');
        if (spectatorDealButton) {
            spectatorDealButton.addEventListener('click', () => this.dealNewGame());
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
