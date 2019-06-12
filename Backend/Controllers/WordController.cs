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
        [HttpGet]
        public async Task<IActionResult> Get()
        {
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
            List<string> ids = new List<string>();
            ids.Add(Id);
            var document = await _wordService.GetWords(ids);
            if (document.Count == 0)
            {
                return new NotFoundResult();
            }
            word.Id = (document.First()).Id;
            await Update(Id, word);
            return new OkObjectResult(word.Id);
        }
        // DELETE: v1/Project/Words/{Id}
        // Implements Delete(), Arguments: string id of target word
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (await RemoveWord(Id))
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
            var mergedWord = await Merge(mergeWords);
            return new ObjectResult(mergedWord.Id);
        }

        // The following three functions should probably be moved into their own class
        // they were removed from WordService because that function should only contain
        // our atomic database operations. These are helper functions for our more complex
        // operations.
        async Task<Word> Merge(MergeWords mergeWords)
        {
            List<string> parentHistory = new List<string>();
            foreach (string childId in mergeWords.children)
            {
                await _wordService.DeleteFrontier(childId);
                Word childWord = _wordService.GetWords(new List<string>() { childId }).Result.First();
                childWord.History = new List<string> { childId };
                childWord.Accessability = (int)mergeWords.mergeType; // 2: sense or 3: duplicate
                childWord.Id = null;
                await _wordService.Create(childWord);
                parentHistory.Add(childWord.Id);
            }
            string parentId = mergeWords.parent;
            await _wordService.DeleteFrontier(parentId);
            parentHistory.Add(parentId);
            Word parentWord = _wordService.GetWords(new List<string>() { parentId }).Result.First();
            parentWord.History = parentHistory;
            parentWord.Accessability = (int)state.active;
            parentWord.Id = null;
            await _wordService.Create(parentWord);
            return parentWord;
        }

        async Task<bool> Update(string Id, Word word)
        {
            var wordIsInFrontier = _wordService.DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                word.Id = null;
                word.Accessability = (int)state.active;
                word.History = new List<string> { Id };
                await _wordService.Create(word);
            }
            return wordIsInFrontier;
        }

        async Task<bool> RemoveWord(string Id)
        {
            var wordIsInFrontier = _wordService.DeleteFrontier(Id).Result;
            if (wordIsInFrontier)
            {
                List<string> ids = new List<string>();
                ids.Add(Id);
                Word wordToDelete = _wordService.GetWords(ids).Result.First();
                wordToDelete.Id = null;
                wordToDelete.Accessability = (int)state.deleted;
                wordToDelete.History = ids;
                await _wordService.Create(wordToDelete);
            }
            return wordIsInFrontier;
        }
    }
}
