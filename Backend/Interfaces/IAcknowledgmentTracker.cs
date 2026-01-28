using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace BackendFramework.Interfaces
{
    public interface IAcknowledgmentTracker
    {
        /// <summary> Register a new request to track for acknowledgment. </summary>
        void TrackRequest(string requestId, string userId);

        /// <summary> Mark a request as acknowledged. </summary>
        void MarkAcknowledged(string requestId);

        /// <summary> Check if a request has been acknowledged. </summary>
        bool IsAcknowledged(string requestId);

        /// <summary> Remove a request from tracking (cleanup). </summary>
        void RemoveRequest(string requestId);

        /// <summary>
        /// Send a message with automatic retry logic if acknowledgment is not received.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request</param>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        /// <param name="logger">Logger for tracking retry attempts</param>
        Task SendWithRetryAsync(
            string requestId,
            string userId,
            Func<Task> sendMessageAsync,
            ILogger logger);
    }
}
