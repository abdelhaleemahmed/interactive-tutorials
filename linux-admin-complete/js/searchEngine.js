// js/searchEngine.js
// Search functionality for commands and tutorial content

/**
 * Command database for search
 */
const COMMAND_DATABASE = [
    // File & Directory Operations
    { cmd: 'ls', category: 'File Operations', description: 'List directory contents', keywords: ['list', 'files', 'directory', 'show'] },
    { cmd: 'cd', category: 'Navigation', description: 'Change directory', keywords: ['change', 'navigate', 'move', 'go'] },
    { cmd: 'pwd', category: 'Navigation', description: 'Print working directory', keywords: ['current', 'location', 'path', 'where'] },
    { cmd: 'mkdir', category: 'File Operations', description: 'Make directories', keywords: ['create', 'new', 'folder', 'directory'] },
    { cmd: 'rmdir', category: 'File Operations', description: 'Remove empty directories', keywords: ['delete', 'remove', 'directory'] },
    { cmd: 'touch', category: 'File Operations', description: 'Create file or update timestamp', keywords: ['create', 'new', 'file', 'make'] },
    { cmd: 'rm', category: 'File Operations', description: 'Remove files or directories', keywords: ['delete', 'remove', 'erase'] },
    { cmd: 'cp', category: 'File Operations', description: 'Copy files and directories', keywords: ['copy', 'duplicate', 'clone'] },
    { cmd: 'mv', category: 'File Operations', description: 'Move or rename files', keywords: ['move', 'rename', 'relocate'] },

    // Text Operations
    { cmd: 'cat', category: 'Text Operations', description: 'Display file contents', keywords: ['read', 'view', 'show', 'display', 'print'] },
    { cmd: 'echo', category: 'Text Operations', description: 'Print text to terminal', keywords: ['print', 'output', 'display', 'write'] },
    { cmd: 'grep', category: 'Text Operations', description: 'Search for patterns in files', keywords: ['search', 'find', 'pattern', 'match', 'filter'] },
    { cmd: 'head', category: 'Text Operations', description: 'Show first lines of file', keywords: ['beginning', 'start', 'top', 'first'] },
    { cmd: 'tail', category: 'Text Operations', description: 'Show last lines of file', keywords: ['end', 'bottom', 'last', 'final'] },
    { cmd: 'sort', category: 'Text Operations', description: 'Sort lines in files', keywords: ['order', 'arrange', 'organize'] },
    { cmd: 'uniq', category: 'Text Operations', description: 'Remove duplicate lines', keywords: ['unique', 'duplicates', 'distinct'] },
    { cmd: 'wc', category: 'Text Operations', description: 'Count lines, words, and bytes', keywords: ['count', 'lines', 'words', 'characters'] },
    { cmd: 'sed', category: 'Text Operations', description: 'Stream editor for text', keywords: ['edit', 'replace', 'substitute', 'transform'] },

    // Text Editors & Viewers
    { cmd: 'nano', category: 'Editors', description: 'Simple text editor', keywords: ['edit', 'editor', 'modify', 'write'] },
    { cmd: 'less', category: 'Viewers', description: 'View file with pagination', keywords: ['view', 'read', 'pager', 'scroll'] },
    { cmd: 'more', category: 'Viewers', description: 'Simple file viewer', keywords: ['view', 'read', 'pager', 'display'] },

    // Permissions
    { cmd: 'chmod', category: 'Permissions', description: 'Change file permissions', keywords: ['permissions', 'access', 'rights', 'mode'] },
    { cmd: 'chown', category: 'Permissions', description: 'Change file owner', keywords: ['owner', 'ownership', 'user', 'group'] },
    { cmd: 'umask', category: 'Permissions', description: 'Set default permissions', keywords: ['default', 'permissions', 'mask'] },
    { cmd: 'stat', category: 'Permissions', description: 'Display file information', keywords: ['info', 'details', 'metadata', 'attributes'] },

    // File Search
    { cmd: 'find', category: 'Search', description: 'Search for files in hierarchy', keywords: ['search', 'locate', 'files', 'directories'] },
    { cmd: 'locate', category: 'Search', description: 'Fast file name search', keywords: ['search', 'find', 'quick', 'database'] },
    { cmd: 'which', category: 'Search', description: 'Locate command in PATH', keywords: ['find', 'command', 'location', 'path'] },
    { cmd: 'whereis', category: 'Search', description: 'Locate binary, source, manual', keywords: ['find', 'locate', 'binary', 'manual'] },

    // Process Management
    { cmd: 'ps', category: 'Processes', description: 'Report process status', keywords: ['processes', 'running', 'tasks', 'list'] },
    { cmd: 'kill', category: 'Processes', description: 'Terminate processes', keywords: ['stop', 'end', 'terminate', 'signal'] },
    { cmd: 'jobs', category: 'Processes', description: 'List background jobs', keywords: ['background', 'tasks', 'jobs'] },
    { cmd: 'fg', category: 'Processes', description: 'Bring job to foreground', keywords: ['foreground', 'resume', 'job'] },
    { cmd: 'bg', category: 'Processes', description: 'Resume job in background', keywords: ['background', 'resume', 'job'] },
    { cmd: 'sleep', category: 'Processes', description: 'Delay for specified time', keywords: ['wait', 'pause', 'delay', 'timer'] },

    // Environment
    { cmd: 'export', category: 'Environment', description: 'Set environment variables', keywords: ['variable', 'environment', 'set', 'define'] },
    { cmd: 'env', category: 'Environment', description: 'Display environment variables', keywords: ['variables', 'environment', 'list', 'show'] },

    // User Management
    { cmd: 'su', category: 'Users', description: 'Switch user', keywords: ['switch', 'user', 'root', 'sudo'] },
    { cmd: 'whoami', category: 'Users', description: 'Print current user', keywords: ['user', 'current', 'who', 'username'] },

    // Other
    { cmd: 'man', category: 'Help', description: 'Display manual pages', keywords: ['help', 'manual', 'documentation', 'reference'] },
    { cmd: 'help', category: 'Help', description: 'Display help information', keywords: ['help', 'commands', 'usage', 'guide'] },
    { cmd: 'history', category: 'Help', description: 'Command history', keywords: ['history', 'commands', 'past', 'previous'] },
    { cmd: 'progress', category: 'Help', description: 'View learning progress', keywords: ['progress', 'achievements', 'stats', 'tracking'] },
    { cmd: 'reset', category: 'System', description: 'Reset filesystem', keywords: ['reset', 'clear', 'restart', 'default'] },
    { cmd: 'clear', category: 'System', description: 'Clear terminal screen', keywords: ['clear', 'clean', 'reset', 'screen'] },
    { cmd: 'date', category: 'System', description: 'Display date and time', keywords: ['date', 'time', 'clock', 'calendar'] }
];

