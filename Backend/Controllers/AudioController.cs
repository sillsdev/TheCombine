using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using static BackendFramework.Helper.Utilities;

namespace BackendFramework.Controllers
{

    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    [EnableCors("AllowAll")]

    public class AudioController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;
        private readonly IPermissionService _permissionService;

        public AudioController(IWordRepository repo, IWordService wordService, IPermissionService permissionService)
        {
            _wordRepo = repo;
            _wordService = wordService;
            _permissionService = permissionService;
        }

        /// <summary> Adds a pronunciation <see cref="FileUpload"/> to a <see cref="Word"/> and saves locally to ~/.CombineFiles/{ProjectId}/Import/Audio </summary>
        /// <remarks> POST: v1/projects/{projectId}/words/{wordId}/upload/audio </remarks>
        /// <returns> Path to local audio file </returns>
        [HttpPost("{wordId}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string projectId, string wordId, [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.IsProjectAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }
            var file = fileUpload.File;

            //ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            //get path to home
            Utilities util = new Utilities();
            fileUpload.FilePath = util.GenerateFilePath(Filetype.audio, false, wordId, Path.Combine(projectId, Path.Combine("ExtractedLocation","Import"), "Audio"));

            //copy the file data to a new local file
            using (var fs = new FileStream(fileUpload.FilePath, FileMode.Create))
            {
                await file.CopyToAsync(fs);
            }

            //add the relative path to the audio field
            Word gotWord = await _wordRepo.GetWord(projectId, wordId);
            gotWord.Audio.Add(fileUpload.FilePath); //TODO: this isnt relative

            //update the word with new audio file
            _ = await _wordService.Update(projectId, wordId, gotWord);

            return new ObjectResult(fileUpload.FilePath);
        }
    }
}
