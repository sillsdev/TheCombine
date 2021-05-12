using System.Collections.Generic;
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
    [Route("v1/projects/{projectId}/words")]
    [EnableCors("AllowAll")]
    public class WordController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IWordRepository _wordRepo;
        private readonly IPermissionService _permissionService;
        private readonly IWordService _wordService;

        public WordController(IWordRepository repo, IWordService wordService, IProjectRepository projRepo,
            IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _wordRepo = repo;
            _permissionService = permissionService;
            _wordService = wordService;
        }

        /// <summary> Deletes all <see cref="Word"/>s for specified <see cref="Project"/>. </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words </remarks>
        /// <returns> true: if success, false: if there were no words </returns>
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return Forbid();
            }
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }
            return Ok(await _wordRepo.DeleteAllWords(projectId));
        }

        /// <summary> Deletes specified Frontier <see cref="Word"/>. </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/frontier/{wordId} </remarks>
        [HttpDelete("frontier/{wordId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> DeleteFrontier(string projectId, string wordId)
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
            var id = await _wordService.DeleteFrontierWord(projectId, wordId);
            if (id is null)
            {
                return NotFound(wordId);
            }
            return Ok(wordId);
        }

        /// <summary> Returns all <see cref="Word"/>s for specified <see cref="Project"/>. </summary>
        /// <remarks> GET: v1/projects/{projectId}/words </remarks>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Get(string projectId)
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
            return Ok(await _wordRepo.GetAllWords(projectId));
        }

        /// <summary> Returns <see cref="Word"/> with specified id. </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/{wordId} </remarks>
        [HttpGet("{wordId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Word))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Get(string projectId, string wordId)
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
            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word is null)
            {
                return NotFound(wordId);
            }
            return Ok(word);
        }

        /// <summary> Returns all Frontier <see cref="Word"/> in specified <see cref="Project"/>. </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/frontier </remarks>
        [HttpGet("frontier")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Word>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> GetFrontier(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }
            return Ok(await _wordRepo.GetFrontier(projectId));
        }

        /// <summary> Creates a <see cref="Word"/>. </summary>
        /// <remarks> POST: v1/projects/{projectId}/words </remarks>
        /// <returns> Id of created word </returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Post(string projectId, [FromBody, BindRequired] Word word)
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
            word.ProjectId = projectId;

            // If word is not already in frontier, add it.
            if (await _wordService.WordIsUnique(word))
            {
                await _wordRepo.Create(word);
            }
            else
            {
                // Otherwise it is a duplicate.
                return Ok("Duplicate");
            }
            return Ok(word.Id);
        }

        /// <summary> Updates a <see cref="Word"/>. </summary>
        /// <remarks> PUT: v1/projects/{projectId}/words/{wordId} </remarks>
        /// <returns> Id of updated word </returns>
        [HttpPut("{wordId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Put(string projectId, string wordId, [FromBody, BindRequired] Word word)
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
            var document = await _wordRepo.GetWord(projectId, wordId);
            if (document is null)
            {
                return NotFound(wordId);
            }

            // Add the found id to the updated word.
            word.Id = document.Id;
            await _wordService.Update(projectId, wordId, word);
            return Ok(word.Id);
        }
    }
}