/**
 * Search Engine Class
 */
export class SearchEngine {
    constructor() {
        this.database = COMMAND_DATABASE;
        this.buildIndex();
    }

    /**
     * Build search index for faster lookups
     */
    buildIndex() {
        this.index = {};

        this.database.forEach((entry, i) => {
            // Index by command name
            const cmd = entry.cmd.toLowerCase();
            if (!this.index[cmd]) {
                this.index[cmd] = [];
            }
            this.index[cmd].push(i);

            // Index by keywords
            entry.keywords.forEach(keyword => {
                const key = keyword.toLowerCase();
                if (!this.index[key]) {
                    this.index[key] = [];
                }
                if (!this.index[key].includes(i)) {
                    this.index[key].push(i);
                }
            });

            // Index by description words
            entry.description.toLowerCase().split(/\s+/).forEach(word => {
                if (word.length > 2) { // Skip very short words
                    if (!this.index[word]) {
                        this.index[word] = [];
                    }
                    if (!this.index[word].includes(i)) {
                        this.index[word].push(i);
                    }
                }
            });
        });
    }

    /**
     * Search for commands
     * @param {string} query - Search query
     * @returns {Array} Array of matching commands with scores
     */
    search(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();
        const words = normalizedQuery.split(/\s+/);
        const scores = {};

        // Search for matches
        words.forEach(word => {
            // Exact match on command name
            if (this.index[word]) {
                this.index[word].forEach(idx => {
                    scores[idx] = (scores[idx] || 0) + 10;
                });
            }

            // Partial match
            Object.keys(this.index).forEach(key => {
                if (key.includes(word) || word.includes(key)) {
                    this.index[key].forEach(idx => {
                        scores[idx] = (scores[idx] || 0) + 3;
                    });
                }
            });
        });

        // Convert to array and sort by score
        const results = Object.entries(scores)
            .map(([idx, score]) => ({
                ...this.database[parseInt(idx)],
                score: score
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Limit to top 10 results

        return results;
    }

    /**
     * Get all commands by category
     * @returns {Object} Commands grouped by category
     */
    getByCategory() {
        const categorized = {};

        this.database.forEach(entry => {
            if (!categorized[entry.category]) {
                categorized[entry.category] = [];
            }
            categorized[entry.category].push(entry);
        });

        return categorized;
    }

    /**
     * Get command details
     * @param {string} commandName - Command to look up
     * @returns {Object|null} Command details or null
     */
    getCommand(commandName) {
        return this.database.find(entry => entry.cmd === commandName) || null;
    }

    /**
     * Get all commands
     * @returns {Array} All commands
     */
    getAllCommands() {
        return [...this.database];
    }
}

/**
 * Create search engine instance (singleton)
 */
let searchEngineInstance = null;

export function getSearchEngine() {
    if (!searchEngineInstance) {
        searchEngineInstance = new SearchEngine();
    }
    return searchEngineInstance;
}
