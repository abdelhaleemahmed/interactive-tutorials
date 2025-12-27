// js/commands/reset.js
// Reset filesystem command - clears persistence and reloads page

import { resetFilesystem } from '../filesystemPersistence.js';
import { getStorageInfo } from '../filesystemPersistence.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * reset command implementation
 * Usage: reset [--info]
 */
export const resetCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('reset', args);
    if (!validation.valid) {
        return validation.error;
    }

    // If --info flag, show storage info
    if (args.includes('--info') || args.includes('-i')) {
        const info = getStorageInfo();

        return `\x1B[1;36mFilesystem Storage Information:\x1B[0m\r\n\r\n` +
               `Filesystem data: ${info.filesystemSizeKB} KB\r\n` +
               `Path data: ${(info.pathSize / 1024).toFixed(2)} KB\r\n` +
               `Total: ${info.totalSizeKB} KB\r\n\r\n` +
               `Status: ${info.hasSavedData ? '\x1B[32mPersisted\x1B[0m' : '\x1B[33mNo saved data\x1B[0m'}\r\n\r\n` +
               `Use \x1B[1mreset\x1B[0m to clear all saved data and reset to default.`;
    }

    // Confirm reset
    if (!args.includes('--confirm')) {
        return `\x1B[1;33m⚠️  Warning:\x1B[0m This will reset your entire filesystem to default.\r\n\r\n` +
               `All files you created will be lost!\r\n\r\n` +
               `To confirm, run: \x1B[1mreset --confirm\x1B[0m\r\n` +
               `To see storage info: \x1B[1mreset --info\x1B[0m`;
    }

    // Perform reset
    try {
        // Clear localStorage
        localStorage.removeItem('linux-tutorial-filesystem');
        localStorage.removeItem('linux-tutorial-current-path');
        localStorage.removeItem('linux-tutorial-fs-version');

        return `\x1B[1;32m✓ Filesystem reset successful!\x1B[0m\r\n\r\n` +
               `The page will reload in 2 seconds to apply changes...\r\n\r\n` +
               `\x1B[2mReloading...\x1B[0m`;

    } catch (error) {
        return `\x1B[1;31mError:\x1B[0m Failed to reset filesystem: ${error.message}`;
    }
};

/**
 * Reload page after reset
 * Called from terminal after reset command
 */
export function scheduleReload() {
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}
