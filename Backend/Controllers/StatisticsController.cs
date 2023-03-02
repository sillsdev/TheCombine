using System.Collections.Generic;
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
    [Route("v1/statistics")]

    public class StatisticsController : Controller
    {
        private readonly IStatisticsService _staService;
        private readonly IPermissionService _permissionService;
        private readonly IProjectRepository _projRepo;

        public StatisticsController(IStatisticsService staService, IPermissionService permissionService, IProjectRepository projRepo)
        {
            _staService = staService;
            _permissionService = permissionService;
            _projRepo = projRepo;
        }

        /// <summary> Get a list of SemanticDomainCount <see cref="SemanticDomainCount"/>s of a specific project in order </summary>
        /// <returns> A list of SemanticDomainCount <see cref="SemanticDomainCount"/>s </returns>
        [HttpGet("GetSemanticDomainCounts", Name = "GetSemanticDomainCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainCount>))]
        public async Task<IActionResult> GetSemanticDomainCounts(string projectId, string lang)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _staService.GetSemanticDomainCounts(projectId, lang));
        }


        [HttpGet("GetSemanticDomainTimestampCounts", Name = "GetSemanticDomainTimestampCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainTimestampNode>))]
        public async Task<IActionResult> GetSemanticDomainTimestampCounts(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _staService.GetSemanticDomainTimestampCounts(projectId));
        }


        [HttpGet("GetChartTimestampNodeCounts", Name = "GetChartTimestampNodeCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<ChartTimestampNode>))]
        public async Task<IActionResult> GetChartTimestampNodeCounts(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _staService.GetChartTimestampNodeCounts(projectId));
        }



        /// <summary> Get a list of SemanticDomainUserCount <see cref="SemanticDomainUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of SemanticDomainUserCount <see cref="SemanticDomainUserCount"/>s </returns>
        [HttpGet("GetSemanticDomainUserCounts", Name = "GetSemanticDomainUserCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainUserCount>))]
        public async Task<IActionResult> GetSemanticDomainUserCounts(string projectId, string lang)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            //Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _staService.GetSemanticDomainUserCounts(projectId));
        }
    }
}
