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

                Console.WriteLine("~~START CONTEXT REQUEST HEADERS~~");
                foreach (var key in context.Request.Headers.Keys)
                {
                    Console.WriteLine($"{key}: {context.Request.Headers[key]}");
                }
                Console.WriteLine("~~END CONTEXT REQUEST HEADERS~~");

                Console.WriteLine("~~START CONTEXT CONNECTION~~");
                Console.WriteLine($"LocalIpAddress: {context.Connection.LocalIpAddress}");
                Console.WriteLine($"RemoteIpAddress: {context.Connection.RemoteIpAddress}");
                Console.WriteLine("~~END CONTEXT CONNECTION~~");

                var ipAddress = context.Request.Headers["CF-Connecting-IP"];
                var ipAddressWithoutPort = ipAddress.ToString().Split(':')[0];
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
