using System;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IAcknowledgmentTracker
    {
        /// <summary> Mark a request as acknowledged. </summary>
        void MarkAcknowledged(string requestId);

        /// <summary>
        /// Fire-and-forget sending a message with automatic retry for acknowledgment.
        /// </summary>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        void SendWithRetryTaskRun(string userId, Func<string, Task> sendMessageAsync);
    }
}
