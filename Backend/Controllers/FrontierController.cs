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
    [Route("v1/Project/Words/Frontier")]
    public class FrontierController : Controller
    {
        private readonly IWordService _wordService;
        public FrontierController(IWordService wordService)
        {
            _wordService = wordService;
        }

        // GET: v1/project/words/frontier
        [HttpGet()]
        public async Task<IActionResult> GetFrontier()
        {
            return new ObjectResult(await _wordService.GetFrontier());
        }

        [HttpPost()]
        public async Task<IActionResult> PostFrontier([FromBody]Word word)
        {
            await _wordService.AddFrontier(word);
            return new OkObjectResult(word.Id);
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteFrontier(string Id)
        {
            if (await _wordService.DeleteFrontier(Id))
            {
                return new OkResult();
            }

            return new NotFoundResult();
        }

    }

}