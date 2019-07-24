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
    [EnableCors("AllowAll")]
    public class WordController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;
        private readonly IProjectService _projectService;

        public WordController(IWordRepository repo, IWordService wordService, IProjectService projectService)
        {
            _wordRepo = repo;
            _wordService = wordService;
            _projectService = projectService;
        }

        /// <summary> Returns all <see cref="Word"/>s for specified <see cref="Project"/></summary>
        /// <remarks> GET: v1/projects/{projectId}/words </remarks>
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _wordRepo.GetAllWords(projectId));
        }

        /// <summary> Deletes all <see cref="Word"/>s for specified <see cref="Project"/></summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words </remarks>
        /// <returns> true: if success, false: if there were no words </returns> 
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
#if DEBUG
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _wordRepo.DeleteAllWords(projectId));
#else
            return new UnauthorizedResult();
#endif
        }

        /// <summary> Returns <see cref="Word"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/{wordId} </remarks>
        [HttpGet("{wordId}")]
        public async Task<IActionResult> Get(string projectId, string wordId)
        {
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
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

        /// <summary> Creates a <see cref="Word"/> </summary>
        /// <remarks> POST: v1/projects/{projectId}/words </remarks>
        /// <returns> Id of created word </returns>
        [HttpPost]
        public async Task<IActionResult> Post(string projectId, [FromBody]Word word)
        {
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            word.ProjectId = projectId;

            //if word is not already in frontier, add it
            if (await _wordService.SearchInDuplicates(word))
            {
                await _wordRepo.Create(word);
            }
            else //otherwise it is a duplicate
            {
                return new OkObjectResult("Duplicate");
            }

            return new OkObjectResult(word.Id);
        }

        /// <summary> Updates <see cref="Word"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId}/words/{wordId} </remarks>
        /// <returns> Id of updated word </returns>
        [HttpPut("{wordId}")]
        public async Task<IActionResult> Put(string projectId, string wordId, [FromBody] Word word)
        {
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            //ensure word exists
            var document = await _wordRepo.GetWord(projectId, wordId);
            if (document == null)
            {
                return new NotFoundResult();
            }

            //add the found id to the updated word
            word.Id = document.Id;
            await _wordService.Update(projectId, wordId, word);

            return new OkObjectResult(word.Id);
        }

        /// <summary> Deletes <see cref="Word"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/{wordId} </remarks>
        [HttpDelete("{wordId}")]
        public async Task<IActionResult> Delete(string projectId, string wordId)
        {
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _wordService.Delete(projectId, wordId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        /// <summary> Merge children <see cref="Word"/>s with the parent </summary>
        /// <remarks> PUT: v1/projects/{projectId}/words </remarks>
        /// <returns> List of ids of new words </returns>
        [HttpPut]
        public async Task<IActionResult> Put(string projectId, [FromBody] MergeWords mergeWords)
        {
            //ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            //ensure MergeWords is alright
            if (mergeWords == null || mergeWords.Parent == null)
            {
                return new BadRequestResult();
            }

            try
            {
                var newWordList = await _wordService.Merge(projectId, mergeWords);
                return new ObjectResult(newWordList.Select(i => i.Id).ToList());
            }
            catch (Exception)
            {
                return new BadRequestResult();
            }
        }
    }
}
