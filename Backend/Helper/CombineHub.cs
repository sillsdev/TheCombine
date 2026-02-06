using BackendFramework.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class CombineHub(IAcknowledgmentService ackService) : Hub
    {
        // Names for the `method` parameter of _notifyService.Clients.All.SendAsync()
        public const string MethodFailure = "Failure";
        public const string MethodSuccess = "Success";

        private readonly IAcknowledgmentService _ackService = ackService;

        /// <summary> Client method to acknowledge receipt of a SignalR message. </summary>
        /// <param name="requestId">Unique identifier for the request being acknowledged</param>
        public void AcknowledgeMessage(string requestId)
        {
            _ackService.MarkAcknowledged(requestId);
        }
    }

    public class ExportHub(IAcknowledgmentService ackService) : CombineHub(ackService)
    {
        public const string Url = "export-hub";
    }

    public class MergeHub(IAcknowledgmentService ackService) : CombineHub(ackService)
    {
        public const string Url = "merge-hub";
    }
}
