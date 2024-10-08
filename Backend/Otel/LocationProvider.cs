

using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
// using SharpCompress.Archives;

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



        public async Task<LocationApi?> OgGetLocation()
        {
            // note: adding any activity tags in this function will cause overflow
            // because function called on each activity in OtelKernel
            if (_contextAccessor.HttpContext is { } context)
            {
                var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                var ipAddressWithoutPort = ipAddress?.Split(':')[0];
                ipAddressWithoutPort = "100.0.0.0";

                LocationApi? location = await _memoryCache.GetOrCreateAsync(
                "location_" + ipAddressWithoutPort,
                async (cacheEntry) =>
                {
                    cacheEntry.SlidingExpiration = TimeSpan.FromHours(1);
                    try
                    {
                        var route = locationGetterUri + $"{ipAddressWithoutPort}";
                        var httpClient = _httpClientFactory.CreateClient();
                        var response = await httpClient.GetFromJsonAsync<LocationApi>(route);
                        return response;
                    }
                    catch (Exception)
                    {
                        // todo consider what to have in cache 
                        Console.WriteLine("Attempted to get location but exception");
                        throw;
                    }
                });
                return location;
            }
            return null;
        }

        public async Task<LocationApi?> GetCached()
        {
            // note: adding any activity tags in this function will cause overflow
            // because function called on each activity in OtelKernel
            if (_contextAccessor.HttpContext is { } context)
            {
                var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                var ipAddressWithoutPort = ipAddress?.Split(':')[0];
                ipAddressWithoutPort = "100.0.0.0";

                LocationApi? location = await _memoryCache.GetOrCreateAsync(
                "location_" + ipAddressWithoutPort,
                async (cacheEntry) =>
                {
                    cacheEntry.SlidingExpiration = TimeSpan.FromHours(1);
                    try
                    {
                        await Task.Run(() => Console.WriteLine("waiting"));
                        return new LocationApi();
                    }
                    catch (Exception)
                    {
                        // todo consider what to have in cache 
                        Console.WriteLine("Attempted to get location but exception");
                        throw;
                    }
                });
                return location;
            }
            return null;
        }




        public async Task<LocationApi?> GetLocation()
        {
            // note: adding any activity tags in this function will cause overflow
            // because function called on each activity in OtelKernel
            if (_contextAccessor.HttpContext is { } context)
            {
                var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                var ipAddressWithoutPort = ipAddress?.Split(':')[0];
                ipAddressWithoutPort = "100.0.0.0";

                LocationApi? location = await _memoryCache.GetOrCreateAsync(
                "location_" + ipAddressWithoutPort,
                async (cacheEntry) =>
                {
                    cacheEntry.SlidingExpiration = TimeSpan.FromHours(1);
                    try
                    {
                        return await GetLocationFromIp(ipAddressWithoutPort);
                    }
                    catch (Exception)
                    {
                        // todo consider what to have in cache 
                        Console.WriteLine("Attempted to get location but exception");
                        throw;
                    }
                });
                return location;
            }
            return null;
        }

        internal async Task<LocationApi?> GetLocationFromIp(string ipAddressWithoutPort)
        {

            var route = locationGetterUri + $"{ipAddressWithoutPort}";
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetFromJsonAsync<LocationApi>(route);
            return response;

        }
    }
}
