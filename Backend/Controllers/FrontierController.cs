using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.ValueModels;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Microsoft.AspNetCore.Cors;
using BackendFramework.Interfaces;

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