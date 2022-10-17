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
        private readonly ISemanticDomainRepository _semDomRepo;

        public SemanticDomainController(ISemanticDomainRepository semDomRepo)
        {
            _semDomRepo = semDomRepo;
        }

        /// <summary> Returns <see cref="SemanticDomainFull"/> with specified id and in specified language </summary>
        [HttpGet("domainFull", Name = "GetSemanticDomainFull")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainFull))]
        public async Task<IActionResult> GetSemanticDomainFull(string id, string lang)
        {
            return Ok(await _semDomRepo.GetSemanticDomainFull(id, lang));
        }

        /// <summary> Returns <see cref="SemanticDomainTreeNode"/> with specified id and in specified language </summary>
        [HttpGet("domainTreeNode", Name = "GetSemanticDomainTreeNode")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainTreeNode))]
        public async Task<IActionResult> GetSemanticDomainTreeNode(string id, string lang)
        {
            return Ok(await _semDomRepo.GetSemanticDomainTreeNode(id, lang));
        }

        /// <summary> Returns <see cref="SemanticDomainTreeNode"/> with specified name and in specified language </summary>
        [HttpGet("domainByName", Name = "GetSemanticDomainTreeNodeByName")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SemanticDomainTreeNode))]
        public async Task<IActionResult> GetSemanticDomainTreeNodeByName(string name, string lang)
        {
            return Ok(await _semDomRepo.GetSemanticDomainTreeNodeByName(name, lang));
        }
    }
}
