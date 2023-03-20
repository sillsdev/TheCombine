using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.Extensions;

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
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
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


        /// <summary> Get a list of WordsPerDayPerUserCount <see cref="WordsPerDayPerUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of WordsPerDayPerUserCount <see cref="WordsPerDayPerUserCount"/>s </returns>
        [HttpGet("GetWordsPerDayPerUserCounts", Name = "GetWordsPerDayPerUserCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<WordsPerDayPerUserCount>))]
        public async Task<IActionResult> GetWordsPerDayPerUserCounts(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
            {
                return Forbid();
            }

            // Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _staService.GetWordsPerDayPerUserCounts(projectId));
        }


        /// <summary> Get a ChartRootData <see cref="ChartRootData"/> to generate a Line Chart</summary>
        [HttpGet("GetLineChartRootData", Name = "GetLineChartRootData")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ChartRootData))]
        public async Task<IActionResult> GetLineChartRootData(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
            {
                return Forbid();
            }

            // Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _staService.GetLineChartRootData(projectId));
        }




        /// <summary> Get a list of SemanticDomainUserCount <see cref="SemanticDomainUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of SemanticDomainUserCount <see cref="SemanticDomainUserCount"/>s </returns>
        [HttpGet("GetSemanticDomainUserCounts", Name = "GetSemanticDomainUserCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainUserCount>))]
        public async Task<IActionResult> GetSemanticDomainUserCounts(string projectId, string lang)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
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
