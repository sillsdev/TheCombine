using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using static BackendFramework.Helper.Utilities;

namespace BackendFramework.Controllers
{
    //[Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}")]
    public class LiftController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly LiftService _liftService;

        public LiftController(IWordRepository repo, IProjectService projServ)
        {
            _wordRepo = repo;
            _liftService = new LiftService(_wordRepo, projServ);
        }

        // POST: v1/project/{projectId}/words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("words/upload")]
        public async Task<IActionResult> UploadLiftFile(string projectId, [FromForm] FileUpload model)
        {
            var fileInfo = model.File;

            if (fileInfo.Length > 0)
            {
                //get path to home
                Utilities util = new Utilities();
                //generate the file to put the filestream into
                model.FilePath = util.GenerateFilePath(filetype.zip, false, "Compressed-Upload-" + string.Format("{0:yyyy-MM-dd_hh-mm-ss-fff}", DateTime.Now), Path.Combine(projectId, "Import"));

                //copy stream into file
                using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                {
                    await fileInfo.CopyToAsync(fs);
                }

                //extract the zip into another dir
                string zipDest = Path.GetDirectoryName(model.FilePath);
                Directory.CreateDirectory(zipDest);

                //log the dirs in the dest pre extraction
                var preExportDirList = Directory.GetDirectories(zipDest);

                try
                {
                    ZipFile.ExtractToDirectory(model.FilePath, zipDest);
                }
                catch (IOException)
                {
                    //is thrown if duplicate files are unzipped
                    return new BadRequestObjectResult("That file has already been uploaded");
                }

                //log the dirs in the dest post extraction
                var postExportDirList = Directory.GetDirectories(zipDest);

                //get path to extracted dir
                var pathToExtracted = postExportDirList.Except(preExportDirList).ToList();
                string extractedDirPath;

                if (pathToExtracted.Count == 1)
                {
                    extractedDirPath = pathToExtracted.FirstOrDefault();
                }
                else
                {
                    throw new InvalidDataException("Your zip file structure is incorrect");
                }

                var extractedLiftNameArr = Directory.GetFiles(extractedDirPath);
                string extractedLiftName = "";

                //search for the lift file within the list
                var extractedLiftPath = Array.FindAll(extractedLiftNameArr, file => file.EndsWith(".lift"));
                if (extractedLiftPath.Length > 1)
                {
                    throw new InvalidDataException("More than one .lift file detected");
                }
                else if (extractedLiftPath.Length == 0)
                {
                    throw new InvalidDataException("No lift files detected");
                }

                

                try
                {
                    _liftService.SetProject(projectId);
                    var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_liftService);
                    return new ObjectResult(parser.ReadLiftFile(extractedLiftPath.FirstOrDefault()));
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
        public async Task<IActionResult> ExportLiftFile(string projectId)
        {
            var words = await _wordRepo.GetAllWords(projectId);
            if(words.Count == 0)
            {
                return new BadRequestResult();
            }

            _liftService.LiftExport(projectId);

            return new OkObjectResult(words);
        }
    }
}
