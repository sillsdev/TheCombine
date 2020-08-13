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
        private readonly IWordRepository _repo;
        private readonly IWordService _wordService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public FrontierController(IWordRepository repo, IWordService wordService, IProjectService projServ, IPermissionService permissionService)
        {
            _repo = repo;
            _wordService = wordService;
            _projectService = projServ;
            _permissionService = permissionService;
        }

        /// <summary> Returns all words in a project's frontier </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/frontier </remarks>
        [HttpGet]
        public async Task<IActionResult> GetFrontier(string projectId)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.GetFrontier(projectId));
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
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            word.ProjectId = projectId;
            await _repo.AddFrontier(word);
            return new OkObjectResult(word.Id);
#else
            return new NotFoundResult();
#endif
        }

        /// <summary> Deletes (or at least tags as deleted) Frontier <see cref="Word"/> with specified ID </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/frontier/{wordId} </remarks>
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> DeleteFrontierWord(string projectId, string wordId)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _wordService.DeleteFrontierWord(wordId))
            {
                return new OkObjectResult(true);
            }
            return new NotFoundObjectResult("The project was found, but the word was not deleted");
        }
    }
}
