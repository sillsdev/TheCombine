using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text.RegularExpressions;
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
                //generate the file to put the filestream into
                model.FilePath = util.GenerateFilePath(filetype.zip, false, "Compressed-Upload-" + string.Format("{0:yyyy-MM-dd_hh-mm-ss-fff}", DateTime.Now), Path.Combine("AmbigProjectName", "Import"));

                //copy stream into file
                using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                {
                    await file.CopyToAsync(fs);
                }

                //extract the zip into another file
                string zipDest = Path.GetDirectoryName(model.FilePath);
                Directory.CreateDirectory(zipDest);
                try
                {
                    ZipFile.ExtractToDirectory(model.FilePath, zipDest);
                }
                catch (IOException)
                {
                    //is thrown if duplicate files are unzipped
                    return new BadRequestObjectResult("That file has already been uploaded");
                }

                //generate path to extracted .lift file for import
                //first you need the filename of the extracted dir
                var filesArr = Directory.GetDirectories(Directory.GetParent(model.FilePath).ToString());
                
                if (filesArr.Length != 3)
                {
                    //there should only be one files within the zips dir, the extracted dir
                    throw new InvalidDataException("Your .zip file structure is incorrect");
                }

                //get a list of files within the extracted dir
                string extractedDirPath = "";
                foreach(string path in filesArr)
                {
                    string[] split = path.Split( Path.DirectorySeparatorChar );
                    if (split.Last() == Path.GetFileNameWithoutExtension(model.File.FileName))
                    {
                        extractedDirPath = path;
                    }
                }
                
                var extractedLiftNameArr = Directory.GetFiles(extractedDirPath);
                string extractedLiftName = "";
                int successCount = 0;

                //search for the lift file within the list
                Regex reg = new Regex(".lift$");
                foreach (var liftFile in extractedLiftNameArr)
                {
                    Match match = reg.Match(liftFile);
                    if (match.Success)
                    {
                        extractedLiftName = liftFile;
                        ++successCount;

                        if(successCount >= 2)
                        {
                            //if there is more than one lift file
                            throw new InvalidDataException("More than one .lift file detected");
                        }
                    }
                }
                if (successCount == 0)
                {
                    throw new InvalidDataException("No lift files detected");
                }

                string extractedLiftPath = Path.Combine(extractedDirPath, extractedLiftName);

                try
                {
                    var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
                    return new ObjectResult(parser.ReadLiftFile(extractedLiftPath));
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
