using System.Collections.Generic;
using System.Linq;
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

        /// <summary>
        /// Returns a dictionary mapping domain ids to names in the specified language (fallback: "en").
        /// </summary>
        [HttpGet("allDomainNames", Name = "GetAllSemanticDomainNames")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Dictionary<string, string>))]
        public async Task<IActionResult> GetAllSemanticDomainNames(string lang)
        {
            var semDoms = await _semDomRepo.GetAllSemanticDomainTreeNodes(lang)
                ?? await _semDomRepo.GetAllSemanticDomainTreeNodes("en")
                ?? new();
            return Ok(semDoms.ToDictionary(x => x.Id, x => x.Name));
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

        /// <summary> Returns a list of all <see cref="SemanticDomainTreeNode"/>s in specified language </summary>
        [HttpGet("domainGetAll", Name = "GetAllSemanticDomainTreeNodes")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<SemanticDomainTreeNode>))]
        public async Task<IActionResult> GetAllSemanticDomainTreeNodes(string lang)
        {
            return Ok(await _semDomRepo.GetAllSemanticDomainTreeNodes(lang));
        }
    }
}
