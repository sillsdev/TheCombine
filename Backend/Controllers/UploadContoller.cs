using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/Projects/Words")]
    public class UploadContoller : Controller
    {
        public readonly ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;

        public UploadContoller(ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> merger)
        {
            _merger = merger;
        }

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("Upload")]
        public async Task<IActionResult> UploadLiftFile([FromForm] FileUpload model)
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
            try
            {
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
                return new ObjectResult(parser.ReadLiftFile(model.filePath));
            }
            catch (Exception)
            {
                return new UnsupportedMediaTypeResult();
            }
        }

        [HttpPost("/Upload/Audio")]
        public async Task<IActionResult> UploadAudioFile([FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                model.FilePath = Path.Combine("./uploadAudioFile-" + model.Name + ".mp3");
                using (var fs = new FileStream(model.FilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }
                //TODO: add audiofile path to word database entry
                //      
                return new ObjectResult(model.FilePath);
            }
            return new UnsupportedMediaTypeResult();
        }
    }
}
