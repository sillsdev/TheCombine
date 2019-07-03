using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;
using static BackendFramework.Helper.Utilities;

namespace BackendFramework.Controllers
{
    public class DesktopNotFoundExceoption : Exception
    {
        public DesktopNotFoundExceoption() { }
    }
    //[Authorize]
    [Produces("application/json")]
    [Route("v1")]
    public class AudioController : Controller
    {
        public readonly IWordService _wordService;
        public readonly IWordRepository _wordRepo;

        public AudioController(IWordRepository repo, IWordService wordService)
        {
            _wordRepo = repo;
            _wordService = wordService;
        }

        [HttpPost("projects/words/{Id}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string wordId, [FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                //get path to desktop
                Utilities util = new Utilities();
                model.FilePath = util.GenerateFilePath(filetype.audio, false, wordId);

                //copy the file data to the created file
                using (var fs = new FileStream(model.FilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }

                //add the relative path to the audio field of 
                Word gotWord = await _wordRepo.GetWord(wordId);
                gotWord.Audio = model.FilePath;
                //update the entry
                _ = await _wordService.Update(wordId, gotWord);

                return new ObjectResult(model.FilePath);
            }
            return new BadRequestObjectResult("Empty File");
        }
    }
}
