using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.ValueModels;
using BackendFramework.WordService;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace BackendFramework.Controllers
{
    [Produces("application/")]
    [Route("v1/Collection")]
    public class WordController : Controller
    {
        private readonly IWordService _wordService;
        public WordController(IWordService wordService)
        {
            _wordService = wordService;
        }
        // GET: v1/collection
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _wordService.GetAllWords());
        }
        // GET: v1/collection/name
        [HttpGet("{name}", Name = "Get")]
        public async Task<IActionResult> Get(string Id)
        {
            var word = await _wordService.GetWord(Id);
            if (word == null)
                return new NotFoundResult();
            return new ObjectResult(word);
        }

        // POST: v1/collection
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]Word word)
        {
            await _wordService.Create(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/collection/5
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody]Word word)
        {
            var document = await _wordService.GetWord(Id);
            if (document == null)
                return new NotFoundResult();
            word.Id = document.Id;
            await _wordService.Update(Id);
            return new OkObjectResult(word);
        }
        // DELETE: v1/ApiWithActions/5
        [HttpDelete("{name}")]
        public async Task<IActionResult> Delete(string name)
        {
            var document = await _wordService.GetWord(name);
            if (gameFromDb == null)
                return new NotFoundResult();
            await _wordService.Delete(name);
            return new OkResult();
        }
    }

}
