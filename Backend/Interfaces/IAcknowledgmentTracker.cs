using System;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IAcknowledgmentTracker
    {
        /// <summary> Mark a request as acknowledged. </summary>
        void MarkAcknowledged(string requestId);

        /// <summary>
        /// Send a message with automatic retry logic if acknowledgment is not received.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request</param>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        Task SendWithRetryAsync(string requestId, string userId, Func<Task> sendMessageAsync);
    }
}
