// js/commands/umask.js

import { getUmask, setUmask, formatUmask } from '../umask.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * umask command - Display or set file creation mask
 * Usage: umask [mode]
 *
 * Without arguments: displays current umask
 * With mode: sets new umask value (3 or 4 digit octal)
 */
export const umaskCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('umask', args);
    if (!validation.valid) {
        return validation.error;
    }

    // No arguments - display current umask
    if (args.length === 0) {
        const current = getUmask();
        return formatUmask(current);
    }

    // Set new umask
    const modeStr = args[0];

    // Parse octal value (can be 3 or 4 digits)
    const newUmask = parseInt(modeStr, 8);

    // Validate
    if (isNaN(newUmask)) {
        return `umask: ${modeStr}: invalid mode`;
    }

    if (newUmask < 0 || newUmask > 0o777) {
        return `umask: ${modeStr}: invalid mode`;
    }

    // Set the new umask
    setUmask(newUmask);

    // Success - no output (like real bash)
    return '';
};
