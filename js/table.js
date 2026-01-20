// ===== TABLE MANAGEMENT SYSTEM =====
// Управление на маси и позиции за мултиплейър Bridge

class TableManager {
    constructor() {
        this.tables = [];
        this.currentTableId = null;
        this.currentPosition = null;
        this.storageKey = 'bridge_tables';
        this.loadTablesFromStorage();

        // Ако няма маси, създаваме примерни
        if (this.tables.length === 0) {
            this.createDefaultTables();
        }
    }

    // Създаване на маса
    createTable(tableName) {
        const tableId = `table_${Date.now()}`;
        const table = {
            id: tableId,
            name: tableName || `Маса ${this.tables.length + 1}`,
            createdAt: new Date().toISOString(),
            positions: {
                NORTH: null,
                SOUTH: null,
                EAST: null,
                WEST: null
            },
            spectators: [] // Списък с наблюдатели
        };

        this.tables.push(table);
        this.saveToStorage();
        console.log('Table created:', table);
        return table;
    }

    // Вземане на всички маси
    getAllTables() {
        return this.tables;
    }

    // Вземане на конкретна маса
    getTable(tableId) {
        return this.tables.find(t => t.id === tableId);
    }

    // Заемане на позиция
    joinPosition(tableId, position, username, role = 'player') {
        const table = this.getTable(tableId);
        if (!table) {
            throw new Error('Масата не съществува');
        }

        // Проверка дали позицията е свободна
        if (table.positions[position] !== null) {
            throw new Error('Позицията е заета');
        }

        // Проверка дали играчът вече е на масата
        for (const [pos, player] of Object.entries(table.positions)) {
            if (player === username) {
                throw new Error(`Вече сте на позиция ${pos} на тази маса`);
            }
        }

        // Заемаме позицията
        table.positions[position] = username;
        this.currentTableId = tableId;
        this.currentPosition = position;
        this.currentRole = role;
        
        this.saveToStorage();
        this.saveCurrentSelection();
        
        console.log(`Player ${username} joined ${tableId} at ${position} as ${role}`);
        return table;
    }

    // Присъединяване като наблюдател
    joinAsSpectator(tableId, username) {
        const table = this.getTable(tableId);
        if (!table) {
            throw new Error('Масата не съществува');
        }

        // Проверка дали вече е наблюдател
        if (table.spectators && table.spectators.includes(username)) {
            throw new Error('Вече сте наблюдател на тази маса');
        }

        // Проверка дали е играч на масата
        for (const [pos, player] of Object.entries(table.positions)) {
            if (player === username) {
                throw new Error(`Вече сте играч на позиция ${pos}`);
            }
        }

        // Добавяме като наблюдател
        if (!table.spectators) {
            table.spectators = [];
        }
        table.spectators.push(username);
        
        this.currentTableId = tableId;
        this.currentPosition = null;
        this.currentRole = 'spectator';
        
        this.saveToStorage();
        this.saveCurrentSelection();
        
        console.log(`${username} joined ${tableId} as spectator`);
        return table;
    }

    // Напускане на позиция
    leavePosition(tableId, position) {
        const table = this.getTable(tableId);
        if (!table) {
            throw new Error('Масата не съществува');
        }

        table.positions[position] = null;
        
        // Ако това е текущата позиция, изчистваме я
        if (this.currentTableId === tableId && this.currentPosition === position) {
            this.currentTableId = null;
            this.currentPosition = null;
            this.saveCurrentSelection();
        }

        this.saveToStorage();
        console.log(`Position ${position} at ${tableId} is now empty`);
    }

    // Проверка дали масата е пълна
    isTableFull(tableId) {
        const table = this.getTable(tableId);
        if (!table) return false;

        return Object.values(table.positions).every(p => p !== null);
    }

    // Брой свободни места
    getAvailableSeats(tableId) {
        const table = this.getTable(tableId);
        if (!table) return 0;

        return Object.values(table.positions).filter(p => p === null).length;
    }

    // Вземане на текуща маса и позиция
    getCurrentSelection() {
        return {
            tableId: this.currentTableId,
            position: this.currentPosition,
            role: this.currentRole || 'player'
        };
    }

    // Запазване текущ избор
    saveCurrentSelection() {
        localStorage.setItem('bridge_current_selection', JSON.stringify({
            tableId: this.currentTableId,
            position: this.currentPosition,
            role: this.currentRole || 'player'
        }));
    }

    // Зареждане текущ избор
    loadCurrentSelection() {
        const stored = localStorage.getItem('bridge_current_selection');
        if (stored) {
            try {
                const selection = JSON.parse(stored);
                this.currentTableId = selection.tableId;
                this.currentPosition = selection.position;
                this.currentRole = selection.role || 'player';
            } catch (e) {
                console.error('Failed to parse current selection:', e);
            }
        }
    }

    // Запазване в storage
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tables));
    }

    // Зареждане от storage
    loadTablesFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.tables = JSON.parse(stored);
                console.log('Tables loaded from storage:', this.tables);
            } catch (e) {
                console.error('Failed to parse stored tables:', e);
                this.tables = [];
            }
        }
        this.loadCurrentSelection();
    }

    // Създаване на примерни маси
    createDefaultTables() {
        this.createTable('Маса 1');
        this.createTable('Маса 2');
        
        // Примерна маса с играчи
        const table3 = this.createTable('Маса 3 - Demo');
        table3.positions.NORTH = 'Иван';
        table3.positions.SOUTH = 'Петър';
        table3.spectators = ['Мария'];
        
        this.saveToStorage();
    }

    // Изчистване на всички маси (за debug)
    clearAllTables() {
        this.tables = [];
        this.currentTableId = null;
        this.currentPosition = null;
        this.currentRole = null;
        this.saveToStorage();
        this.saveCurrentSelection();
    }
}

// Глобален instance
window.tableManager = new TableManager();
