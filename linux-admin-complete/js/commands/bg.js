// js/commands/bg.js

import {
    getMostRecentJob,
    getJob,
    getStoppedJobs,
    updateJobStatus
} from '../jobControl.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * bg command - Resume job in background
 * Usage: bg [%job_spec]
 *
 * Resumes a stopped job in the background
 */
export const bgCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('bg', args);
    if (!validation.valid) {
        return validation.error;
    }

    let job = null;

    // No argument - use most recent stopped job
    if (args.length === 0) {
        const stoppedJobs = getStoppedJobs();
        if (stoppedJobs.length === 0) {
            return 'bg: no current job';
        }
        job = stoppedJobs[stoppedJobs.length - 1];  // Most recent stopped
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
                    return `bg: ${jobSpec}: no such job`;
                }
            } else {
                return `bg: ${jobSpec}: no such job`;
            }
        } else {
            return `bg: ${jobSpec}: no such job`;
        }
    }

    // Check if job is already running
    if (job.status === "Running") {
        return `bg: job ${job.jobId} already in background`;
    }

    // Check if job is done/terminated
    if (job.status === "Done" || job.status === "Terminated") {
        return `bg: job ${job.jobId} has terminated`;
    }

    // Resume job in background
    updateJobStatus(job.jobId, "Running");

    return `[${job.jobId}]+ ${job.command} &`;
};
