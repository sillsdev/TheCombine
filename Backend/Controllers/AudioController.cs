using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using static BackendFramework.Helper.Utilities;

namespace BackendFramework.Controllers
{

    // [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    public class AudioController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;

        public AudioController(IWordRepository repo, IWordService wordService)
        {
            _wordRepo = repo;
            _wordService = wordService;
        }

        // POST: v1/projects/{projectId}/words/{wordId}/upload/audio
        // Implements UploadAudio()
        [HttpPost("{wordId}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string projectId, string wordId, [FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                //get path to home
                Utilities util = new Utilities();
                model.FilePath = util.GenerateFilePath(filetype.audio, false, wordId, Path.Combine(projectId, "Import", "Audio"));

                //copy the file data to the created file
                using (var fs = new FileStream(model.FilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }

                //add the relative path to the audio field
                Word gotWord = await _wordRepo.GetWord(projectId, wordId); //TODO: this isnt relative
                gotWord.Audio = model.FilePath;

                //update the entry
                _ = await _wordService.Update(projectId, wordId, gotWord);

                return new ObjectResult(model.FilePath);
            }

            return new BadRequestObjectResult("Empty File");
        }
    }
}
