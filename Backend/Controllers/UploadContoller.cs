using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    //[Authorize]
    [Produces("application/json")]
    [Route("v1/projects/words")]
    public class UploadContoller : Controller
    {
        public readonly ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;
        public readonly IWordService _wordService;
        public readonly IWordRepository _wordRepo;

        public UploadContoller(ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> merger, IWordRepository repo, IWordService service)
        {
            _merger = merger;
            _wordRepo = repo;
            _wordService = service;
        }

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("upload")]
        public async Task<IActionResult> UploadLiftFile([FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                string wanted_path = Path.GetDirectoryName(Path.GetDirectoryName(System.IO.Directory.GetCurrentDirectory()));
                System.IO.Directory.CreateDirectory(wanted_path + "/Words");

                model.FilePath = Path.Combine(wanted_path + "/Words/UploadFile-" + model.Name + ".xml");
                using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                {
                    await file.CopyToAsync(fs);
                }
            }
            try
            {
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
                return new ObjectResult(parser.ReadLiftFile(model.FilePath));
            }
            catch (Exception)
            {
                return new UnsupportedMediaTypeResult();
            }
        }

        [HttpPost("{Id}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string wordId, [FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                model.FilePath = Path.Combine("./Audio/" + wordId + ".mp3");
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
            return new UnsupportedMediaTypeResult();
        }
    }
}
