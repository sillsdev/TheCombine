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

        /// <summary> Get a list of keyValuePair of SemanticDomainCounts <see cref="SemanticDomainTreeNode"/>s that key:SemanticDomainTreeNode and value:counts as int of a specific project in order </summary>
        /// <returns> A list of keyValuePair<SemanticDomainTreeNode, int> <see cref="SemanticDomainTreeNode"/>s </returns>
        [HttpGet("GetSemanticDomainCounts", Name = "GetSemanticDomainCounts")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<KeyValuePair<SemanticDomainTreeNode, int>>))]
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
    }
}
