﻿using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Services;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}")]
    public class LiftController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly LiftService _liftService;
        private readonly IProjectService _projectService;

        public LiftController(IWordRepository repo, IProjectService projServ)
        {
            _wordRepo = repo;
            _projectService = projServ;
            _liftService = new LiftService(_wordRepo, _projectService);
        }

        // POST: v1/project/{projectId}/words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("words/upload")]
        public async Task<IActionResult> UploadLiftFile(string projectId, [FromForm] FileUpload model)
        {
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

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
                string extractedDirPath = null;

                if (pathToExtracted.Count == 1)
                {
                    extractedDirPath = pathToExtracted.FirstOrDefault();
                }
                else if (pathToExtracted.Count == 2)
                {
                    int count = 0;
                    foreach (var dir in pathToExtracted)
                    {
                        if (dir.EndsWith("__MACOSX"))
                        {
                            Directory.Delete(dir, true);
                        }
                        else
                        {
                            extractedDirPath = dir;
                            count++;
                        }
                    }
                    if (count == 2)
                    {
                        throw new InvalidDataException("Your zip file should have one directory");
                    }
                }
                else
                {
                    throw new InvalidDataException("Your zip file structure is incorrect");
                }

                var extractedLiftNameArr = Directory.GetFiles(extractedDirPath);
                //TODO: string extractedLiftName = ""; 

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
                    var resp = parser.ReadLiftFile(extractedLiftPath.FirstOrDefault());
                    var proj = _projectService.GetProject(projectId).Result;
                    _liftService.LdmlImport(Path.Combine(extractedDirPath, "WritingSystems"), proj.VernacularWritingSystem);

                    return new ObjectResult(resp);
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
            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var words = await _wordRepo.GetAllWords(projectId);
            if (words.Count == 0)
            {
                return new BadRequestResult();
            }

            _liftService.LiftExport(projectId);

            return new OkObjectResult(words);
        }
    }
}
