// js/progressTracking.js
// Tutorial progress tracking and achievements system

const PROGRESS_KEY = 'linux-tutorial-progress';
const ACHIEVEMENTS_KEY = 'linux-tutorial-achievements';

/**
 * Tutorial pages/sections
 */
export const TUTORIAL_PAGES = {
    'index': { title: 'Introduction', order: 0 },
    'basic-commands': { title: 'Basic Commands & Navigation', order: 1 },
    'file-system': { title: 'File System Management', order: 2 },
    'user-management': { title: 'User & Permission Management', order: 3 },
    'system-admin': { title: 'System Administration', order: 4 },
    'interactive-terminal': { title: 'Interactive Terminal Practice', order: 5 }
};

/**
 * Achievements/Badges
 */
export const ACHIEVEMENTS = {
    'first_command': {
        id: 'first_command',
        title: 'First Steps',
        description: 'Execute your first command',
        icon: '🎯',
        condition: (stats) => stats.commandsExecuted >= 1
    },
    'command_master': {
        id: 'command_master',
        title: 'Command Master',
        description: 'Execute 50 commands',
        icon: '⚡',
        condition: (stats) => stats.commandsExecuted >= 50
    },
    'explorer': {
        id: 'explorer',
        title: 'Explorer',
        description: 'Visit all tutorial pages',
        icon: '🗺️',
        condition: (stats) => stats.pagesVisited.length >= Object.keys(TUTORIAL_PAGES).length - 1 // Exclude interactive-terminal
    },
    'file_creator': {
        id: 'file_creator',
        title: 'File Creator',
        description: 'Create 10 files or directories',
        icon: '📁',
        condition: (stats) => stats.filesCreated >= 10
    },
    'persistent_learner': {
        id: 'persistent_learner',
        title: 'Persistent Learner',
        description: 'Return to the tutorial on 3 different days',
        icon: '📅',
        condition: (stats) => stats.uniqueDays >= 3
    },
    'completionist': {
        id: 'completionist',
        title: 'Completionist',
        description: 'Complete all tutorial sections',
        icon: '🏆',
        condition: (stats) => stats.sectionsCompleted >= Object.keys(TUTORIAL_PAGES).length - 1
    }
};

/**
 * Progress Tracker Class
 */
