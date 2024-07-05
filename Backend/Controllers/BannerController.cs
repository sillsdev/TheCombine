// using System;
// using System.Net.Http;
// using System.Net.Http.Json;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;

// using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Caching.Memory;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/banner")]
    public class BannerController : Controller
    {
        private readonly IBannerRepository _bannerRepo;
        private readonly IPermissionService _permissionService;

        private readonly IMemoryCache _memoryCache;

        private const string otelTagName = "otel.report.controller";

        public BannerController(IBannerRepository bannerRepo, IPermissionService permissionService, IMemoryCache memoryCache)
        {
            _bannerRepo = bannerRepo;
            _permissionService = permissionService;
            _memoryCache = memoryCache;
        }

        /// <summary> Returns the <see cref="Banner"/> for the specified <see cref="BannerType"/>. </summary>
        /// <remarks> Banners are readable by any request and do not require permissions. </remarks>
        [AllowAnonymous]
        [HttpGet("", Name = "GetBanner")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SiteBanner))]
        public async Task<IActionResult> GetBanner(BannerType type)
        {

            using (var activity = BackendActivitySource.Get().StartActivity())
            {
                activity?.AddTag(otelTagName, "in the banner!");
            }


            /*
            using (var activity = BackendActivitySource.Get().StartActivity())
            {

                activity?.AddTag(otelTagName, "in the banner!");

                var check = _memoryCache.TryGetValue("cachedLocation", out LocationApi? existingLoc);
                activity?.SetTag("loc val...", check);

                if (HttpContext is { } context)
                {
                    var ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? context.Connection.RemoteIpAddress?.ToString();
                    var ipAddressWithoutPort = ipAddress?.Split(':')[0];
                    var nums = 12;

                    activity?.SetTag("address", ipAddressWithoutPort);
                    activity?.SetTag("keyaddress", "location_" + nums);



                    LocationApi? response = await _memoryCache.GetOrCreateAsync(
                    "location_" + ipAddressWithoutPort,
                    async (cacheEntry) =>
                    {
                        activity?.SetTag("found in cache?", "no");
                        activity?.SetTag("uniquekey", "location_" + nums);

                        if (HttpContext is { } context)
                        {
                            try
                            {
                                string? ipAddress = context.GetServerVariable("HTTP_X_FORWARDED_FOR") ?? HttpContext.Connection.RemoteIpAddress?.ToString();
                                var ipAddressWithoutPort = ipAddress?.Split(':')[0];
                                activity?.SetTag("CHECKIP", ipAddressWithoutPort);


                                var route = $"http://ip-api.com/json/{ipAddressWithoutPort}";


                                activity?.SetTag("route", route);

                                var httpClient = new HttpClient();
                                var response = await httpClient.GetFromJsonAsync<LocationApi>(route);

                                return response;

                            }
                            catch (Exception e)
                            {
                                // todo figure out what to put in catch 
                                activity?.SetTag("Location Exception", e.Message);
                            }
                        }
                        return null;
                    });

                    var location = new
                    {
                        Country = response?.country,
                        Region = response?.regionName,
                        City = response?.city,
                    };


                    activity?.AddTag("country", location.Country);
                    activity?.AddTag("region", location.Region);
                    activity?.AddTag("city", location.City);
                }

            }
            */

            var banner = await _bannerRepo.GetBanner(type);
            return Ok(new SiteBanner { Type = type, Text = banner.Text });
        }

        /// <summary>
        /// Update the <see cref="Banner"/> with same <see cref="BannerType"/> as the given <see cref="SiteBanner"/>.
        /// </summary>
        [HttpPut("", Name = "UpdateBanner")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> UpdateBanner([FromBody, BindRequired] SiteBanner banner)
        {
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

            var result = await _bannerRepo.Update(banner);
            return Ok(result == ResultOfUpdate.Updated);
        }
    }
}
