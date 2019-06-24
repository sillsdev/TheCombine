using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Projects/Words/Frontier")]
    public class FrontierController : Controller
    {
        private readonly IWordRepository _repo;

        public FrontierController(IWordRepository repo)
        {
            _repo = repo;
        }

        // GET: v1/project/words/frontier
        [HttpGet()]
        public async Task<IActionResult> GetFrontier()
        {
            return new ObjectResult(await _repo.GetFrontier());
        }

        // POST: v1/project/words/frontier
        [HttpPost()]
        public async Task<IActionResult> PostFrontier([FromBody]Word word)
        {
#if DEBUG
            await _repo.AddFrontier(word);
            return new OkObjectResult(word.Id);
#else
            return new UnauthorizedResult();
#endif
        }

        // DELETE: v1/project/words/frontier/{Id}
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteFrontier(string Id)
        {
#if DEBUG
            if (await _repo.DeleteFrontier(Id))
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