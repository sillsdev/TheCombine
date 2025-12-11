using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
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

        private const string otelTagName = "otel.StatisticsController";

        public StatisticsController(
            IStatisticsService statService, IPermissionService permissionService, IProjectRepository projRepo)
        {
            _statService = statService;
            _permissionService = permissionService;
            _projRepo = projRepo;
        }

        /// <summary> Get a list of <see cref="SemanticDomainCount"/>s of a specific project in order </summary>
        /// <returns> A list of <see cref="SemanticDomainCount"/>s </returns>
        [HttpGet("GetSemanticDomainCounts", Name = "GetSemanticDomainCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainCount>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetSemanticDomainCounts(string projectId, string lang)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting semantic domain counts");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Statistics, projectId))
            {
                return Forbid();
            }

            return Ok(await _statService.GetSemanticDomainCounts(projectId, lang));
        }

        /// <summary> Get a list of <see cref="WordsPerDayPerUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of <see cref="WordsPerDayPerUserCount"/>s </returns>
        [HttpGet("GetWordsPerDayPerUserCounts", Name = "GetWordsPerDayPerUserCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<WordsPerDayPerUserCount>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetWordsPerDayPerUserCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting words per day per user counts");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Statistics, projectId))
            {
                return Forbid();
            }

            return Ok(await _statService.GetWordsPerDayPerUserCounts(projectId));
        }

        /// <summary> Get a <see cref="ChartRootData"/> to generate an estimate Line Chart </summary>
        [HttpGet("GetProgressEstimationLineChartRoot", Name = "GetProgressEstimationLineChartRoot")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ChartRootData))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProgressEstimationLineChartRoot(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting progress estimation line chart root");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Statistics, projectId))
            {
                return Forbid();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound();
            }

            return Ok(await _statService.GetProgressEstimationLineChartRoot(projectId, proj.WorkshopSchedule));
        }

        /// <summary> Get a <see cref="ChartRootData"/> to generate a Line Chart </summary>
        [HttpGet("GetLineChartRootData", Name = "GetLineChartRootData")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ChartRootData))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetLineChartRootData(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting line chart root data");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Statistics, projectId))
            {
                return Forbid();
            }

            return Ok(await _statService.GetLineChartRootData(projectId));
        }

        /// <summary> Get a list of <see cref="SemanticDomainUserCount"/>s of a specific project in order </summary>
        /// <returns> A list of <see cref="SemanticDomainUserCount"/>s </returns>
        [HttpGet("GetSemanticDomainUserCounts", Name = "GetSemanticDomainUserCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainUserCount>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetSemanticDomainUserCounts(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting semantic domain user counts");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Statistics, projectId))
            {
                return Forbid();
            }

            return Ok(await _statService.GetSemanticDomainUserCounts(projectId));
        }

        /// <summary> Get the count of frontier words with senses in a specific semantic domain </summary>
        /// <returns> An integer count </returns>
        [HttpGet("GetDomainWordCount/{domainId}", Name = "GetDomainWordCount")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetDomainWordCount(string projectId, string domainId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting domain word count");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return Ok(await _statService.GetDomainWordCount(projectId, domainId));
        }
    }
}
