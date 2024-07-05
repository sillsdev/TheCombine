

using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace BackendFramework.Otel
{
    public class LocationProvider
    {
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
            if (_contextAccessor.HttpContext is { } context)
            {
                var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                var ipAddressWithoutPort = ipAddress?.Split(':')[0];

                LocationApi? location = await _memoryCache.GetOrCreateAsync(
                "location_" + ipAddressWithoutPort,
                async (cacheEntry) =>
                {
                    // data?.SetTag("found in cache?", "no");
                    cacheEntry.SlidingExpiration = TimeSpan.FromHours(1);

                    try
                    {
                        var route = $"http://ip-api.com/json/{ipAddressWithoutPort}";
                        var httpClient = _httpClientFactory.CreateClient();
                        var response = await httpClient.GetFromJsonAsync<LocationApi>(route);

                        return response;
                        // return new LocationApi { };

                    }
                    catch (Exception)
                    {
                        // todo figure out what to put in catch 
                        // data?.SetTag("Location Exception", e.Message);
                        Console.WriteLine("Attempted to get location but exception");
                        return null;
                    }


                    // return new LocationApi { };
                    // return null;
                });

                return location;
            }
            return null;
        }
    }
}
