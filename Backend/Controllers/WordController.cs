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
using SIL.Lift.Parsing;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Project/Words")]
    public class WordController : Controller
    {
        public readonly IWordService _wordService;
        public readonly ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;

        public WordController(IWordService wordService)
        {
            _wordService = wordService;
            _merger = (ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample>)wordService;
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
            await _wordService.Update(Id, word);
            return new OkObjectResult(word.Id);
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

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: ?
        [HttpPost("upload")]
        public async Task<IActionResult> Post()
        {
            string path = "C:\\Users\\SkinnerS\\.lift-importation\\LiftTest\\testingdata\\testingdata.lift";
            var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
            return new ObjectResult(parser.ReadLiftFile(path));
        }

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("upload")]
        public async Task<IActionResult> Post()
        {
            var file = model.file;

            if (file.Length > 0)
            {
                model.filePath = Path.Combine("./uploadFile-" + model.name + ".xml");
                using (var fs = new FileStream(model.filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }
            }
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
                return new ObjectResult(parser.ReadLiftFile(model.filePath));
                return new InvalidDataException();
        }
    }
}
