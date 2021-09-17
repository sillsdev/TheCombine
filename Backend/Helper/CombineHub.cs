using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        public const string DownloadReady = "DownloadReady";
    }
}
