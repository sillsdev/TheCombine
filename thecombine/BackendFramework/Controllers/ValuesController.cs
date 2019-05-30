using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.ValueModels;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Microsoft.AspNetCore.Cors;

namespace BackendFramework.Controllers
{
    //[Produces("application/")]
    [Route("v1/Collection")]
    public class WordController : Controller
    {
        private readonly IWordService _wordService;
        public WordController(IWordService wordService)
        {
            _wordService = wordService;
        }
        // GET: v1/collection
        [EnableCors("AllowAll")]
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
        public async Task<IActionResult> Post([FromBody]Word word) //tskes the word content from the http req body not from the path or 
        {
            Console.WriteLine("Post: " + word);
            await _wordService.Create(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/collection/5
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody]Word word)   //also I dont think we need this
        {
            var document = await _wordService.GetWord(Id);
            if (document == null)
                return new NotFoundResult();
            word.Id = document[0].Id;               //this is sloppy and it should be fixed
            await _wordService.Update(Id);
            return new OkObjectResult(word.Id);
        }
        // DELETE: v1/ApiWithActions/5
        [HttpDelete("{name}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (await _wordService.Delete(Id))
            {
                return new OkResult();
            }

            return new NotFoundResult();
        }
    }

}
