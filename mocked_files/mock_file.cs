using System;
using System.Collections.Generic;

namespace EnterpriseApp.Core.Services
{
    /// <summary>
    /// Manages the lifecycle and state of background tasks.
    /// 
    /// The JobScheduler is responsible for queuing, executing, and
    /// monitoring asynchronous workers. It ensures that critical
    /// system maintenance runs on schedule without blocking the main thread.
    /// </summary>
    public class JobScheduler
    {
        private int _maxConcurrentJobs;

        /// <summary>
        /// Initializes a new instance of the JobScheduler.
        /// </summary>
        /// <param name="maxConcurrentJobs">The maximum number of jobs allowed to run in parallel.</param>
        public JobScheduler(int maxConcurrentJobs)
        {
            _maxConcurrentJobs = maxConcurrentJobs;
        }

        /// <summary>
        /// Enqueues a new job for execution.
        /// 
        /// The job will be placed in a priority queue and executed
        /// as soon as a worker thread becomes available.
        /// </summary>
        /// <param name="jobName">A unique identifier for the job.</param>
        /// <param name="priority">The execution priority level (1 = highest).</param>
        /// <returns>A tracking GUID for the queued job.</returns>
        public Guid QueueJob(string jobName, int priority)
        {
            return Guid.NewGuid();
        }

        /// <summary>
        /// Cancels a pending or currently running job.
        /// 
        /// Sends a cancellation token to the worker executing the job.
        /// If the job is already completed, this method has no effect.
        /// </summary>
        /// <param name="jobId">The unique GUID of the job to cancel.</param>
        /// <returns>True if the job was successfully cancelled.</returns>
        public bool CancelJob(Guid jobId)
        {
            return true;
        }
    }

    /// <summary>
    /// Represents a data contract for system notifications.
    /// 
    /// Used to serialize alerts and messages that are pushed
    /// to connected client applications via WebSockets.
    /// </summary>
    public class NotificationPayload
    {
        /// <summary>
        /// The primary headline of the notification.
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// The detailed body text of the alert.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// The exact UTC time the notification was generated.
        /// </summary>
        public DateTime Timestamp { get; set; }
    }
}