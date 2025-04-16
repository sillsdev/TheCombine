using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.SignalR;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/merge")]
    public class MergeController : Controller
    {
        private readonly IMergeService _mergeService;
        private readonly IHubContext<MergeHub> _notifyService;
        private readonly IPermissionService _permissionService;

        public MergeController(
            IMergeService mergeService, IHubContext<MergeHub> notifyService, IPermissionService permissionService)
        {
            _mergeService = mergeService;
            _notifyService = notifyService;
            _permissionService = permissionService;
        }

        /// <summary> Merge children <see cref="Word"/>s with the parent </summary>
        /// <returns> List of ids of new words </returns>
        [HttpPut(Name = "MergeWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        public async Task<IActionResult> MergeWords(
            string projectId, [FromBody, BindRequired] List<MergeWords> mergeWordsList)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.MergeAndReviewEntries, projectId))
            {
                return Forbid();
            }
            var userId = _permissionService.GetUserId(HttpContext);

            try
            {
                var newWords = await _mergeService.Merge(projectId, userId, mergeWordsList);
                return Ok(newWords.Select(w => w.Id).ToList());
            }
            catch
            {
                return BadRequest("Merge failed.");
            }
        }

        /// <summary> Undo merge </summary>
        /// <returns> True if merge was successfully undone </returns>
        [HttpPut("undo", Name = "UndoMerge")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> UndoMerge(string projectId, [FromBody, BindRequired] MergeUndoIds merge)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.MergeAndReviewEntries, projectId))
            {
                return Forbid();
            }
            var userId = _permissionService.GetUserId(HttpContext);

            var undo = await _mergeService.UndoMerge(projectId, userId, merge);
            return Ok(undo);
        }

        /// <summary> Add List of <see cref="Word"/>Ids to merge blacklist </summary>
        /// <returns> List of word ids added to blacklist. </returns>
        [HttpPut("blacklist/add", Name = "BlacklistAdd")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        public async Task<IActionResult> BlacklistAdd(string projectId, [FromBody, BindRequired] List<string> wordIds)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.MergeAndReviewEntries, projectId))
            {
                return Forbid();
            }

            var userId = _permissionService.GetUserId(HttpContext);
            var blacklistEntry = await _mergeService.AddToMergeBlacklist(projectId, userId, wordIds);
            return Ok(blacklistEntry.WordIds);
        }

        /// <summary> Add List of <see cref="Word"/>Ids to merge graylist </summary>
        /// <returns> List of word ids added to graylist. </returns>
        [HttpPut("graylist/add", Name = "graylistAdd")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        public async Task<IActionResult> GraylistAdd(string projectId, [FromBody, BindRequired] List<string> wordIds)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.MergeAndReviewEntries, projectId))
            {
                return Forbid();
            }

            var userId = _permissionService.GetUserId(HttpContext);
            var graylistEntry = await _mergeService.AddToMergeGraylist(projectId, userId, wordIds);
            return Ok(graylistEntry.WordIds);
        }

        /// <summary> Start finding lists of potential duplicates for merging. </summary>
        /// <param name="projectId"> Id of project in which to search the frontier for potential duplicates. </param>
        /// <param name="maxInList"> Max number of words allowed within a list of potential duplicates. </param>
        /// <param name="maxLists"> Max number of lists of potential duplicates. </param>
        [HttpGet("finddups/{maxInList:int}/{maxLists:int}", Name = "FindPotentialDuplicates")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> FindPotentialDuplicates(string projectId, int maxInList, int maxLists)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.MergeAndReviewEntries, projectId))
            {
                return Forbid();
            }

            var userId = _permissionService.GetUserId(HttpContext);

            await _mergeService.UpdateMergeBlacklist(projectId);

            // Run the task without waiting for completion.
            // This Task will be scheduled within the exiting Async executor thread pool efficiently.
            // See: https://stackoverflow.com/a/64614779/1398841
            _ = Task.Run(() => GetDuplicatesThenSignal(projectId, maxInList, maxLists, userId));
            return Ok();
        }

        // Internal method extracted for unit testing.
        internal async Task<bool> GetDuplicatesThenSignal(string projectId, int maxInList, int maxLists, string userId)
        {
            // Use timestamp to ensure that only the most recent duplicate request succeeds per user.
            var now = DateTime.UtcNow;
            _mergeService.StoreDups(userId, now, null);
            var dups = await _mergeService.GetPotentialDuplicates(projectId, maxInList, maxLists, userId);
            // Store the potential duplicates for user to retrieve later.
            var success = _mergeService.StoreDups(userId, now, dups);
            if (success)
            {
                await _notifyService.Clients.All.SendAsync(MergeHub.Success, userId);
            }
            return success;
        }

        /// <summary> Retrieve current user's potential duplicates for merging. </summary>
        /// <returns> List of Lists of <see cref="Word"/>s, each sublist a set of potential duplicates. </returns>
        [HttpGet("retrievedups", Name = "RetrievePotentialDuplicates")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<List<Word>>))]
        public IActionResult RetrievePotentialDuplicates()
        {
            var userId = _permissionService.GetUserId(HttpContext);
            var dups = _mergeService.RetrieveDups(userId);
            return dups is null ? BadRequest() : Ok(dups);
        }

        /// <summary> Get lists of graylist entries. </summary>
        /// <param name="projectId"> Id of project in which to search the frontier for potential duplicates. </param>
        /// <param name="maxLists"> Max number of lists of potential duplicates. </param>
        /// <param name="userId"> Id of user whose merge graylist is to be used. </param>
        /// <returns> List of Lists of <see cref="Word"/>s. </returns>
        [HttpGet("getgraylist/{maxLists}/{userId}", Name = "GetGraylistEntries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<List<Word>>))]
        public async Task<IActionResult> getGraylistEntries(
            string projectId, int maxLists, string userId)
        {
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.MergeAndReviewEntries, projectId))
            {
                return Forbid();
            }

            await _mergeService.UpdateMergeGraylist(projectId);
            return Ok(await _mergeService.GetGraylistEntries(projectId, maxLists, userId));
        }

    }
}
