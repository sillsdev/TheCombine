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
    [Route("v1/projects/{projectId}/words/frontier")]
    [EnableCors("AllowAll")]
    public class FrontierController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;
        private readonly IProjectRepository _projRepo;
        private readonly IPermissionService _permissionService;

        public FrontierController(IWordRepository wordRepo, IWordService wordService,
            IProjectRepository projRepo, IPermissionService permissionService)
        {
            _wordRepo = wordRepo;
            _wordService = wordService;
            _projRepo = projRepo;
            _permissionService = permissionService;
        }

        /// <summary> Returns all words in a project's frontier </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/frontier </remarks>
        [HttpGet]
        public async Task<IActionResult> GetFrontier(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _wordRepo.GetFrontier(projectId));
        }

        /// <summary> Adds word to a project's frontier </summary>
        /// <remarks> POST: v1/projects/{projectId}/words/frontier </remarks>
        /// <returns> Id of word created </returns>
        [HttpPost]
        // TODO: Remove this warning suppression when the function is implemented for release mode.
#pragma warning disable 1998
        public async Task<IActionResult> PostFrontier(string projectId, [FromBody] Word word)
#pragma warning restore 1998
        {
#if DEBUG
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            word.ProjectId = projectId;
            await _wordRepo.AddFrontier(word);
            return new OkObjectResult(word.Id);
#else
            return new NotFoundResult();
#endif
        }

        /// <summary> Deletes Frontier <see cref="Word"/> with specified ID </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/frontier/{wordId} </remarks>
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> DeleteFrontierWord(string projectId, string wordId)
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

            // Ensure word exists in frontier
            var id = await _wordService.DeleteFrontierWord(projectId, wordId);
            if (id is null)
            {
                return new NotFoundObjectResult(wordId);
            }

            return new OkObjectResult(wordId);
        }
    }
}
