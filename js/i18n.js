// ===== INTERNATIONALIZATION (i18n) SYSTEM =====
// Поддръжка на български (bg) и английски (en) език

const translations = {
    bg: {
        // Login screen
        'login.title': 'Вход в системата',
        'login.username': 'Потребителско име:',
        'login.password': 'Парола:',
        'login.button': 'Вход',
        'login.hint': 'MockLogin: използвайте произволно име/парола за тест',
        'login.language': 'Език:',
        
        // Lobby header
        'lobby.title': '♠ Bridge Lobby ♠',
        'lobby.user': 'Потребител:',
        'lobby.logout': 'Изход',
        'lobby.availableTables': 'Налични маси',
        'lobby.createTable': '➕ Създай нова маса',
        'lobby.refresh': '🔄 Обнови',
        'lobby.noTables': 'Няма налични маси. Създайте нова маса.',
        
        // Table card
        'table.full': '✓ Пълна',
        'table.seats': 'места',
        'table.join': 'Присъедини се',
        'table.joinAsPlayer': 'Присъедини се като Играч',
        'table.joinAsSpectator': 'Гледай като Наблюдател',
        'table.tableFull': 'Масата е пълна',
        
        // Position modal
        'modal.selectPosition': 'Избери позиция на',
        'modal.position.north': 'СЕВЕР (North)',
        'modal.position.south': 'ЮГ (South)',
        'modal.position.east': 'ИЗТОК (East)',
        'modal.position.west': 'ЗАПАД (West)',
        'modal.empty': 'Празно',
        'modal.taken': 'Заето:',
        'modal.spectatorMode': 'Режим Наблюдател',
        'modal.spectatorHint': 'Ще гледате играта без да участвате',
        'modal.confirmSpectator': 'Присъедини се като Наблюдател',
        
        // Positions
        'position.north': 'Север',
        'position.south': 'Юг',
        'position.east': 'Изток',
        'position.west': 'Запад',
        
        // Game screen
        'game.title': '♠ Спортен Бридж ♠',
        'game.subtitle': 'Contract Bridge - Разиграване на карти',
        'game.table': 'Маса:',
        'game.position': 'Позиция:',
        'game.role': 'Роля:',
        'game.player': 'Играч',
        'game.spectator': 'Наблюдател',
        'game.backToLobby': '← Към Lobby',
        'game.dealCards': 'Раздай карти',
        'game.instructions': 'Натиснете бутона за разиграване на карти',
        'game.points': 'Точки:',
        'game.you': 'Вие',
        
        // Messages
        'msg.loginError': 'Грешка при вход:',
        'msg.logoutConfirm': 'Сигурни ли сте, че искате да излезете?',
        'msg.joinSuccess': 'Успешно се присъединихте на позиция',
        'msg.joinSuccessSpectator': 'Успешно се присъединихте като Наблюдател!',
        'msg.error': 'Грешка:',
        'msg.enterTableName': 'Въведете име на масата:',
        'msg.backToLobbyConfirm': 'Сигурни ли сте, че искате да се върнете към lobby?',
        
        // Footer
        'footer.copyright': '&copy; 2026 Bridge Application - Inner Circle'
    },
    
    en: {
        // Login screen
        'login.title': 'System Login',
        'login.username': 'Username:',
        'login.password': 'Password:',
        'login.button': 'Login',
        'login.hint': 'MockLogin: use any username/password for testing',
        'login.language': 'Language:',
        
        // Lobby header
        'lobby.title': '♠ Bridge Lobby ♠',
        'lobby.user': 'User:',
        'lobby.logout': 'Logout',
        'lobby.availableTables': 'Available Tables',
        'lobby.createTable': '➕ Create New Table',
        'lobby.refresh': '🔄 Refresh',
        'lobby.noTables': 'No tables available. Create a new table.',
        
        // Table card
        'table.full': '✓ Full',
        'table.seats': 'seats',
        'table.join': 'Join',
        'table.joinAsPlayer': 'Join as Player',
        'table.joinAsSpectator': 'Watch as Spectator',
        'table.tableFull': 'Table is Full',
        
        // Position modal
        'modal.selectPosition': 'Select Position at',
        'modal.position.north': 'NORTH',
        'modal.position.south': 'SOUTH',
        'modal.position.east': 'EAST',
        'modal.position.west': 'WEST',
        'modal.empty': 'Empty',
        'modal.taken': 'Taken:',
        'modal.spectatorMode': 'Spectator Mode',
        'modal.spectatorHint': 'You will watch the game without participating',
        'modal.confirmSpectator': 'Join as Spectator',
        
        // Positions
        'position.north': 'North',
        'position.south': 'South',
        'position.east': 'East',
        'position.west': 'West',
        
        // Game screen
        'game.title': '♠ Bridge Game ♠',
        'game.subtitle': 'Contract Bridge - Card Play',
        'game.table': 'Table:',
        'game.position': 'Position:',
        'game.role': 'Role:',
        'game.player': 'Player',
        'game.spectator': 'Spectator',
        'game.backToLobby': '← Back to Lobby',
        'game.dealCards': 'Deal Cards',
        'game.instructions': 'Press button to deal cards',
        'game.points': 'Points:',
        'game.you': 'You',
        
        // Messages
        'msg.loginError': 'Login error:',
        'msg.logoutConfirm': 'Are you sure you want to logout?',
        'msg.joinSuccess': 'Successfully joined at position',
        'msg.joinSuccessSpectator': 'Successfully joined as Spectator!',
        'msg.error': 'Error:',
        'msg.enterTableName': 'Enter table name:',
        'msg.backToLobbyConfirm': 'Are you sure you want to return to lobby?',
        
        // Footer
        'footer.copyright': '&copy; 2026 Bridge Application - Inner Circle'
    }
};

class I18nManager {
    constructor() {
        this.currentLanguage = this.loadLanguage();
        this.observers = [];
    }

    // Зареждане на запазен език или дефолт
    loadLanguage() {
        const saved = localStorage.getItem('bridge_language');
        return saved || 'bg'; // Default: Bulgarian
    }

    // Запазване на език
    saveLanguage(lang) {
        localStorage.setItem('bridge_language', lang);
    }

    // Смяна на език
    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            this.saveLanguage(lang);
            this.notifyObservers();
            console.log('Language changed to:', lang);
        }
    }

    // Вземане на текущ език
    getLanguage() {
        return this.currentLanguage;
    }

    // Превод на ключ
    t(key) {
        const translation = translations[this.currentLanguage]?.[key];
        if (translation === undefined) {
            console.warn(`Missing translation for key: ${key} in language: ${this.currentLanguage}`);
            return key;
        }
        return translation;
    }

    // Регистриране на observer за промени в езика
    subscribe(callback) {
        this.observers.push(callback);
    }

    // Известяване на observers
    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLanguage));
    }

    // Създаване на language selector
    createLanguageSelector() {
        const select = document.createElement('select');
        select.className = 'language-selector';
        select.innerHTML = `
            <option value="bg" ${this.currentLanguage === 'bg' ? 'selected' : ''}>🇧🇬 БГ</option>
            <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
        `;
        
        select.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
        
        return select;
    }

    // Актуализира всички елементи с data-i18n атрибут
    updatePageTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            // Проверяваме дали е HTML съдържание
            if (translation.includes('<') || translation.includes('&')) {
                element.innerHTML = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Актуализира placeholder атрибути
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }
}

// Глобален instance
window.i18n = new I18nManager();
