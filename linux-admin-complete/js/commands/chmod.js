// js/commands/chmod.js

import { getPathObject, resolvePath } from '../terminalUtils.js';
import { noSuchFileError, missingArgumentError } from '../errorMessages.js';
import { getCurrentUser } from '../userManagement.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * Parse symbolic notation (e.g., u+x, g-w, o=r, a+rw, u+s, g+s, +t)
 * @param {string} symbolic - The symbolic mode string
 * @param {number} currentPerms - Current permissions (octal)
 * @returns {number|null} New permissions (octal) or null if invalid
 */
function parseSymbolicMode(symbolic, currentPerms) {
    // Split multiple modes separated by comma (e.g., "u=rwx,g=rx,o=")
    const modes = symbolic.split(',');
    let newPerms = currentPerms;

    for (const mode of modes) {
        // Check for special bits first (u+s, g+s, +t)
        const specialMatch = mode.match(/^([ugo])?([+\-=])([st])$/);
        if (specialMatch) {
            const [, who, op, perm] = specialMatch;

            let specialMask = 0;
            if (perm === 's') {
                if (who === 'u' || !who) specialMask = 0o4000;  // SUID
                else if (who === 'g') specialMask = 0o2000;  // SGID
            } else if (perm === 't') {
                specialMask = 0o1000;  // Sticky bit
            }

            if (op === '+') {
                newPerms = newPerms | specialMask;
            } else if (op === '-') {
                newPerms = newPerms & ~specialMask;
            } else if (op === '=') {
                // Clear all special bits and set this one
                newPerms = (newPerms & 0o777) | specialMask;
            }

            continue;
        }

        // Match pattern: [ugoa]*([-+=])[rwx]+
        const match = mode.match(/^([ugoa]*)([+\-=])([rwx]*)$/);

        if (!match) {
            return null;  // Invalid format
        }

        const [, who, op, perms] = match;

        // Determine which bits to modify
        let targetBits = [];
        if (who === '' || who.includes('a')) {
            // All (user, group, other)
            targetBits = ['u', 'g', 'o'];
        } else {
            // Specific targets
            if (who.includes('u')) targetBits.push('u');
            if (who.includes('g')) targetBits.push('g');
            if (who.includes('o')) targetBits.push('o');
        }

        // Calculate permission value from rwx
        let permValue = 0;
        if (perms.includes('r')) permValue += 4;
        if (perms.includes('w')) permValue += 2;
        if (perms.includes('x')) permValue += 1;

        // Apply changes to each target
        for (const target of targetBits) {
            let shift;
            if (target === 'u') shift = 6;
            else if (target === 'g') shift = 3;
            else shift = 0;  // 'o'

            const mask = 7 << shift;  // 3 bits at the shift position
            const currentBits = (newPerms >> shift) & 7;

            if (op === '=') {
                // Set exactly (clear old bits, set new)
                newPerms = (newPerms & ~mask) | (permValue << shift);
            } else if (op === '+') {
                // Add permissions (OR)
                newPerms = newPerms | (permValue << shift);
            } else if (op === '-') {
                // Remove permissions (AND NOT)
                newPerms = newPerms & ~(permValue << shift);
            }
        }
    }

    return newPerms;
}

/**
 * chmod command - Change file/directory permissions
 * Usage: chmod <mode> <file>
 * Mode: Octal notation (e.g., 755, 644) or symbolic (e.g., u+x, g-w, o=r)
 *
 * Symbolic notation:
 *   - who: u (user), g (group), o (other), a (all)
 *   - operator: + (add), - (remove), = (set exactly)
 *   - permissions: r (read), w (write), x (execute)
 *
 * Examples:
 *   chmod 755 file.txt       - Octal mode
 *   chmod u+x script.sh      - Add execute for user
 *   chmod g-w file.txt       - Remove write for group
 *   chmod o=r public.txt     - Set other to read-only
 *   chmod a+r doc.txt        - Add read for all
 *   chmod u=rwx,g=rx,o= file - Multiple modes
 *
 * Only file owner or root can change permissions
 */
export const chmodCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('chmod', args);
    if (!validation.valid) {
        return validation.error;
    }

    const { nonFlags } = validation;
    let output = '';
    const currentUser = getCurrentUser();

    const modeString = nonFlags[0];
    const fileName = nonFlags[1];

    const resolved = resolvePath(fileName);
    const fileObj = getPathObject(resolved);

    if (!fileObj) {
        return noSuchFileError(fileName);
    }

    // Check if user is owner or root
    if (fileObj.owner !== currentUser.username && !currentUser.isRoot) {
        return `bash: chmod: ${fileName}: Operation not permitted`;
    }

    let newMode;

    // Check if mode is symbolic or octal
    if (/^[0-7]{3,4}$/.test(modeString)) {
        // Octal mode (3 or 4 digits)
        newMode = parseInt(modeString, 8);

        // Validate 4-digit octal is within range
        if (newMode > 0o7777) {
            return `bash: chmod: '${modeString}': invalid mode`;
        }
    } else {
        // Try symbolic mode
        const currentPerms = fileObj.permissions;
        newMode = parseSymbolicMode(modeString, currentPerms);

        if (newMode === null) {
            return `bash: chmod: '${modeString}': invalid mode`;
        }
    }

    // Change the permissions
    fileObj.permissions = newMode;
    // Update modification timestamp
    fileObj.modified = Date.now();

    return '';  // chmod returns empty on success
};
