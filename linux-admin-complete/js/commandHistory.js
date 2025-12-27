// js/commandHistory.js
// Enhanced command history with persistence and bash-style shortcuts

const HISTORY_KEY = 'linux-tutorial-command-history';
const MAX_HISTORY_SIZE = 1000;

/**
 * Command History Manager
 */
export class CommandHistory {
    constructor() {
        this.history = this.loadHistory();
        this.currentIndex = this.history.length;
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem(HISTORY_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.warn('Failed to load command history:', error);
        }
        return [];
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
        } catch (error) {
            console.warn('Failed to save command history:', error);
        }
    }

    /**
     * Add command to history
     * @param {string} command - Command to add
     */
    add(command) {
        const trimmed = command.trim();

        // Don't add empty commands
        if (!trimmed) return;

        // Don't add duplicates if same as last command
        if (this.history.length > 0 && this.history[this.history.length - 1] === trimmed) {
            return;
        }

        // Add to history
        this.history.push(trimmed);

        // Limit size
        if (this.history.length > MAX_HISTORY_SIZE) {
            this.history.shift();
        }

        // Reset index
        this.currentIndex = this.history.length;

        // Save to localStorage
        this.saveHistory();
    }

    /**
     * Get command at index
     * @param {number} index - Index in history (0-based)
     * @returns {string|null}
     */
    get(index) {
        if (index < 0 || index >= this.history.length) {
            return null;
        }
        return this.history[index];
    }

    /**
     * Get previous command (arrow up)
     * @returns {string|null}
     */
    getPrevious() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Get next command (arrow down)
     * @returns {string|null}
     */
    getNext() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        } else if (this.currentIndex === this.history.length - 1) {
            this.currentIndex = this.history.length;
            return '';
        }
        return null;
    }

    /**
     * Reset navigation index
     */
    resetIndex() {
        this.currentIndex = this.history.length;
    }

    /**
     * Get all history
     * @returns {string[]}
     */
    getAll() {
        return [...this.history];
    }

    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.currentIndex = 0;
        this.saveHistory();
    }

    /**
     * Search history for pattern
     * @param {string} pattern - Pattern to search for
     * @returns {string[]} Matching commands
     */
    search(pattern) {
        if (!pattern) return [];

        const regex = new RegExp(pattern, 'i');
        return this.history.filter(cmd => regex.test(cmd));
    }

    /**
     * Expand bash-style history shortcuts
     * @param {string} command - Command potentially containing shortcuts
     * @returns {string|null} Expanded command or null if not expandable
     */
    expand(command) {
        const trimmed = command.trim();

        // !! - repeat last command
        if (trimmed === '!!') {
            if (this.history.length === 0) {
                return null;
            }
            return this.history[this.history.length - 1];
        }

        // !n - repeat command number n (1-indexed)
        if (/^!\d+$/.test(trimmed)) {
            const num = parseInt(trimmed.substring(1), 10);
            // Convert to 0-based index
            const index = num - 1;
            return this.get(index);
        }

        // !-n - repeat n commands ago
        if (/^!-\d+$/.test(trimmed)) {
            const num = parseInt(trimmed.substring(2), 10);
            const index = this.history.length - num;
            return this.get(index);
        }

        // !prefix - repeat last command starting with prefix
        if (/^![a-zA-Z]/.test(trimmed)) {
            const prefix = trimmed.substring(1);
            // Search backwards for matching command
            for (let i = this.history.length - 1; i >= 0; i--) {
                if (this.history[i].startsWith(prefix)) {
                    return this.history[i];
                }
            }
            return null;
        }

        // Not a history expansion
        return trimmed;
    }

    /**
     * Get size of history
     * @returns {number}
     */
    size() {
        return this.history.length;
    }
}

/**
 * Format history for display
 * @param {CommandHistory} historyManager
 * @param {number} limit - Max number of entries to show
 * @returns {string}
 */
export function formatHistory(historyManager, limit = null) {
    const history = historyManager.getAll();

    if (history.length === 0) {
        return 'No commands in history';
    }

    let start = 0;
    if (limit && history.length > limit) {
        start = history.length - limit;
    }

    let output = [];
    for (let i = start; i < history.length; i++) {
        // Show 1-indexed for user-friendly numbering
        output.push(`${String(i + 1).padStart(5, ' ')}  ${history[i]}`);
    }

    return output.join('\r\n');
}

/**
 * Get storage info for history
 * @returns {Object}
 */
export function getHistoryStorageInfo() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        const size = data ? new Blob([data]).size : 0;

        return {
            size: size,
            sizeKB: (size / 1024).toFixed(2),
            count: data ? JSON.parse(data).length : 0
        };
    } catch (error) {
        return {
            size: 0,
            sizeKB: '0.00',
            count: 0
        };
    }
}
