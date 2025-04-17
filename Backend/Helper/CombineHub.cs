using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        // Names for the `method` parameter of _notifyService.Clients.All.SendAsync()
        public const string MethodFailure = "Failure";
        public const string MethodSuccess = "Success";

        // `Url`s for `app.UseEndpoints(e => e.MapHub<CombineHub>($"/{Url}"))`
        public const string UrlExport = "export-hub";
        public const string UrlMerge = "merge-hub";
    }
}
