// js/commands/jobs.js

import {
    getAllJobs,
    getRunningJobs,
    getStoppedJobs,
    formatJob,
    cleanupCompletedJobs
} from '../jobControl.js';
import { validateArgs } from '../argumentValidator.js';

/**
 * jobs command - List background jobs
 * Usage: jobs [-l] [-r] [-s]
 *
 * Options:
 *   -l    Show process IDs
 *   -r    Show running jobs only
 *   -s    Show stopped jobs only
 *
 * Output format:
 *   [jobId]marker  status  [pid]  command
 *   marker: + (most recent), - (second most recent), or space
 */
export const jobsCommand = (args) => {
    // Validate arguments
    const validation = validateArgs('jobs', args);
    if (!validation.valid) {
        return validation.error;
    }

    let showPid = false;
    let filter = 'all';  // 'all', 'running', 'stopped'

    // Parse flags
    for (const arg of args) {
        if (arg === '-l') {
            showPid = true;
        } else if (arg === '-r') {
            filter = 'running';
        } else if (arg === '-s') {
            filter = 'stopped';
        } else if (arg.startsWith('-')) {
            return `jobs: invalid option -- '${arg.substring(1)}'\nTry 'jobs [-l] [-r] [-s]'`;
        }
    }

    // Clean up completed jobs before listing
    cleanupCompletedJobs();

    // Get jobs based on filter
    let jobsToShow;
    if (filter === 'running') {
        jobsToShow = getRunningJobs();
    } else if (filter === 'stopped') {
        jobsToShow = getStoppedJobs();
    } else {
        jobsToShow = getAllJobs();
    }

    // If no jobs, return empty
    if (jobsToShow.length === 0) {
        return '';
    }

    // Format and display jobs
    const output = jobsToShow.map(job => formatJob(job, showPid)).join('\n');
    return output;
};
