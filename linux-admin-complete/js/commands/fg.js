// js/commands/fg.js

import {
    getMostRecentJob,
    getJob,
    getJobByCommand,
    removeJob,
    updateJobStatus
} from '../jobControl.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * fg command - Bring job to foreground
 * Usage: fg [%job_spec]
 *
 * Job spec can be:
 *   (empty)    - Most recent job
 *   %n         - Job number n
 *   %string    - Job whose command contains string
 */
export const fgCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('fg', args);
    if (!validation.valid) {
        return validation.error;
    }

    let job = null;

    // No argument - use most recent job
    if (args.length === 0) {
        job = getMostRecentJob();
        if (!job) {
            return 'fg: current: no such job';
        }
    } else {
        const jobSpec = args[0];

        // Parse job specification
        if (jobSpec.startsWith('%')) {
            const spec = jobSpec.substring(1);

            // Try as job number
            const jobId = parseInt(spec);
            if (!isNaN(jobId)) {
                job = getJob(jobId);
                if (!job) {
                    return `fg: ${jobSpec}: no such job`;
                }
            } else {
                // Try as command name
                job = getJobByCommand(spec);
                if (!job) {
                    return `fg: ${jobSpec}: no such job`;
                }
            }
        } else {
            return `fg: ${jobSpec}: no such job`;
        }
    }

    // If job was stopped, resume it
    if (job.status === "Stopped") {
        updateJobStatus(job.jobId, "Running");
    }

    // Bring job to foreground
    // In real terminal, this would take control and wait
    // For our simulator, we'll show the command and remove from background list
    const command = job.command;
    removeJob(job.jobId);

    return `${command}\n(Job brought to foreground - simulated)`;
};
