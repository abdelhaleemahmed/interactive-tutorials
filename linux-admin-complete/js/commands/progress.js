// js/commands/progress.js
// Display tutorial progress and achievements

import { getProgressTracker, ACHIEVEMENTS } from '../progressTracking.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * progress command implementation
 * @param {Array} args - Command arguments
 * @returns {string} Output
 */
export const progressCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('progress', args);
    if (!validation.valid) {
        return validation.error;
    }

    const tracker = getProgressTracker();

    // Parse options
    const showAchievements = args.includes('-a') || args.includes('--achievements');
    const reset = args.includes('--reset');

    if (reset) {
        tracker.reset();
        return '\x1B[32m✓ Progress reset successfully\x1B[0m\r\n\r\n' +
               'All progress and achievements have been cleared.';
    }

    if (showAchievements) {
        return formatAchievements(tracker);
    }

    return formatProgress(tracker);
};

/**
 * Format progress statistics
 */
function formatProgress(tracker) {
    const stats = tracker.getStats();
    const nextPage = tracker.getNextPage();

    let output = '\x1B[1;36m📊 Your Learning Progress\x1B[0m\r\n\r\n';

    // Overall progress
    output += `\x1B[1mCompletion:\x1B[0m ${stats.completionPercentage}%\r\n`;
    output += `${getProgressBar(stats.completionPercentage)}\r\n\r\n`;

    // Statistics
    output += `\x1B[1mStatistics:\x1B[0m\r\n`;
    output += `  Pages Visited: ${stats.visitedPages}/${stats.totalPages}\r\n`;
    output += `  Sections Completed: ${stats.sectionsCompleted}\r\n`;
    output += `  Commands Executed: ${stats.commandsExecuted}\r\n`;
    output += `  Files Created: ${stats.filesCreated}\r\n`;
    output += `  Days Active: ${stats.uniqueDays}\r\n\r\n`;

    // Achievements
    output += `\x1B[1mAchievements:\x1B[0m ${stats.unlockedAchievements}/${stats.totalAchievements} unlocked\r\n`;

    const unlocked = tracker.getUnlockedAchievements();
    if (unlocked.length > 0) {
        unlocked.forEach(achievement => {
            output += `  ${achievement.icon} ${achievement.title}\r\n`;
        });
    } else {
        output += `  (No achievements unlocked yet)\r\n`;
    }

    output += `\r\n\x1B[2mUse 'progress --achievements' to see all achievements\x1B[0m\r\n`;

    // Next suggestion
    if (nextPage) {
        output += `\r\n\x1B[1;33m💡 Suggested Next:\x1B[0m Continue with the next page\r\n`;
    }

    return output;
}

/**
 * Format achievements list
 */
function formatAchievements(tracker) {
    const unlocked = tracker.getUnlockedAchievements();
    const locked = tracker.getLockedAchievements();

    let output = '\x1B[1;36m🏆 Achievements\x1B[0m\r\n\r\n';

    // Unlocked achievements
    output += `\x1B[1m✓ Unlocked (${unlocked.length}):\x1B[0m\r\n`;
    if (unlocked.length > 0) {
        unlocked.forEach(achievement => {
            output += `\r\n  ${achievement.icon} \x1B[1;32m${achievement.title}\x1B[0m\r\n`;
            output += `     ${achievement.description}\r\n`;
        });
    } else {
        output += `  (None yet - keep learning!)\r\n`;
    }

    // Locked achievements
    if (locked.length > 0) {
        output += `\r\n\x1B[1m🔒 Locked (${locked.length}):\x1B[0m\r\n`;
        locked.forEach(achievement => {
            output += `\r\n  ${achievement.icon} \x1B[2m${achievement.title}\x1B[0m\r\n`;
            output += `     \x1B[2m${achievement.description}\x1B[0m\r\n`;
        });
    }

    return output;
}

/**
 * Create a progress bar
 * @param {number} percentage - Progress percentage (0-100)
 * @returns {string} Progress bar string
 */
function getProgressBar(percentage) {
    const width = 30;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const bar = '\x1B[42m' + ' '.repeat(filled) + '\x1B[0m' +
                '\x1B[100m' + ' '.repeat(empty) + '\x1B[0m';

    return `[${bar}] ${percentage}%`;
}

/**
 * Help text for progress command
 */
export const progressHelp = {
    description: 'Display your learning progress and achievements',
    usage: 'progress [-a|--achievements] [--reset]',
    details: `Shows your tutorial progress, statistics, and unlocked achievements.

    Options:
      -a, --achievements  Show detailed achievements list
      --reset            Reset all progress (requires confirmation)

    Progress Tracking:
      - Pages visited and completed
      - Commands executed
      - Files created
      - Achievements unlocked
      - Learning streaks`,
    examples: [
        'progress              # Show progress summary',
        'progress -a           # Show all achievements',
        'progress --reset      # Reset progress'
    ]
};
