using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        // Names for the `method` parameter of _notifyService.Clients.All.SendAsync()
        public const string MethodFailure = "Failure";
        public const string MethodSuccess = "Success";
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
