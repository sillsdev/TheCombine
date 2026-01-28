using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        // Names for the `method` parameter of _notifyService.Clients.All.SendAsync()
        public const string MethodFailure = "Failure";
        public const string MethodSuccess = "Success";

        /// <summary>
        /// Client method to acknowledge receipt of a SignalR message.
        /// This provides confirmation that messages were successfully delivered.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request being acknowledged</param>
        public void AcknowledgeMessage(string requestId)
        {
            // Log the acknowledgment - foundation for future retry logic
            // For now, this confirms the message was received by the client
        }
    }

    public class ExportHub : CombineHub
    {
        public const string Url = "export-hub";
    }

    public class MergeHub : CombineHub
    {
        public const string Url = "merge-hub";
    }
}
