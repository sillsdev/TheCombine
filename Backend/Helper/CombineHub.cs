using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using System;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        // Names for the `method` parameter of _notifyService.Clients.All.SendAsync()
        public const string MethodFailure = "Failure";
        public const string MethodSuccess = "Success";
        public const string MethodAcknowledge = "Acknowledge";

        /// <summary> Cache key prefix for tracking acknowledged messages. </summary>
        private const string AckCacheKeyPrefix = "SignalR_Ack_";

        private readonly IMemoryCache _cache;

        public CombineHub(IMemoryCache cache)
        {
            _cache = cache;
        }

        /// <summary>
        /// Client method to acknowledge receipt of a SignalR message.
        /// This helps track message delivery in unreliable network conditions.
        /// </summary>
        /// <param name="requestId">Unique identifier for the request being acknowledged</param>
        public void AcknowledgeMessage(string requestId)
        {
            var cacheKey = AckCacheKeyPrefix + requestId;
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
            };
            _cache.Set(cacheKey, true, cacheOptions);
        }
    }

    public class ExportHub : CombineHub
    {
        public const string Url = "export-hub";

        public ExportHub(IMemoryCache cache) : base(cache) { }
    }

    public class MergeHub : CombineHub
    {
        public const string Url = "merge-hub";

        public MergeHub(IMemoryCache cache) : base(cache) { }
    }
}
