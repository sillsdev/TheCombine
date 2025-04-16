using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Helper
{
    public class ExportHub : Hub
    {
        public const string Failure = "ExportFailed";
        public const string Success = "DownloadReady";
        public const string Url = "export-hub";
    }

    public class MergeHub : Hub
    {
        public const string Failure = "DuplicateFinderFailed";
        public const string Success = "DuplicatesReady";
        public const string Url = "merge-hub";
    }
}
