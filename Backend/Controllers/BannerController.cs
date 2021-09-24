using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/banner")]
    public class BannerController : Controller
    {
        private readonly IBannerRepository _bannerRepo;
        private readonly IPermissionService _permissionService;

        public BannerController(IBannerRepository bannerRepo, IPermissionService permissionService)
        {
            _bannerRepo = bannerRepo;
            _permissionService = permissionService;
        }

        /// <summary> Returns the <see cref="Banner"/> for the specified <see cref="BannerType"/>. </summary>
        /// <remarks> Banners are readable by any request and do not require permissions. </remarks>
        [AllowAnonymous]
        [HttpGet("", Name = "GetBanner")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SiteBanner))]
        public async Task<IActionResult> GetBanner(BannerType type)
        {
            var banner = await _bannerRepo.Get(type);
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
