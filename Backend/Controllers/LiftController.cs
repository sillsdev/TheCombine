using System;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SIL.Lift.Parsing;
using SIL.IO;
using Microsoft.Extensions.Logging;

[assembly: InternalsVisibleTo("Backend.Tests")]
namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/lift")]
    [EnableCors("AllowAll")]
    public class LiftController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IWordRepository _wordRepo;
        private readonly ILiftService _liftService;
        private readonly IHubContext<CombineHub> _notifyService;
        private readonly IPermissionService _permissionService;
        private readonly ILogger<LiftController> _logger;

        public LiftController(IWordRepository wordRepo, IProjectRepository projRepo, IPermissionService permissionService,
            ILiftService liftService, IHubContext<CombineHub> notifyService, ILogger<LiftController> logger)
        {
            _projRepo = projRepo;
            _wordRepo = wordRepo;
            _liftService = liftService;
            _notifyService = notifyService;
            _permissionService = permissionService;
            _logger = logger;
        }

        /// <summary> Adds data from a zipped directory containing a lift file </summary>
        /// <remarks> POST: v1/projects/{projectId}/lift/upload </remarks>
        /// <returns> Number of words added </returns>
        [HttpPost("upload")]
        // Allow clients to POST large import files to the server (default limit is 28MB).
        // Note: The HTTP Proxy in front, such as NGINX, also needs to be configured
        //     to allow large requests through as well.
        [RequestSizeLimit(250_000_000)]  // 250MB.
        public async Task<IActionResult> UploadLiftFile(string projectId, [FromForm] FileUpload fileUpload)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Sanitize projectId
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure Lift file has not already been imported.
            if (!await _projRepo.CanImportLift(projectId))
            {
                return new BadRequestObjectResult("A Lift file has already been uploaded");
            }

            var liftStoragePath = FileStorage.GenerateLiftImportDirPath(projectId);

            // Clear out any files left by a failed import
            RobustIO.DeleteDirectoryAndContents(liftStoragePath);

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
            var extractDir = FileOperations.GetRandomTempDir();

            // Extract the zip to new created directory.
            FileOperations.ExtractZipFile(fileUpload.FilePath, extractDir, true);

            // Check number of directories extracted
            var directoriesExtracted = Directory.GetDirectories(extractDir);
            var extractedDirPath = "";

            switch (directoriesExtracted.Length)
            {
                // If there was one directory, we're good
                case 1:
                    {
                        extractedDirPath = directoriesExtracted.First();
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
            FileOperations.CopyDirectory(extractedDirPath, liftStoragePath);
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

            int liftParseResult;
            // Sets the projectId of our parser to add words to that project
            var liftMerger = _liftService.GetLiftImporterExporter(projectId, _wordRepo);
            try
            {
                // Add character set to project from ldml file
                var proj = await _projRepo.GetProject(projectId);
                if (proj is null)
                {
                    return new NotFoundObjectResult(projectId);
                }

                _liftService.LdmlImport(
                    Path.Combine(liftStoragePath, "WritingSystems"),
                    proj.VernacularWritingSystem.Bcp47, _projRepo, proj);

                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(liftMerger);

                // Import words from lift file
                liftParseResult = parser.ReadLiftFile(extractedLiftPath.FirstOrDefault());
                await liftMerger.SaveImportEntries();
            }
            catch (Exception e)
            {
                _logger.LogError(e, $"Error importing lift file {fileUpload.Name} into project {projectId}.");
                return new BadRequestObjectResult("Error processing the lift data. Contact support for help.");
            }

            // Store that we have imported Lift data already for this project to signal the frontend
            // not to attempt to import again.
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            project.LiftImported = true;
            await _projRepo.Update(projectId, project);

            return new OkObjectResult(liftParseResult);
        }

        /// <summary> Packages project data into zip file </summary>
        /// <remarks> GET: v1/projects/{projectId}/lift/export </remarks>
        /// <returns> ProjectId, if export successful </returns>
        [HttpGet("export")]
        public async Task<IActionResult> ExportLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await ExportLiftFile(projectId, userId);
        }

        // These internal methods are extracted for unit testing
        internal async Task<IActionResult> ExportLiftFile(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Sanitize projectId
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Check if another export started
            if (_liftService.IsExportInProgress(userId))
            {
                return new ConflictResult();
            }

            // Store in-progress status for the export
            _liftService.SetExportInProgress(userId, true);

            try
            {
                // Ensure project has words
                var words = await _wordRepo.GetAllWords(projectId);
                if (words.Count == 0)
                {
                    _liftService.SetExportInProgress(userId, false);
                    return new BadRequestResult();
                }

                // Export the data to a zip, read into memory, and delete zip
                var exportedFilepath = await CreateLiftExport(projectId);

                // Store the temporary path to the exported file for user to download later.
                _liftService.StoreExport(userId, exportedFilepath);
                await _notifyService.Clients.All.SendAsync("DownloadReady", userId);
                return new OkObjectResult(projectId);
            }
            catch
            {
                _liftService.SetExportInProgress(userId, false);
                throw;
            }
        }

        internal async Task<string> CreateLiftExport(string projectId)
        {
            var exportedFilepath = await _liftService.LiftExport(projectId, _wordRepo, _projRepo);
            return exportedFilepath;
        }

        /// <summary> Downloads project data in zip file </summary>
        /// <remarks> GET: v1/projects/{projectId}/lift/download </remarks>
        /// <returns> Binary Lift file </returns>
        [HttpGet("download")]
        public async Task<IActionResult> DownloadLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await DownloadLiftFile(projectId, userId);
        }

        internal async Task<IActionResult> DownloadLiftFile(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Ensure export exists.
            var filePath = _liftService.RetrieveExport(userId);
            if (filePath is null)
            {
                return new NotFoundObjectResult(userId);
            }

            var file = System.IO.File.OpenRead(filePath);
            return File(
                file,
                "application/octet-stream",
                $"LiftExport-{projectId}-{DateTime.Now:yyyy-MM-dd_hh-mm-ss-fff}.zip");
        }

        /// <summary> Delete prepared export </summary>
        /// <remarks> GET: v1/projects/{projectId}/lift/deleteexport </remarks>
        /// <returns> UserId, if successful </returns>
        [HttpGet("deleteexport")]
        public async Task<IActionResult> DeleteLiftFile()
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await DeleteLiftFile(userId);
        }

        internal async Task<IActionResult> DeleteLiftFile(string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            _liftService.DeleteExport(userId);
            return new OkObjectResult(userId);
        }

        /// <summary> Check if lift import has already happened for this project </summary>
        /// <remarks> GET: v1/projects/{projectId}/lift/check </remarks>
        /// <returns> A bool </returns>
        [HttpGet("check")]
        public async Task<IActionResult> CanUploadLift(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return new ForbidResult();
            }

            // Sanitize user input
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            return new OkObjectResult(await _projRepo.CanImportLift(projectId));
        }
    }

    [Serializable]
    public class FileSystemError : Exception
    {
        public FileSystemError() { }

        public FileSystemError(string message) : base(message) { }

        public FileSystemError(string message, Exception innerException) : base(message, innerException) { }
    }
}
