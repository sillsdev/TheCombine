﻿using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using static BackendFramework.Helper.Utilities;

[assembly: InternalsVisibleTo("Backend.Tests")]
namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    [EnableCors("AllowAll")]
    public class LiftController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly LiftService _liftService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public LiftController(IWordRepository repo, IProjectService projServ, IPermissionService permissionService)
        {
            _wordRepo = repo;
            _projectService = projServ;
            _liftService = new LiftService(_wordRepo, _projectService);
            _permissionService = permissionService;
        }

        /// <summary> Adds data from a zipped directory containing a lift file </summary>
        /// <remarks> POST: v1/projects/{projectId}/words/upload </remarks>
        /// <returns> Number of words added </returns>
        [HttpPost("upload")]
        public async Task<IActionResult> UploadLiftFile(string projectId, [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.HasProjectPermission(Permission.ImportExport, HttpContext))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var project = _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var file = fileUpload.File;

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            // Get path to where we will copy the zip file
            var util = new Utilities();
            fileUpload.FilePath = util.GenerateFilePath(
                FileType.Zip,
                false,
                "Compressed-Upload-" + string.Format("{0:yyyy-MM-dd_hh-mm-ss-fff}", DateTime.Now),
                Path.Combine(projectId, "Import"));

            // Copy file data to a new local file
            using (var fs = new FileStream(fileUpload.FilePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Make destination for extracted files
            var zipDest = Path.GetDirectoryName(fileUpload.FilePath);
            Directory.CreateDirectory(zipDest);
            if (Directory.Exists(Path.Combine(zipDest, "ExtractedLocation")))
            {
                return new BadRequestObjectResult("A file has already been uploaded");
            }

            // Extract the zip to new directory
            var extractDir = Path.Combine(zipDest, "ExtractedLocation");
            Directory.CreateDirectory(extractDir);
            ZipFile.ExtractToDirectory(fileUpload.FilePath, extractDir);

            // Check number of directories extracted
            var directoriesExtracted = Directory.GetDirectories(extractDir);
            var extractedDirPath = "";

            // If there was one directory, we're good
            if (directoriesExtracted.Length == 1)
            {
                extractedDirPath = directoriesExtracted.FirstOrDefault();
            }
            // If there were two, and there was a __MACOSX directory, ignore it
            else if (directoriesExtracted.Length == 2)
            {
                var numDirs = 0;
                foreach (var dir in directoriesExtracted)
                {
                    if (dir.EndsWith("__MACOSX"))
                    {
                        Directory.Delete(dir, true);
                    }
                    else // This directory probably matters
                    {
                        extractedDirPath = dir;
                        numDirs++;
                    }
                }
                // Both directories seemed important
                if (numDirs == 2)
                {
                    return new BadRequestObjectResult("Your zip file should have one directory");
                }
            }
            else // There were 0 or more than 2 directories
            {
                return new BadRequestObjectResult("Your zip file structure has the wrong number of directories");
            }

            // Search for the lift file within the extracted files
            var extractedLiftNameArr = Directory.GetFiles(extractedDirPath);
            var extractedLiftPath = Array.FindAll(extractedLiftNameArr, x => x.EndsWith(".lift"));
            if (extractedLiftPath.Length > 1)
            {
                return new BadRequestObjectResult("More than one .lift file detected");
            }
            else if (extractedLiftPath.Length == 0)
            {
                return new BadRequestObjectResult("No lift files detected");
            }

            try
            {
                // Sets the projectId of our parser to add words to that project
                _liftService.SetProject(projectId);
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_liftService);

                // Import words from lift file
                var resp = parser.ReadLiftFile(extractedLiftPath.FirstOrDefault());

                // Add character set to project from ldml file
                var proj = _projectService.GetProject(projectId).Result;
                _liftService.LdmlImport(
                    Path.Combine(extractedDirPath, "WritingSystems"), proj.VernacularWritingSystem);

                return new ObjectResult(resp);
            }
            // If anything wrong happened, it's probably something wrong with the file itself
            catch (Exception)
            {
                return new UnsupportedMediaTypeResult();
            }
        }

        /// <summary> Packages project data into zip file </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/download </remarks>
        [HttpGet("download")]
        public async Task<IActionResult> ExportLiftFile(string projectId)
        {
            if (!_permissionService.HasProjectPermission(Permission.ImportExport, HttpContext))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Ensure there are words in the project
            var words = await _wordRepo.GetAllWords(projectId);
            if (words.Count == 0)
            {
                return new BadRequestResult();
            }
            // Export the data to a zip directory
            var exportedFilepath = CreateLiftExport(projectId);

            var file = System.IO.File.ReadAllBytes(exportedFilepath);
            var encodedFile = Convert.ToBase64String(file);
            return new OkObjectResult(encodedFile);
        }

        // This method is extracted so that it can be unit tested
        internal string CreateLiftExport(string projectId)
        {
            _liftService.SetProject(projectId);
            var exportedFilepath = _liftService.LiftExport(projectId);
            return exportedFilepath;
        }
    }
}
