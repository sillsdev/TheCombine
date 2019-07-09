using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    public class WordController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;

        public WordController(IWordRepository repo, IWordService wordService)
        {
            _wordRepo = repo;
            _wordService = wordService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/projects/{projectId}/words
        // Implements GetAllWords(),
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            return new ObjectResult(await _wordRepo.GetAllWords(projectId));
        }

        // DELETE v1/projects/{projectId}/words
        // Implements DeleteAllWords()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
#if DEBUG
            return new ObjectResult(await _wordRepo.DeleteAllWords(projectId));
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/projects/{projectId}/words/{wordId}
        // Implements GetWord(), Arguments: string id of target word
        [HttpGet("{wordId}")]
        public async Task<IActionResult> Get(string projectId, string wordId)
        {
            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word == null)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(word);
        }

        // POST: v1/Project/Words
        // Implements Create(), Arguments: new word from body
        [HttpPost]
        public async Task<IActionResult> Post(string projectId, [FromBody]Word word)
        {
            word.ProjectId = projectId;
            await _wordRepo.Create(word);
            return new OkObjectResult(word.Id);
        }

        // PUT: v1/projects/{projectId}/words/{wordId}
        // Implements Update(), Arguments: string id of target word, new word from body
        [HttpPut("{wordId}")]
        public async Task<IActionResult> Put(string projectId, string wordId, [FromBody] Word word)
        {
            var document = await _wordRepo.GetWord(projectId, wordId);
            if (document == null)
            {
                return new NotFoundResult();
            }

            word.Id = document.Id;
            await _wordService.Update(projectId, wordId, word);

            return new OkObjectResult(word.Id);
        }

        // DELETE: v1/projects/{projectId}/words/{wordId}
        // Implements Delete(), Arguments: string id of target word
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> Delete(string projectId,  string wordId)
        {
            if (await _wordService.Delete(projectId, wordId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        // PUT: v1/projects/{projectId}/words
        // Implements Merge(), Arguments: MergeWords object
        [HttpPut]
        public async Task<IActionResult> Put(string projectId, [FromBody] MergeWords mergeWords)
        {
            if (mergeWords != null && mergeWords.Parent != null)
            {
                var newParent = await _wordService.Merge(projectId, mergeWords);
                return new ObjectResult(newParent.Id);
            }
            else
            {
                return new BadRequestResult();
            }
        }
    }
}
