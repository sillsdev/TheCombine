using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words/frontier")]
    [EnableCors("AllowAll")]
    public class FrontierController : Controller
    {
        private readonly IWordRepository _repo;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public FrontierController(IWordRepository repo, IProjectService projServ, IPermissionService permissionService)
        {
            _repo = repo;
            _projectService = projServ;
            _permissionService = permissionService;
        }

        /// <summary> Returns all words in a project's frontier </summary>
        /// <remarks> GET: v1/project/{projectId}/words/frontier </remarks>
        [HttpGet]
        public async Task<IActionResult> GetFrontier(string projectId)
        {
            if (!_permissionService.IsProjectAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            //ensure project exists
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.GetFrontier(projectId));
        }

        /// <summary> Adds word to a project's frontier </summary>
        /// <remarks> POST: v1/project/{projectId}/words/frontier </remarks>
        /// <returns> Id of word created </returns>
        [HttpPost]
        public async Task<IActionResult> PostFrontier(string projectId, [FromBody]Word word)
        {
#if DEBUG
            if (!_permissionService.IsProjectAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            //ensure project exists
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            word.ProjectId = projectId;
            await _repo.AddFrontier(word);
            return new OkObjectResult(word.Id);
#else
            return new UnauthorizedResult();
#endif
        }

        /// <summary> Deletes all words in a project's frontier </summary>
        /// <remarks> DELETE: v1/project/{projectId}/words/frontier/{wordId} </remarks>
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> DeleteFrontier(string projectId, string wordId)
        {
#if DEBUG
            if (!_permissionService.IsProjectAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            //ensure project exists
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _repo.DeleteFrontier(projectId, wordId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
#else
            return new UnauthorizedResult();
#endif
        }
    }
}