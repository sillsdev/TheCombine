using BackendFramework.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        // Names for the `method` parameter of _notifyService.Clients.All.SendAsync()
        public const string MethodFailure = "Failure";
        public const string MethodSuccess = "Success";

        private readonly IAcknowledgmentTracker _ackTracker;

        public CombineHub(IAcknowledgmentTracker ackTracker)
        {
            _ackTracker = ackTracker;
        }

        /// <summary>
        /// Client method to acknowledge receipt of a SignalR message.
        /// This provides confirmation that messages were successfully delivered.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request being acknowledged</param>
        public void AcknowledgeMessage(string requestId)
        {
            _ackTracker.MarkAcknowledged(requestId);
        }
    }

    public class ExportHub : CombineHub
    {
        public const string Url = "export-hub";

        public ExportHub(IAcknowledgmentTracker ackTracker) : base(ackTracker) { }
    }

    public class MergeHub : CombineHub
    {
        public const string Url = "merge-hub";

        public MergeHub(IAcknowledgmentTracker ackTracker) : base(ackTracker) { }
    }
}
