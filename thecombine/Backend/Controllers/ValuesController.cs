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

        public string Message()
        {
            return "this is the database mainpage";
        }

        // GET: v1/collection
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _wordService.GetAllWords());
        }
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            // if( isTrue == true)
            // {
            return new ObjectResult(await _wordService.DeleteAllWords());
            // }
            // return new ObjectResult(isTrue);

        }

        // GET: v1/collection/name
        [HttpGet("{Id}", Name = "Get")]
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
            await _wordService.AddFrontier(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/collection/5
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, Word word)   //also I dont think we need this
        {
            var document = await _wordService.GetWord(Id);
            if (document == null)
                return new NotFoundResult();
            word.Id = document.Id;               //this is sloppy and it should be fixed
            await _wordService.Update(Id);
            return new OkObjectResult(word.Id);
        }

        [HttpPut("dave/donald")]
        public async Task<IActionResult> Put([FromBody]MergeWords mergeVals)
        {
            try
            {
                var parent = mergeVals.parent;
                List<string> children = mergeVals.children;
                state changes = mergeVals.mergeType;

                foreach (string child in children)
                {
                    var childWord = await _wordService.GetWord(child);
                    var parentWord = await _wordService.GetWord(parent);
                    //create duplicate nodes
                    Word newChild = childWord;
                    Word newParent = parentWord;

                    newChild.Id = null;
                    newParent.Id = null;
                    //set as deleted
                    newChild.Accessability = state.deleted;
                    //add to database to set ID
                    await _wordService.Create(newChild);
                    //add child to history of new child
                    newChild.History.Add(childWord.Id);

                    //connect parent to child
                    newParent.History.Add(newChild.Id);
                    //add newparent to collection
                    await _wordService.Create(newParent);

                    //upadate fronteir
                    await _wordService.DeleteFrontier(childWord.Id);
                    await _wordService.DeleteFrontier(parentWord.Id);
                    await _wordService.AddFrontier(newParent);
                }
            }
            catch (Exception)
            {
                return new NotFoundResult();
            }

            return new OkResult();
        }
        // DELETE: v1/ApiWithActions/5
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