export class ProgressTracker {
    constructor() {
        this.progress = this.loadProgress();
        this.achievements = this.loadAchievements();
        this.updateDailyVisit();
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem(PROGRESS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load progress:', error);
        }

        return {
            pagesVisited: [],
            sectionsCompleted: 0,
            currentPage: null,
            lastVisit: Date.now(),
            firstVisit: Date.now(),
            commandsExecuted: 0,
            filesCreated: 0,
            uniqueDays: 1,
            visitDates: [this.getTodayDate()]
        };
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.progress));
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }

    /**
     * Load achievements from localStorage
     */
    loadAchievements() {
        try {
            const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Failed to load achievements:', error);
        }
        return [];
    }

    /**
     * Save achievements to localStorage
     */
    saveAchievements() {
        try {
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
        } catch (error) {
            console.warn('Failed to save achievements:', error);
        }
    }

    /**
     * Get today's date as YYYY-MM-DD
     */
    getTodayDate() {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }

    /**
     * Update daily visit tracking
     */
    updateDailyVisit() {
        const today = this.getTodayDate();
        if (!this.progress.visitDates.includes(today)) {
            this.progress.visitDates.push(today);
            this.progress.uniqueDays = this.progress.visitDates.length;
            this.saveProgress();
        }
    }

    /**
     * Mark page as visited
     * @param {string} pageId - Page identifier
     */
    visitPage(pageId) {
        if (!this.progress.pagesVisited.includes(pageId)) {
            this.progress.pagesVisited.push(pageId);
        }
        this.progress.currentPage = pageId;
        this.progress.lastVisit = Date.now();
        this.saveProgress();
        this.checkAchievements();
    }

    /**
     * Mark section as completed
     * @param {string} pageId - Page identifier
     * @param {string} sectionId - Section identifier
     */
    completeSection(pageId, sectionId) {
        const key = `${pageId}:${sectionId}`;
        if (!this.progress.completedSections) {
            this.progress.completedSections = [];
        }

        if (!this.progress.completedSections.includes(key)) {
            this.progress.completedSections.push(key);
            this.progress.sectionsCompleted = this.progress.completedSections.length;
            this.saveProgress();
            this.checkAchievements();
        }
    }

    /**
     * Increment command execution count
     */
    incrementCommandCount() {
        this.progress.commandsExecuted = (this.progress.commandsExecuted || 0) + 1;
        this.saveProgress();
        this.checkAchievements();
    }

    /**
     * Increment file creation count
     */
    incrementFileCount() {
        this.progress.filesCreated = (this.progress.filesCreated || 0) + 1;
        this.saveProgress();
        this.checkAchievements();
    }

    /**
     * Check and unlock achievements
     */
    checkAchievements() {
        const stats = this.progress;
        let newAchievements = [];

        for (const achievement of Object.values(ACHIEVEMENTS)) {
            // Skip if already unlocked
            if (this.achievements.includes(achievement.id)) {
                continue;
            }

            // Check condition
            if (achievement.condition(stats)) {
                this.achievements.push(achievement.id);
                newAchievements.push(achievement);
            }
        }

        if (newAchievements.length > 0) {
            this.saveAchievements();
            // Trigger achievement notification
            this.showAchievementNotification(newAchievements);
        }

        return newAchievements;
    }

    /**
     * Show achievement notification
     * @param {Array} achievements - Newly unlocked achievements
     */
    showAchievementNotification(achievements) {
        achievements.forEach(achievement => {
            this.displayToast(
                `${achievement.icon} Achievement Unlocked!`,
                `${achievement.title}: ${achievement.description}`,
                'achievement'
            );
        });
    }

    /**
     * Display toast notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, achievement, info)
     */
    displayToast(title, message, type = 'info') {
        // Check if toast container exists
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('toast-show'), 10);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Get progress statistics
     * @returns {Object} Progress stats
     */
    getStats() {
        const totalPages = Object.keys(TUTORIAL_PAGES).length - 1; // Exclude interactive-terminal
        const visitedPages = this.progress.pagesVisited.length;
        const percentage = Math.round((visitedPages / totalPages) * 100);

        return {
            ...this.progress,
            totalPages,
            visitedPages,
            completionPercentage: percentage,
            unlockedAchievements: this.achievements.length,
            totalAchievements: Object.keys(ACHIEVEMENTS).length
        };
    }

    /**
     * Get unlocked achievements
     * @returns {Array} Unlocked achievement objects
     */
    getUnlockedAchievements() {
        return this.achievements.map(id => ACHIEVEMENTS[id]).filter(Boolean);
    }

    /**
     * Get locked achievements
     * @returns {Array} Locked achievement objects
     */
    getLockedAchievements() {
        return Object.values(ACHIEVEMENTS).filter(a => !this.achievements.includes(a.id));
    }

    /**
     * Reset all progress
     */
    reset() {
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(ACHIEVEMENTS_KEY);
        this.progress = this.loadProgress();
        this.achievements = this.loadAchievements();
    }

    /**
     * Get next suggested page
     * @returns {string|null} Next page ID
     */
    getNextPage() {
        const visited = new Set(this.progress.pagesVisited);
        const pages = Object.entries(TUTORIAL_PAGES)
            .filter(([id]) => id !== 'interactive-terminal')
            .sort((a, b) => a[1].order - b[1].order);

        for (const [id] of pages) {
            if (!visited.has(id)) {
                return id;
            }
        }

        return null;
    }
}

/**
 * Create progress tracking instance (singleton)
 */
let trackerInstance = null;

export function getProgressTracker() {
    if (!trackerInstance) {
        trackerInstance = new ProgressTracker();
    }
    return trackerInstance;
}
