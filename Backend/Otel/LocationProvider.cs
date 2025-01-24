using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace BackendFramework.Otel
{
    public class LocationProvider : ILocationProvider
    {
        public const string locationGetterUri = "http://ip-api.com/json/";
        private readonly IHttpContextAccessor _contextAccessor;
        private readonly IMemoryCache _memoryCache;
        private readonly IHttpClientFactory _httpClientFactory;
        public LocationProvider(IHttpContextAccessor contextAccessor, IMemoryCache memoryCache, IHttpClientFactory httpClientFactory)
        {
            _contextAccessor = contextAccessor;
            _memoryCache = memoryCache;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<LocationApi?> GetLocation()
        {
            // note: adding any activity tags in this function will cause overflow
            // because OtelKernel calls the function for each activity
            if (_contextAccessor.HttpContext is { } context)
            {
                // If server no longer behind Cloudflare, replace "HTTP_CF_CONNECTING_IP"
                // with "HTTP_X_FORWARDED_FOR", "REMOTE_ADDR", or "HTTP_CLIENT_IP",
                // or try context.Connection.RemoteIpAddress?.ToString()
                var ipAddress = context.GetServerVariable("HTTP_CF_CONNECTING_IP");
                var ipAddressWithoutPort = ipAddress?.Split(':')[0];
                if (string.IsNullOrEmpty(ipAddressWithoutPort))
                {
                    return null;
                }

                return await _memoryCache.GetOrCreateAsync(
                    "location_" + ipAddressWithoutPort,
                    async (cacheEntry) =>
                    {
                        cacheEntry.SlidingExpiration = TimeSpan.FromHours(1);
                        return await GetLocationFromIp(ipAddressWithoutPort);
                    }
                );
            }
            return null;
        }

        internal async Task<LocationApi?> GetLocationFromIp(string? ipAddressWithoutPort)
        {
            var route = locationGetterUri + $"{ipAddressWithoutPort}";
            var httpClient = _httpClientFactory.CreateClient();
            return await httpClient.GetFromJsonAsync<LocationApi>(route);
        }
    }
}
