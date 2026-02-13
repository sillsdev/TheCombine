using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    public class WordController(
        IWordRepository wordRepo, IWordService wordService, IPermissionService permissionService) : Controller
    {
        private readonly IWordRepository _wordRepo = wordRepo;
        private readonly IPermissionService _permissionService = permissionService;
        private readonly IWordService _wordService = wordService;

        private const string otelTagName = "otel.WordController";

        /// <summary> Deletes specified Frontier <see cref="Word"/>. </summary>
        [HttpDelete("frontier/{wordId}", Name = "DeleteFrontierWord")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteFrontierWord(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a word from Frontier");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }
            var userId = _permissionService.GetUserId(HttpContext);

            var deleted = await _wordService.DeleteFrontierWord(projectId, userId, wordId);
            return deleted is null ? NotFound() : Ok();
        }

        /// <summary> Returns <see cref="Word"/> with specified id. </summary>
        [HttpGet("{wordId}", Name = "GetWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Word))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetWord(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a word");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            Word? word = await _wordRepo.GetWord(projectId, wordId);
            return word is null ? NotFound() : Ok(word);
        }

        /// <summary> Checks if Frontier for specified <see cref="Project"/> has any words. </summary>
        [HttpGet("hasfrontierwords", Name = "HasFrontierWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> HasFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier has any words");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return Ok(await _wordRepo.HasFrontierWords(projectId));
        }

        /// <summary> Returns count of Frontier <see cref="Word"/>s in specified <see cref="Project"/>. </summary>
        [HttpGet("frontiercount", Name = "GetFrontierCount")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetFrontierCount(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting count of Frontier words");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return Ok(await _wordRepo.GetFrontierCount(projectId));
        }

        /// <summary> Returns all Frontier <see cref="Word"/>s in specified <see cref="Project"/>. </summary>
        [HttpGet("frontier", Name = "GetProjectFrontierWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetProjectFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all Frontier words");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return Ok(await _wordRepo.GetAllFrontier(projectId));
        }

        /// <summary> Checks if Frontier has <see cref="Word"/> in specified <see cref="Project"/>. </summary>
        [HttpGet("isinfrontier/{wordId}", Name = "IsInFrontier")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> IsInFrontier(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains a word");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return Ok(await _wordRepo.IsInFrontier(projectId, wordId));
        }

        /// <summary> Checks if Frontier has words in specified <see cref="Project"/>. </summary>
        [HttpPost("areinfrontier", Name = "AreInFrontier")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AreInFrontier(string projectId, [FromBody, BindRequired] List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains given words");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            var idsInFrontier = new List<string>();
            foreach (var id in wordIds)
            {
                if (await _wordRepo.IsInFrontier(projectId, id))
                {
                    idsInFrontier.Add(id);
                }
            }
            return Ok(idsInFrontier);
        }

        /// <summary>
        /// Checks if a <see cref="Word"/> is a duplicate--i.e., are its primary text fields
        /// (Vernacular, Gloss text, Definition text) contained in a frontier entry?
        /// </summary>
        /// <returns> Id of containing word, or empty string if none. </returns>
        [HttpPost("getduplicateid", Name = "GetDuplicateId")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetDuplicateId(string projectId, [FromBody, BindRequired] Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking for duplicates of a word");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }
            word.ProjectId = projectId;

            string? containingId = await _wordService.FindContainingWord(word);
            return Ok(containingId ?? "");
        }

        /// <summary> Combines a <see cref="Word"/> into the existing duplicate with specified wordId. </summary>
        /// <returns> Id of updated word. </returns>
        [HttpPost("{dupId}", Name = "UpdateDuplicate")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateDuplicate(
            string projectId, string dupId, [FromBody, BindRequired] Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "combining duplicate words");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }
            word.ProjectId = projectId;

            var duplicatedWord = await _wordRepo.GetFrontier(word.ProjectId, dupId);
            if (duplicatedWord is null)
            {
                return NotFound();
            }

            var userId = _permissionService.GetUserId(HttpContext);
            if (!duplicatedWord.AppendContainedWordContents(word, userId))
            {
                return Conflict();
            }

            string? newId = (await _wordService.Update(userId, duplicatedWord))?.Id;
            return newId is null ? NotFound() : Ok(newId);
        }

        /// <summary> Creates a <see cref="Word"/>. </summary>
        /// <returns> Id of created word. </returns>
        [HttpPost(Name = "CreateWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateWord(string projectId, [FromBody, BindRequired] Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a word");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            word.ProjectId = projectId;

            string newId = (await _wordService.Create(_permissionService.GetUserId(HttpContext), word)).Id;
            return Ok(newId);
        }

        /// <summary> Updates a <see cref="Word"/>. </summary>
        /// <returns> Id of updated word </returns>
        [HttpPut("{wordId}", Name = "UpdateWord")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateWord(
            string projectId, string wordId, [FromBody, BindRequired] Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a word");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Don't allow changing project or manually setting the Id.
            word.ProjectId = projectId;
            word.Id = wordId;

            string? newId = (await _wordService.Update(_permissionService.GetUserId(HttpContext), word))?.Id;
            return newId is null ? NotFound() : Ok(newId);
        }

        /// <summary> Restore a deleted <see cref="Word"/>. </summary>
        [HttpGet("restore/{wordId}", Name = "RestoreWord")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RestoreWord(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "restoring a word");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return await _wordService.RestoreFrontierWords(projectId, [wordId]) ? Ok() : BadRequest();
        }

        /// <summary> Revert words from a dictionary of word ids (key: to revert to; value: from frontier). </summary>
        /// <returns> Id dictionary of all words successfully updated (key: was in frontier; value: new id). </returns>
        [HttpPost("revertwords", Name = "RevertWords")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Dictionary<string, string>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RevertWords(
            string projectId, [FromBody, BindRequired] Dictionary<string, string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "reverting words");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            var updates = new Dictionary<string, string>();
            var userId = _permissionService.GetUserId(HttpContext);
            foreach (var kv in wordIds)
            {
                var idToRevert = kv.Value;
                var priorWord = await _wordRepo.GetWord(projectId, kv.Key);
                if (priorWord is not null)
                {
                    priorWord.Id = idToRevert;
                    var newId = (await _wordService.Update(userId, priorWord))?.Id;
                    if (newId is not null)
                    {
                        updates[idToRevert] = newId;
                    }
                }
            }
            return Ok(updates);
        }

        /// <summary> Get the count of frontier words with senses in a specific semantic domain </summary>
        /// <returns> An integer count </returns>
        [HttpGet("domainwordcount/{domainId}", Name = "GetDomainWordCount")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetDomainWordCount(string projectId, string domainId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting domain word count");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            return Ok(await _wordRepo.CountFrontierWordsWithDomain(projectId, domainId));
        }
    }
}
