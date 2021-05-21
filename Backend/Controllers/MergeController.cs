using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/merge")]
    [EnableCors("AllowAll")]
    public class MergeController : Controller
    {
        private readonly IMergeService _mergeService;
        private readonly IPermissionService _permissionService;

        public MergeController(IMergeService mergeService, IPermissionService permissionService)
        {
            _mergeService = mergeService;
            _permissionService = permissionService;
        }

        /// <summary> Merge children <see cref="Word"/>s with the parent </summary>
        /// <returns> List of ids of new words </returns>
        [HttpPut(Name = "MergeWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        public async Task<IActionResult> MergeWords(
            string projectId, [FromBody, BindRequired] List<MergeWords> mergeWordsList)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return Forbid();
            }

            try
            {
                var newWords = await _mergeService.Merge(projectId, mergeWordsList);
                return Ok(newWords.Select(w => w.Id).ToList());
            }
            catch
            {
                return BadRequest("Merge failed.");
            }
        }

        /// <summary> Add List of <see cref="Word"/>Ids to merge blacklist </summary>
        /// <returns> List of word ids added to blacklist. </returns>
        [HttpPut("blacklist/add", Name = "BlacklistAdd")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        public async Task<IActionResult> BlacklistAdd(string projectId, [FromBody, BindRequired] List<string> wordIds)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return Forbid();
            }

            var userId = _permissionService.GetUserId(HttpContext);
            var blacklistEntry = await _mergeService.AddToMergeBlacklist(projectId, userId, wordIds);
            return Ok(blacklistEntry.WordIds);
        }

        /// <summary> Get lists of potential duplicates for merging. </summary>
        /// <param name="projectId"> Id of project in which to search the frontier for potential duplicates. </param>
        /// <param name="maxInList"> Max number of words allowed within a list of potential duplicates. </param>
        /// <param name="maxLists"> Max number of lists of potential duplicates. </param>
        /// <param name="userId"> Id of user whose merge blacklist is to be used. </param>
        /// <returns> List of Lists of <see cref="Word"/>s. </returns>
        [HttpGet("dups/{maxInList:int}/{maxLists:int}/{userId}", Name = "GetPotentialDuplicates")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<List<Word>>))]
        public async Task<IActionResult> GetPotentialDuplicates(
            string projectId, int maxInList, int maxLists, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return Forbid();
            }

            await _mergeService.UpdateMergeBlacklist(projectId);
            return Ok(
                await _mergeService.GetPotentialDuplicates(projectId, maxInList, maxLists, userId));
        }
    }
}
