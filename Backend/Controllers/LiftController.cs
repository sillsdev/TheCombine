using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Threading.Tasks;
using static BackendFramework.Helper.Utilities;

namespace BackendFramework.Controllers
{
    //[Authorize]
    [Produces("application/json")]
    [Route("v1/projects")]
    public class LiftController : Controller
    {
        public readonly ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;
        public readonly IWordService _wordService;
        public readonly IWordRepository _wordRepo;
        public readonly LiftService _liftService;

        public LiftController(ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> merger, IWordRepository repo, IWordService wordService, IProjectService projServ)
        {
            _merger = merger;
            _wordRepo = repo;
            _wordService = wordService;
            _liftService = new LiftService(_wordRepo, projServ);
        }

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("words/upload")]
        public async Task<IActionResult> UploadLiftFile([FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                //get path to desktop
                Utilities util = new Utilities();
                model.FilePath = util.GenerateFilePath(filetype.lift, false, "TEST-UPLOAD-" + Path.GetRandomFileName());

                //copy data into file
                using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                {
                    await file.CopyToAsync(fs);
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
            else
            {
                return new BadRequestObjectResult("Empty File");
            }
        }

        [HttpGet("words/download")]
        public async Task<IActionResult> ExportLiftFile(string Id)
        {
            var words = await _wordRepo.GetAllWords();
            if(words.Count == 0)
            {
                return new BadRequestResult();
            }

            _liftService.LiftExport(Id);

            return new OkObjectResult(words);
        }
    }
}
