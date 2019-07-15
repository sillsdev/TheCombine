using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words/frontier")]
    public class FrontierController : Controller
    {
        private readonly IWordRepository _repo;

        public FrontierController(IWordRepository repo)
        {
            _repo = repo;
        }

        // GET: v1/project/{projectId}/words/frontier
        [HttpGet]
        public async Task<IActionResult> GetFrontier(string projectId)
        {
            return new ObjectResult(await _repo.GetFrontier(projectId));
        }

        // POST: v1/project/{projectId}/words/frontier
        [HttpPost]
        public async Task<IActionResult> PostFrontier(string projectId, [FromBody]Word word)
        {
#if DEBUG
            word.ProjectId = projectId;
            await _repo.AddFrontier(word);
            return new OkObjectResult(word.Id);
#else
            return new UnauthorizedResult();
#endif
        }

        // DELETE: v1/project/{projectId}/words/frontier/{wordId}
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> DeleteFrontier(string projectId, string wordId)
        {
#if DEBUG
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