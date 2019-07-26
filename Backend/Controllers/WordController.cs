using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    public class WordController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public WordController(IWordRepository repo, IWordService wordService, IProjectService projectService, IPermissionService permissionService)
        {
            _wordRepo = repo;
            _wordService = wordService;
            _projectService = projectService;
            _permissionService = permissionService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/projects/{projectId}/words
        // Implements GetAllWords(),
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _wordRepo.GetAllWords(projectId));
        }

        // DELETE v1/projects/{projectId}/words
        // Implements DeleteAllWords()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }
#if DEBUG
            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

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
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word == null)
            {
                return new NotFoundObjectResult(wordId);
            }
            return new ObjectResult(word);
        }

        // POST: v1/Project/Words
        // Implements Create(), Arguments: new word from body
        [HttpPost]
        public async Task<IActionResult> Post(string projectId, [FromBody]Word word)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            word.ProjectId = projectId;

            //check if word is already in database
            if (await _wordService.searchInDuplicates(word))
            {
                await _wordRepo.Create(word);
            }
            else
            {
                return new OkObjectResult("Duplicate");
            }

            return new OkObjectResult(word.Id);
        }

        // PUT: v1/projects/{projectId}/words/{wordId}
        // Implements Update(), Arguments: string id of target word, new word from body
        [HttpPut("{wordId}")]
        public async Task<IActionResult> Put(string projectId, string wordId, [FromBody] Word word)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

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
        public async Task<IActionResult> Delete(string projectId, string wordId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

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
            if (!_permissionService.IsAuthenticated("3", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (mergeWords != null && mergeWords.Parent != null)
            {
                try
                {
                    var newWordList = await _wordService.Merge(projectId, mergeWords);
                    return new ObjectResult(newWordList.Select(i => i.Id).ToList());
                }
                catch (NotSupportedException)
                {
                    return new BadRequestResult();
                }
                catch (FormatException)
                {
                    return new BadRequestResult();
                }
            }
            else
            {
                return new BadRequestResult();
            }
        }
    }
}
