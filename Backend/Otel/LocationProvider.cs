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
                var ipAddress = context.Request.Headers["X-Original-Forwarded-For"].ToString();
                if (string.IsNullOrEmpty(ipAddress))
                {
                    return null;
                }

                return await _memoryCache.GetOrCreateAsync(
                    "location_" + ipAddress,
                    async (cacheEntry) =>
                    {
                        cacheEntry.SlidingExpiration = TimeSpan.FromHours(1);
                        return await GetLocationFromIp(ipAddress);
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
