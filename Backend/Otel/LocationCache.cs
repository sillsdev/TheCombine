using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace BackendFramework.Otel
{

    public class LocationCache
    {

        private readonly IMemoryCache _memoryCache;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public LocationCache(IMemoryCache memoryCache, IHttpContextAccessor httpContextAccessor)
        {
            _memoryCache = memoryCache;
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task<LocationApi?> GetLocation()
        {

            var check = _memoryCache.TryGetValue("cachedLocation", out LocationApi? existingLoc);
            // activity?.SetTag("loc val...", check);

            LocationApi? response = await _memoryCache.GetOrCreateAsync(
                "cachedLocation",
                async (cacheEntry) =>
                {
                    // activity?.SetTag("found in cache?", "no");
                    return await GetLocationApi();

                });
            return response;
        }

        private async Task<LocationApi?> GetLocationApi()
        {
            using (var activity = BackendActivitySource.Get().StartActivity())
            {
                activity?.AddTag("where", "in kernel");
                if (_httpContextAccessor.HttpContext is { } context)
                {
                    try
                    {
                        var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                        var ipAddressWithoutPort = ipAddress?.Split(':')[0];

                        var route = $"http://ip-api.com/json/{ipAddressWithoutPort}";

                        var httpClient = new HttpClient();
                        var response = await httpClient.GetFromJsonAsync<LocationApi>(route);

                        return response;
                    }
                    catch (Exception e)
                    {
                        activity?.SetTag("Location Exception", e.Message);
                    }
                }
                return null;
            }
        }
    }
}
