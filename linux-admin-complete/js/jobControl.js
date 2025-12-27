// js/jobControl.js
// Job Control and Background Process Management

/**
 * Job data structure
 * @typedef {Object} Job
 * @property {number} jobId - Shell job number (1, 2, 3...)
 * @property {number} pid - Process ID
 * @property {string} command - Full command line
 * @property {string} status - "Running", "Stopped", "Done", "Terminated"
 * @property {number} startTime - Timestamp when job started
 * @property {number} endTime - Timestamp when job ended (null if running)
 * @property {number} timeoutId - setTimeout ID for cancellation
 */

// Job storage
let jobs = [];
let nextJobId = 1;
let nextPid = 1000;  // Start PIDs at 1000

/**
 * Get next available job ID
 * @returns {number} Next job ID
 */
export function getNextJobId() {
    return nextJobId++;
}

/**
 * Get next available process ID
 * @returns {number} Next PID
 */
export function getNextPid() {
    return nextPid++;
}

/**
 * Add a new background job
 * @param {string} command - Command line
 * @param {number} timeoutId - setTimeout ID (optional)
 * @returns {Job} The created job object
 */
export function addJob(command, timeoutId = null) {
    const job = {
        jobId: getNextJobId(),
        pid: getNextPid(),
        command: command,
        status: "Running",
        startTime: Date.now(),
        endTime: null,
        timeoutId: timeoutId
    };

    jobs.push(job);
    return job;
}

/**
 * Remove a job by job ID
 * @param {number} jobId - Job ID to remove
 * @returns {boolean} True if removed, false if not found
 */
export function removeJob(jobId) {
    const index = jobs.findIndex(j => j.jobId === jobId);
    if (index !== -1) {
        // Cancel timeout if exists
        if (jobs[index].timeoutId) {
            clearTimeout(jobs[index].timeoutId);
        }
        jobs.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Remove a job by PID
 * @param {number} pid - Process ID
 * @returns {boolean} True if removed, false if not found
 */
export function removeJobByPid(pid) {
    const index = jobs.findIndex(j => j.pid === pid);
    if (index !== -1) {
        // Cancel timeout if exists
        if (jobs[index].timeoutId) {
            clearTimeout(jobs[index].timeoutId);
        }
        jobs.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Get job by job ID
 * @param {number} jobId - Job ID
 * @returns {Job|null} Job object or null if not found
 */
export function getJob(jobId) {
    return jobs.find(j => j.jobId === jobId) || null;
}

/**
 * Get job by PID
 * @param {number} pid - Process ID
 * @returns {Job|null} Job object or null if not found
 */
export function getJobByPid(pid) {
    return jobs.find(j => j.pid === pid) || null;
}

/**
 * Get job by command name (partial match)
 * @param {string} commandName - Command name to search
 * @returns {Job|null} Job object or null if not found
 */
export function getJobByCommand(commandName) {
    return jobs.find(j => j.command.includes(commandName)) || null;
}

/**
 * Get all jobs
 * @returns {Job[]} Array of all jobs
 */
export function getAllJobs() {
    return [...jobs];  // Return copy to prevent direct modification
}

/**
 * Get running jobs
 * @returns {Job[]} Array of running jobs
 */
export function getRunningJobs() {
    return jobs.filter(j => j.status === "Running");
}

/**
 * Get stopped jobs
 * @returns {Job[]} Array of stopped jobs
 */
export function getStoppedJobs() {
    return jobs.filter(j => j.status === "Stopped");
}

/**
 * Get most recent job (marked with +)
 * @returns {Job|null} Most recent job or null
 */
export function getMostRecentJob() {
    if (jobs.length === 0) return null;
    return jobs[jobs.length - 1];
}

/**
 * Get second most recent job (marked with -)
 * @returns {Job|null} Second most recent job or null
 */
export function getSecondMostRecentJob() {
    if (jobs.length < 2) return null;
    return jobs[jobs.length - 2];
}

/**
 * Update job status
 * @param {number} jobId - Job ID
 * @param {string} status - New status
 * @returns {boolean} True if updated, false if not found
 */
export function updateJobStatus(jobId, status) {
    const job = getJob(jobId);
    if (job) {
        job.status = status;
        if (status === "Done" || status === "Terminated") {
            job.endTime = Date.now();
        }
        return true;
    }
    return false;
}

/**
 * Update job status by PID
 * @param {number} pid - Process ID
 * @param {string} status - New status
 * @returns {boolean} True if updated, false if not found
 */
export function updateJobStatusByPid(pid, status) {
    const job = getJobByPid(pid);
    if (job) {
        job.status = status;
        if (status === "Done" || status === "Terminated") {
            job.endTime = Date.now();
        }
        return true;
    }
    return false;
}

/**
 * Clean up completed jobs (Done or Terminated)
 * Optionally called after jobs command
 * @returns {number} Number of jobs removed
 */
export function cleanupCompletedJobs() {
    const beforeCount = jobs.length;
    jobs = jobs.filter(j => j.status === "Running" || j.status === "Stopped");
    return beforeCount - jobs.length;
}

/**
 * Kill all jobs (cleanup on terminal reset)
 */
export function killAllJobs() {
    // Cancel all timeouts
    jobs.forEach(job => {
        if (job.timeoutId) {
            clearTimeout(job.timeoutId);
        }
    });
    jobs = [];
    nextJobId = 1;
}

/**
 * Format job for display
 * @param {Job} job - Job object
 * @param {boolean} showPid - Whether to show PID
 * @returns {string} Formatted job string
 */
export function formatJob(job, showPid = false) {
    const mostRecent = getMostRecentJob();
    const secondMostRecent = getSecondMostRecentJob();

    let marker = ' ';
    if (job === mostRecent) marker = '+';
    else if (job === secondMostRecent) marker = '-';

    const jobIdStr = `[${job.jobId}]${marker}`;
    const statusStr = job.status.padEnd(10);
    const pidStr = showPid ? ` ${job.pid}` : '';

    return `${jobIdStr.padEnd(6)} ${statusStr}${pidStr} ${job.command}`;
}

/**
 * Get job count
 * @returns {number} Number of jobs
 */
export function getJobCount() {
    return jobs.length;
}

/**
 * Reset job control system
 */
export function resetJobControl() {
    killAllJobs();
}
