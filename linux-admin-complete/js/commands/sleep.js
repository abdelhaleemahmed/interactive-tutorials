// js/commands/sleep.js

import { addJob, updateJobStatus } from '../jobControl.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * sleep command - Delay for specified number of seconds
 * Usage: sleep <seconds>
 *
 * Can be run in background with &
 *
 * @param {string[]} args - Command arguments
 * @param {boolean} isBackground - Whether running in background
 * @returns {string|Object} Output message or background job info
 */
export const sleepCommand = (args, isBackground = false) => {
    // Check for argument
    if (args.length === 0) {
        return 'sleep: missing operand\nTry \'sleep SECONDS\'';
    }

    const seconds = parseFloat(args[0]);

    // Validate input
    if (isNaN(seconds)) {
        return `sleep: invalid time interval '${args[0]}'`;
    }

    if (seconds < 0) {
        return 'sleep: invalid time interval: Value out of range';
    }

    // Background execution
    if (isBackground) {
        const timeoutId = setTimeout(() => {
            // Mark job as done when sleep completes
            updateJobStatus(job.jobId, "Done");
        }, seconds * 1000);

        // Add job to background jobs list
        const job = addJob(`sleep ${seconds}`, timeoutId);

        // Return job info for display
        return {
            type: 'background',
            jobId: job.jobId,
            pid: job.pid
        };
    }

    // Foreground execution (blocking)
    // In a real terminal this would block, but we can't truly block in JS
    // For now, we'll just return a message
    // TODO: In future, could integrate with terminal to show waiting state
    return {
        type: 'sleep',
        seconds: seconds,
        message: `Sleeping for ${seconds} seconds... (simulated)`
    };
};
