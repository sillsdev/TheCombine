using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using SIL.IO;
using SIL.Lift.Parsing;

[assembly: InternalsVisibleTo("Backend.Tests")]
namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/lift")]
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

        /// <summary>
        /// Find any .list files within a directory.
        /// </summary>
        private static List<string> FindLiftFiles(string dir)
        {
            return Directory.GetFiles(dir, "*.lift").ToList();
        }

        /// <summary> Adds data from a zipped directory containing a lift file </summary>
        /// <returns> Number of words added </returns>
        [HttpPost("upload", Name = "UploadLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        // Allow clients to POST large import files to the server (default limit is 28MB).
        // Note: The HTTP Proxy in front, such as NGINX, also needs to be configured
        //     to allow large requests through as well.
        [RequestSizeLimit(250_000_000)]  // 250MB.
        public async Task<IActionResult> UploadLiftFile(string projectId, [FromForm] FileUpload fileUpload)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return Forbid();
            }

            // Sanitize projectId
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure Lift file has not already been imported.
            if (!await _projRepo.CanImportLift(projectId))
            {
                return BadRequest("A Lift file has already been uploaded.");
            }

            var liftStoragePath = FileStorage.GenerateLiftImportDirPath(projectId);
            const string invalidLiftFileMessagePrefix = "Malformed Lift file: ";

            // Clear out any files left by a failed import
            RobustIO.DeleteDirectoryAndContents(liftStoragePath);

            var file = fileUpload.File;
            if (file is null)
            {
                return BadRequest($"${invalidLiftFileMessagePrefix}Null File");
            }

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return BadRequest($"{invalidLiftFileMessagePrefix}Empty File");
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

            // Search for .lift files to determine the root of the Lift project.
            string extractedLiftRootPath;
            // Handle this structuring case:
            // flex.zip
            //    | audio
            //    | WritingSystems
            //    | project_name.lift
            //    | project_name.lift-ranges
            if (FindLiftFiles(extractDir).Count > 0)
            {
                extractedLiftRootPath = extractDir;
            }
            // Handle the typical structuring case:
            //  flex.zip
            //    | project_name
            //      | audio
            //      | WritingSystems
            //      | project_name.lift
            //      | project_name.lift-ranges
            else
            {
                extractedLiftRootPath = Directory.GetDirectories(extractDir).First();
            }

            // Copy the extracted contents into the persistent storage location for the project.
            FileOperations.CopyDirectory(extractedLiftRootPath, liftStoragePath);
            Directory.Delete(extractDir, true);

            // Validate that only one .lift file is included.
            var extractedLiftFiles = FindLiftFiles(liftStoragePath);
            switch (extractedLiftFiles.Count)
            {
                case 0:
                    return BadRequest($"{invalidLiftFileMessagePrefix}No .lift files detected.");
                case > 1:
                    return BadRequest($"{invalidLiftFileMessagePrefix}More than one .lift file detected.");
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
                    return NotFound(projectId);
                }

                _liftService.LdmlImport(
                    Path.Combine(liftStoragePath, "WritingSystems"),
                    proj.VernacularWritingSystem.Bcp47, _projRepo, proj);

                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(liftMerger);

                // Import words from .lift file
                liftParseResult = parser.ReadLiftFile(extractedLiftFiles.First());
                await liftMerger.SaveImportEntries();
            }
            catch (Exception e)
            {
                _logger.LogError(e, $"Error importing lift file {fileUpload.Name} into project {projectId}.");
                return BadRequest("Error processing the lift data. Contact support for help.");
            }

            // Store that we have imported Lift data already for this project to signal the frontend
            // not to attempt to import again.
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }

            project.LiftImported = true;
            await _projRepo.Update(projectId, project);

            return Ok(liftParseResult);
        }

        /// <summary> Packages project data into zip file </summary>
        /// <returns> ProjectId, if export successful </returns>
        [HttpGet("export", Name = "ExportLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> ExportLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await ExportLiftFile(projectId, userId);
        }

        private async Task<IActionResult> ExportLiftFile(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return Forbid();
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
                return NotFound(projectId);
            }

            // Check if another export started
            if (_liftService.IsExportInProgress(userId))
            {
                return Conflict();
            }

            // Store in-progress status for the export
            _liftService.SetExportInProgress(userId, true);

            // Ensure project has words
            var words = await _wordRepo.GetAllWords(projectId);
            if (words.Count == 0)
            {
                _liftService.SetExportInProgress(userId, false);
                return BadRequest("No words to export.");
            }

            // Run the task without waiting for completion.
            // This Task will be scheduled within the exiting Async executor thread pool efficiently.
            // See: https://stackoverflow.com/a/64614779/1398841
            _ = Task.Run(() => CreateLiftExportThenSignal(projectId, userId));
            return Ok(projectId);
        }

        // These internal methods are extracted for unit testing.
        internal async Task<bool> CreateLiftExportThenSignal(string projectId, string userId)
        {
            // Export the data to a zip, read into memory, and delete zip.
            var exportedFilepath = await CreateLiftExport(projectId);

            // Store the temporary path to the exported file for user to download later.
            _liftService.StoreExport(userId, exportedFilepath);
            await _notifyService.Clients.All.SendAsync(CombineHub.DownloadReady, userId);
            return true;
        }

        internal async Task<string> CreateLiftExport(string projectId)
        {
            return await _liftService.LiftExport(projectId, _wordRepo, _projRepo);
        }

        /// <summary> Downloads project data in zip file </summary>
        /// <returns> Binary Lift file </returns>
        [HttpGet("download", Name = "DownloadLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        public async Task<IActionResult> DownloadLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await DownloadLiftFile(projectId, userId);
        }

        internal async Task<IActionResult> DownloadLiftFile(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return Forbid();
            }

            // Ensure export exists.
            var filePath = _liftService.RetrieveExport(userId);
            if (filePath is null)
            {
                return NotFound(userId);
            }

            var file = System.IO.File.OpenRead(filePath);
            return File(
                file,
                "application/octet-stream",
                $"LiftExport-{projectId}-{DateTime.Now:yyyy-MM-dd_hh-mm-ss-fff}.zip");
        }

        /// <summary> Delete prepared export </summary>
        /// <returns> UserId, if successful </returns>
        [HttpGet("deleteexport", Name = "DeleteLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> DeleteLiftFile()
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await DeleteLiftFile(userId);
        }

        internal async Task<IActionResult> DeleteLiftFile(string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return Forbid();
            }

            _liftService.DeleteExport(userId);
            return Ok(userId);
        }

        /// <summary> Check if lift import has already happened for this project </summary>
        /// <returns> A bool </returns>
        [HttpGet("check", Name = "CanUploadLift")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> CanUploadLift(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.ImportExport))
            {
                return Forbid();
            }

            // Sanitize user input
            if (!Sanitization.SanitizeId(projectId))
            {
                return new UnsupportedMediaTypeResult();
            }

            return Ok(await _projRepo.CanImportLift(projectId));
        }
    }
}
