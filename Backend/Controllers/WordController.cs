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
    [Route("v1/Project/Words")]
    public class WordController : Controller
    {
        private readonly IWordService _wordService;
        public WordController(IWordService wordService)
        {
            _wordService = wordService;
        }

        public async Task<string> Message()
        {
            return "this is the database mainpage";
        }


        [HttpGet]
        public async Task<IActionResult> Get([FromBody] List<string> Ids = null)
        {
            if (Ids.Count > 0)
            {
                return new ObjectResult(await _wordService.GetWords(x => helperFunction(x, Ids)));
            }
            return new ObjectResult(await _wordService.GetAllWords());
        }


        // DELETE v1/Project/Words
        // Implements DeleteAllWords()
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            return new ObjectResult(await _wordService.DeleteAllWords());
        }

        // GET: v1/Project/Words/{Id}
        // Implements GetWord(), Arguments: string id of target word
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            var word = await _wordService.GetWord(Id);
            if (word.Count == 0)
                return new NotFoundResult();
            return new ObjectResult(word);
        }

        // POST: v1/Project/Words
        // Implements Create(), Arguments: new word from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]Word word)
        {
            Console.WriteLine("Post: " + word);
            await _wordService.Create(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/Project/Words/5
        //Implements Update(), Arguments: string id of target word, new word from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] Word word)   
        {
            var document = await _wordService.GetWord(Id);
            if (document.Count == 0)
                return new NotFoundResult();
            word.Id = document[0].Id;               //this is sloppy and it should be fixed
            await _wordService.Update(Id, word);
            return new OkObjectResult(word.Id);
        }
        // DELETE: v1/ApiWithActions/{Id}
        //Implements Delete(), Arguments: string id of target word
        [HttpDelete("{Id}")]
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
