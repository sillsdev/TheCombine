﻿using System;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using static BackendFramework.Helper.FileUtilities;

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
        private readonly ILiftService _liftService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public LiftController(IWordRepository repo, IProjectService projServ, IPermissionService permissionService,
            ILiftService liftService)
        {
            _wordRepo = repo;
            _projectService = projServ;
            _liftService = liftService;
            _permissionService = permissionService;
        }

        /// <summary> Adds data from a zipped directory containing a lift file </summary>
        /// <remarks> POST: v1/projects/{projectId}/words/upload </remarks>
        /// <returns> Number of words added </returns>
        [HttpPost("upload")]
        public async Task<IActionResult> UploadLiftFile(string projectId, [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // sanitize projectId
            if (!SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure Lift file has not already been imported.
            if (!_projectService.CanImportLift(projectId))
            {
                return new BadRequestObjectResult("A Lift file has already been uploaded");
            }

            var file = fileUpload.File;
            if (file is null)
            {
                return new BadRequestObjectResult("Null file");
            }

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            // Copy zip file data to a new temporary file
            fileUpload.FilePath = Path.GetTempFileName();
            await using (var fs = new FileStream(fileUpload.FilePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Make temporary destination for extracted files
            var extractDir = GetRandomTempDir();

            // Extract the zip to new created directory.
            ExtractZipFile(fileUpload.FilePath, extractDir, true);

            // Check number of directories extracted
            var directoriesExtracted = Directory.GetDirectories(extractDir);
            var extractedDirPath = "";

            switch (directoriesExtracted.Length)
            {
                // If there was one directory, we're good
                case 1:
                    {
                        extractedDirPath = directoriesExtracted.FirstOrDefault();
                        break;
                    }
                // If there were two, and there was a __MACOSX directory, ignore it
                case 2:
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
                        break;
                    }
                // There were 0 or more than 2 directories
                default:
                    {
                        return new BadRequestObjectResult(
                            "Your zip file structure has the wrong number of directories");
                    }
            }

            // Copy the extracted contents into the persistent storage location for the project.
            var liftStoragePath = GenerateFilePath(
                FileType.Dir,
                true,
                "",
                Path.Combine(projectId, "Import", "ExtractedLocation", "Lift"));
            CopyDirectory(extractedDirPath, liftStoragePath);
            Directory.Delete(extractDir, true);

            // Search for the lift file within the extracted files
            var extractedLiftNameArr = Directory.GetFiles(liftStoragePath);
            var extractedLiftPath = Array.FindAll(extractedLiftNameArr, x => x.EndsWith(".lift"));
            if (extractedLiftPath.Length > 1)
            {
                return new BadRequestObjectResult("More than one .lift file detected");
            }
            if (extractedLiftPath.Length == 0)
            {
                return new BadRequestObjectResult("No lift files detected");
            }

            try
            {
                // Sets the projectId of our parser to add words to that project
                var liftMerger = _liftService.GetLiftImporterExporter(projectId, _projectService, _wordRepo);
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(liftMerger);

                // Import words from lift file
                var resp = parser.ReadLiftFile(extractedLiftPath.FirstOrDefault());

                // Add character set to project from ldml file
                var proj = _projectService.GetProject(projectId).Result;
                _liftService.LdmlImport(
                    Path.Combine(liftStoragePath, "WritingSystems"),
                    proj.VernacularWritingSystem.Bcp47, _projectService, proj);

                // Store that we have imported Lift data already for this project to signal the frontend
                // not to attempt to import again.
                var project = _projectService.GetProject(projectId).Result;
                project.LiftImported = true;
                await _projectService.Update(projectId, project);

                return new ObjectResult(resp);
            }
            // If anything wrong happened, it's probably something wrong with the file itself
            catch (Exception)
            {
                return new UnsupportedMediaTypeResult();
            }
        }

        /// <summary> Packages project data into zip file </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/export </remarks>
        /// <returns> ProjectId, if export successful </returns>
        [HttpGet("export")]
        public async Task<IActionResult> ExportLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await ExportLiftFile(projectId, userId);
        }

        public async Task<IActionResult> ExportLiftFile(string projectId, string userId)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Sanitize projectId
            if (!SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure project exists and has words
            var proj = _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }
            var words = await _wordRepo.GetAllWords(projectId);
            if (words.Count == 0)
            {
                return new BadRequestResult();
            }

            // Export the data to a zip, read into memory, and delete zip
            var exportedFilepath = CreateLiftExport(projectId);

            // Store the temporary path to the exported file for user to download later.
            _liftService.StoreExport(userId, exportedFilepath);
            return new OkObjectResult(projectId);
        }

        /// <summary> Downloads project data in zip file </summary>
        /// <remarks> GET: v1/projects/{projectId}/words/download </remarks>
        /// <returns> Lift file as base-64 string </returns>
        [HttpGet("download")]
        public async Task<IActionResult> DownloadLiftFile()
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await DownloadLiftFile(userId);
        }

        public async Task<IActionResult> DownloadLiftFile(string userId)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Ensure export exists.
            var filePath = _liftService.RetrieveExport(userId);
            if (filePath is null)
            {
                return new NotFoundObjectResult(userId);
            }

            var file = await System.IO.File.ReadAllBytesAsync(filePath);
            _liftService.DeleteExport(userId);

            // Return as Base64 string to allow embedding into HTTP OK message.
            var encodedFile = Convert.ToBase64String(file);
            return new OkObjectResult(encodedFile);
        }

        // This method is extracted so that it can be unit tested
        internal string CreateLiftExport(string projectId)
        {
            var exportedFilepath = _liftService.LiftExport(projectId, _wordRepo, _projectService);
            return exportedFilepath;
        }
    }

    [Serializable]
    public class FileSystemError : Exception
    {
        public FileSystemError()
        { }

        public FileSystemError(string message)
            : base(message)
        { }

        public FileSystemError(string message, Exception innerException)
            : base(message, innerException)
        { }
    }
}
