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
    [Route("v1/semanticdomain")]
    public class SemanticDomainController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IPermissionService _permissionService;
        private readonly ISemanticDomainService _semDomService;

        public SemanticDomainController(
            IProjectRepository projRepo, ISemanticDomainService semDomService, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _permissionService = permissionService;
            _semDomService = semDomService;
        }

        /// <summary> Returns <see cref="SemanticDomainFull"/> with specified id and in specified language </summary>
        [HttpGet("{lang}/domain/{id}", Name = "GetSemanticDomainFull")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainFull))]
        public IActionResult GetSemanticDomainFull(string id, string lang)
        {
            return Ok(new SemanticDomainFull { Name = "Domain API in development" });
        }

        /// <summary> Returns <see cref="SemanticDomainFull"/> with specified id and in specified language </summary>
        [HttpGet("{lang}/node/{id}", Name = "GetSemanticDomainTreeNode")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainTreeNode))]
        public IActionResult GetSemanticDomainTreeNode(string id, string lang)
        {
            var node = new SemanticDomain { Name = "Domain API in development" };
            return Ok(new SemanticDomainTreeNode { Node = node });
        }

        /// <summary>
        /// UNUSED: Returns tree of <see cref="SemanticDomainWithSubdomains"/> for specified <see cref="Project"/>
        /// </summary>
        [AllowAnonymous]
        [HttpGet("{projectId}/semanticdomains", Name = "GetSemDoms")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainWithSubdomains>))]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            var result = _semDomService.ParseSemanticDomains(proj);
            return Ok(result);
        }
    }
}
