// ===== MOCK AUTHENTICATION SYSTEM =====
// За Фаза 1: Позволява вход с произволно име/парола за тестване
// За Фаза 3: Ще се замени с реална автентикация

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.storageKey = 'bridge_current_user';
        this.loadUserFromStorage();
    }

    // Проверка дали потребителят е логнат
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Вземане на текущия потребител
    getCurrentUser() {
        return this.currentUser;
    }

    // Mock Login - приема всяко име/парола
    async login(username, password) {
        // Симулираме малко забавяне за реалистичност
        await this.delay(500);

        // Валидация
        if (!username || username.trim() === '') {
            throw new Error('Моля въведете потребителско име');
        }

        if (!password || password.trim() === '') {
            throw new Error('Моля въведете парола');
        }

        // Mock: приемаме всяко име/парола
        this.currentUser = {
            username: username.trim(),
            loginTime: new Date().toISOString(),
            isAdmin: username.toLowerCase() === 'admin' // специална роля за admin
        };

        // Запазваме в localStorage
        this.saveUserToStorage();

        console.log('Mock login successful:', this.currentUser);
        return this.currentUser;
    }

    // Изход
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        console.log('User logged out');
    }

    // Запазване в storage
    saveUserToStorage() {
        if (this.currentUser) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
        }
    }

    // Зареждане от storage
    loadUserFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.currentUser = JSON.parse(stored);
                console.log('User loaded from storage:', this.currentUser);
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                localStorage.removeItem(this.storageKey);
            }
        }
    }

    // Помощна функция за забавяне
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Глобален instance
window.authManager = new AuthManager();
