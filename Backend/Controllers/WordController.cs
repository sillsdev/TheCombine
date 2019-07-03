using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Projects/Words")]
    public class WordController : Controller
    {
        public readonly IWordService _wordService;
        public readonly IWordRepository _wordRepo;

        public WordController(IWordService wordService, IWordRepository repo)
        {
            _wordService = wordService;
            _wordRepo = repo;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Project/Words
        // Implements GetAllWords(),
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _wordRepo.GetAllWords());
        }

        // DELETE v1/Project/Words
        // Implements DeleteAllWords()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            return new ObjectResult(await _wordRepo.DeleteAllWords());
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Project/Words/{Id}
        // Implements GetWord(), Arguments: string id of target word
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            var word = await _wordRepo.GetWord(Id);
            if (word == null)
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
            await _wordRepo.Create(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/Project/Words/{Id}
        // Implements Update(), Arguments: string id of target word, new word from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] Word word)
        {
            var document = await _wordRepo.GetWord(Id);
            if (document == null)
            {
                return new NotFoundResult();
            }

            word.Id = document.Id;
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
            if (mergeWords != null && mergeWords.Parent != null)
            {
                var newParent = await _wordService.Merge(mergeWords);
                return new ObjectResult(newParent.Id);
            }
            else
            {
                return new BadRequestResult();
            }
        }
    }
}
