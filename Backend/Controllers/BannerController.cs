using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/banner")]
    public class BannerController : Controller
    {
        private readonly IBannerRepository _bannerRepo;

        public BannerController(IBannerRepository bannerRepo)
        {
            _bannerRepo = bannerRepo;
        }

        /// <summary> Returns the <see cref="Banner"/> for the site. </summary>
        [HttpGet("", Name = "GetBanner")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Banner))]
        public async Task<IActionResult> GetBanner()
        {
            return Ok(await _bannerRepo.Get());
        }
    }
}
