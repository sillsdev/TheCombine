using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;
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

        [EnableCors("AllowAll")]

        // GET: v1/Project/Words
        // Implements GetAllWords(), 
        // Arguments: list of string ids of target word (if given, else returns all words)
        // Default: null
        [HttpGet]
        public async Task<IActionResult> Get([FromBody] List<string> Ids = null)
        {
            if (Ids != null)
            {
                var wordList = await _wordService.GetWords(Ids);
                if (wordList.Count != Ids.Count)
                {
                    return new NotFoundResult();
                }
                return new ObjectResult(wordList);
            }
            return new ObjectResult(await _wordService.GetAllWords());
        }

        // DELETE v1/Project/Words
        // Implements DeleteAllWords()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            #if DEBUG
            return new ObjectResult(await _wordService.DeleteAllWords());
            #else
            return new UnauthorizedResult();
            #endif
        }

        // GET: v1/Project/Words/{Id}
        // Implements GetWord(), Arguments: string id of target word
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            List<string> Ids = new List<string>();
            Ids.Add(Id);

            var word = await _wordService.GetWords(Ids);
            if (word.Count == 0)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(word);
        }

        // POST: v1/Project/Words
        // Implements Create(), Arguments: new word from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]Word word)
        {
            await _wordService.Create(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/Project/Words/{Id}
        // Implements Update(), Arguments: string id of target word, new word from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] Word word)
        {
            if (await _wordService.Update(Id, word))
            {
                return new OkObjectResult(word.Id);
            }
            return new NotFoundResult();
        }
        // DELETE: v1/Project/Words/{Id}
        // Implements Delete(), Arguments: string id of target word
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        { 
            if (await _wordService.Delete(Id))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        // PUT: v1/Project/Words
        // Implements Merge(), Arguments: MergeWords object
        [HttpPut]
        public async Task<IActionResult> Put([FromBody] MergeWords mergeWords)
        {
            List<string> ids = new List<string>();
            foreach (string childId in mergeWords.children)
            {
                ids.Add(childId);
            }
            ids.Add(mergeWords.parent);
            var document = await _wordService.GetWords(ids);
            if (document.Count != ids.Count)
            {
                return new NotFoundResult();
            }
            var mergedWord = await _wordService.Merge(mergeWords);
            return new ObjectResult(mergedWord.Id);
        }
    }
}
