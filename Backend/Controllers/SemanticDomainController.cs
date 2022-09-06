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
        private readonly ISemanticDomainRepository _semDomRepo;

        public SemanticDomainController(
            IProjectRepository projRepo, ISemanticDomainRepository semDomRepo, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _permissionService = permissionService;
            _semDomRepo = semDomRepo;
        }

        /// <summary> Returns <see cref="SemanticDomainFull"/> with specified id and in specified language </summary>
        [HttpGet("{lang}/domain/{id}", Name = "GetSemanticDomainFull")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainFull))]
        public IActionResult GetSemanticDomainFull(string id, string lang)
        {
            return Ok(_semDomRepo.GetSemanticDomainFull(id, lang));
        }

        /// <summary> Returns <see cref="SemanticDomainFull"/> with specified id and in specified language </summary>
        [HttpGet("{lang}/node/{id}", Name = "GetSemanticDomainTreeNode")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainTreeNode))]
        public IActionResult GetSemanticDomainTreeNode(string id, string lang)
        {
            return Ok(_semDomRepo.GetSemanticDomainTreeNode(id, lang));
        }
    }
}
