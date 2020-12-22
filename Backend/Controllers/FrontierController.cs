using System;
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

        public FrontierController(IWordRepository repo, IWordService wordService,
            IProjectService projServ, IPermissionService permissionService)
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
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var project = await _projectService.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await GetAndRepairFrontier(projectId));
        }

        /// <summary>
        /// This method will add Guids to the words and senses if needed.
        /// </summary>
        /// <remarks>This method should be removed once all legacy data has been converted</remarks>
        /// <param name="projectId"></param>
        /// <returns></returns>
        private async Task<object> GetAndRepairFrontier(string projectId)
        {
            var frontier = await _repo.GetFrontier(projectId);
            if (frontier.Count > 0 && frontier[0].Guid != null && frontier[0].Guid != Guid.Empty)
            {
                return frontier;
            }

            foreach (var word in frontier)
            {
                word.Guid = new Guid();
                word.EditedBy.Add("TheCombine_GuidFixer");
                foreach (var sense in word.Senses)
                {
                    sense.Guid = Guid.NewGuid();
                }
                await _wordService.Update(projectId, word.Id, word);
            }

            return await _repo.GetFrontier(projectId);
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
            var project = await _projectService.GetProject(projectId);
            if (project is null)
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
            var proj = await _projectService.GetProject(projectId);
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
