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

        /// <summary> Returns all <see cref="Word"/>s for specified <see cref="Project"/> </summary>
        /// <remarks> GET: v1/projects/{projectId}/words </remarks>
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _wordRepo.GetAllWords(projectId));
        }

        /// <summary> Deletes all <see cref="Word"/>s for specified <see cref="Project"/> </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words </remarks>
        /// <returns> true: if success, false: if there were no words </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _wordRepo.DeleteAllWords(projectId));
        }

        /// <summary> Returns <see cref="Word"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/{wordId} </remarks>
        [HttpGet("{wordId}")]
        public async Task<IActionResult> Get(string projectId, string wordId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word is null)
            {
                return new NotFoundObjectResult(wordId);
            }

            return new ObjectResult(word);
        }

        /// <summary> Creates a <see cref="Word"/> </summary>
        /// <remarks> POST: v1/projects/{projectId}/words </remarks>
        /// <returns> Id of created word </returns>
        [HttpPost]
        public async Task<IActionResult> Post(string projectId, [FromBody] Word word)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            word.ProjectId = projectId;

            // If word is not already in frontier, add it
            if (await _wordService.WordIsUnique(word))
            {
                await _wordRepo.Create(word);
            }
            else // Otherwise it is a duplicate
            {
                return new OkObjectResult("Duplicate");
            }

            return new OkObjectResult(word.Id);
        }

        /// <summary> Updates <see cref="Word"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId}/words/{wordId} </remarks>
        /// <returns> Id of updated word </returns>
        [HttpPut("{wordId}")]
        public async Task<IActionResult> Put(string projectId, string wordId, [FromBody] Word word)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Ensure word exists
            var document = await _wordRepo.GetWord(projectId, wordId);
            if (document is null)
            {
                return new NotFoundResult();
            }

            //add the found id to the updated word
            word.Id = document.Id;
            await _wordService.Update(projectId, wordId, word);

            return new OkObjectResult(word.Id);
        }

        /// <summary> Deletes <see cref="Word"/> with specified ID </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/{wordId} </remarks>
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> Delete(string projectId, string wordId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _wordService.Delete(projectId, wordId))
            {
                return new OkResult();
            }
            return new NotFoundObjectResult("The project was found, but the word was not deleted");
        }

        /// <summary> Merge children <see cref="Word"/>s with the parent </summary>
        /// <remarks> PUT: v1/projects/{projectId}/words </remarks>
        /// <returns> List of ids of new words </returns>
        [HttpPut]
        public async Task<IActionResult> Put(string projectId, [FromBody] List<MergeWords> mergeWordsList)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            try
            {
                var newWords = await _wordService.Merge(projectId, mergeWordsList);
                return new OkObjectResult(newWords.Select(w => w.Id).ToList());
            }
            catch
            {
                return new BadRequestResult();
            }
        }
    }
}
