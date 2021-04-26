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
            if (blacklistEntry is null)
            {
                return new BadRequestResult();
            }
            return new OkObjectResult(blacklistEntry.WordIds);
        }

        /// <summary> Check if a List of <see cref="Word"/>Ids in merge blacklist. </summary>
        /// <remarks> PUT: v1/projects/{projectId}/merge/blacklist/check </remarks>
        /// <returns> A bool: whether the List is in the blacklist. </returns>
        [HttpPut("blacklist/check")]
        public async Task<IActionResult> BlacklistCheck(string projectId, [FromBody] List<string> wordIds)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            var userId = _permissionService.GetUserId(HttpContext);

            var isInBlacklist = await _mergeService.IsInMergeBlacklist(projectId, wordIds);
            return new OkObjectResult(isInBlacklist);
        }

        /// <summary> Update merge blacklist. </summary>
        /// <remarks> Get: v1/projects/{projectId}/merge/blacklist/update </remarks>
        /// <returns> Number of entries. </returns>
        [HttpGet("blacklist/update")]
        public async Task<IActionResult> BlacklistUpdate(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            var entries = await _mergeService.UpdateMergeBlacklist(projectId);
            return new OkObjectResult(entries.Count());
        }
    }
}
