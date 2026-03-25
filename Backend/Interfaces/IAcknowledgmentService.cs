using System;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IAcknowledgmentService
    {
        /// <summary> Mark a request as acknowledged. </summary>
        void MarkAcknowledged(string requestId);

        /// <summary> Send a message with automatic retry for acknowledgment. </summary>
        /// <param name="userId">User ID for the message</param>
        /// <param name="sendMessageAsync">Async function to send the message</param>
        Task SendWithRetry(string userId, Func<string, Task> sendMessageAsync);
    }
}
