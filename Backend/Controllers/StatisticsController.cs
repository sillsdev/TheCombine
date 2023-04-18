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
    [Route("v1/projects/{projectId}/statistics")]


    public class StatisticsController : Controller
    {
        private readonly IStatisticsService _statService;
        private readonly IPermissionService _permissionService;
        private readonly IProjectRepository _projRepo;

        public StatisticsController(IStatisticsService statService, IPermissionService permissionService, IProjectRepository projRepo)
        {
            _statService = statService;
            _permissionService = permissionService;
            _projRepo = projRepo;
        }

        /// <summary> Get a list of <see cref="SemanticDomainCount"/>s of a specific project in order </summary>
        /// <returns> A list of <see cref="SemanticDomainCount"/>s </returns>
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

            return Ok(await _statService.GetSemanticDomainCounts(projectId, lang));
        }


        /// <summary> Get a list of <see cref="WordsPerDayPerUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of <see cref="WordsPerDayPerUserCount"/>s </returns>
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

            return Ok(await _statService.GetWordsPerDayPerUserCounts(projectId));
        }


        /// <summary> Get a <see cref="ChartRootData"/> to generate an estimate Line Chart</summary>
        [HttpGet("GetProgressEstimationLineChartRoot", Name = "GetProgressEstimationLineChartRoot")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ChartRootData))]
        public async Task<IActionResult> GetProgressEstimationLineChartRoot(string projectId)
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

            return Ok(await _statService.GetProgressEstimationLineChartRoot(projectId, proj));
        }


        /// <summary> Get a <see cref="ChartRootData"/> to generate a Line Chart</summary>
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

            return Ok(await _statService.GetLineChartRootData(projectId));
        }



        /// <summary> Get a list of <see cref="SemanticDomainUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of <see cref="SemanticDomainUserCount"/>s </returns>
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

            return Ok(await _statService.GetSemanticDomainUserCounts(projectId));
        }
    }
}
