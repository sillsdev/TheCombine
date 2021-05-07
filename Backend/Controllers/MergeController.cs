using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

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
        /// <remarks> PUT: v1/projects/{projectId}/merge </remarks>
        /// <returns> List of ids of new words </returns>
        [HttpPut]
        public async Task<IActionResult> Put(string projectId, [FromBody] List<MergeWords> mergeWordsList)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            try
            {
                var newWords = await _mergeService.Merge(projectId, mergeWordsList);
                return new OkObjectResult(newWords.Select(w => w.Id).ToList());
            }
            catch
            {
                return new BadRequestResult();
            }
        }

        /// <summary> Add List of <see cref="Word"/>Ids to merge blacklist </summary>
        /// <remarks> PUT: v1/projects/{projectId}/merge/blacklist/add </remarks>
        /// <returns> List of word ids added to blacklist. </returns>
        [HttpPut("blacklist/add")]
        public async Task<IActionResult> BlacklistAdd(string projectId, [FromBody] List<string> wordIds)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }
            var userId = _permissionService.GetUserId(HttpContext);
            var blacklistEntry = await _mergeService.AddToMergeBlacklist(projectId, userId, wordIds);
            return new OkObjectResult(blacklistEntry.WordIds);
        }

        /// <summary> Get lists of potential duplicates for merging. </summary>
        /// <remarks> Get: v1/projects/{projectId}/merge/dups/{maxInList}/{maxLists}/{userid} </remarks>
        /// <param name="projectId"> Id of project in which to search the frontier for potential duplicates. </param>
        /// <param name="maxInList"> Max number of words allowed within a list of potential duplicates. </param>
        /// <param name="maxLists"> Max number of lists of potential duplicates. </param>
        /// <param name="userId"> Id of user whose merge blacklist is to be used. </param>
        /// <returns> List of Lists of <see cref="Word"/>s. </returns>
        [HttpGet("dups/{maxInList:int}/{maxLists:int}/{userid}")]
        public async Task<IActionResult> GetPotentialDuplicates(
            string projectId, int maxInList, int maxLists, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }
            await _mergeService.UpdateMergeBlacklist(projectId);
            return new OkObjectResult(
                await _mergeService.GetPotentialDuplicates(projectId, maxInList, maxLists, userId));
        }
    }
}
