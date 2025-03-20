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

        public LiftController(
            IWordRepository wordRepo, IProjectRepository projRepo, IPermissionService permissionService,
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
        /// Extract a LIFT file to a temporary folder.
        /// Get all vernacular writing systems from the extracted location.
        /// </summary>
        /// <returns> A List of <see cref="WritingSystem"/>s. </returns>
        [HttpPost("uploadandgetwritingsystems", Name = "UploadLiftFileAndGetWritingSystems")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<WritingSystem>))]
        // Allow clients to POST large import files to the server (default limit is 28MB).
        // Note: The HTTP Proxy in front, such as NGINX, also needs to be configured
        //     to allow large requests through as well.
        [RequestSizeLimit(250_000_000)]  // 250MB.
        public async Task<IActionResult> UploadLiftFileAndGetWritingSystems(IFormFile? file)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            if (file is null)
            {
                return BadRequest("Null File");
            }
            return await UploadLiftFileAndGetWritingSystems(file, userId);
        }

        internal async Task<IActionResult> UploadLiftFileAndGetWritingSystems(IFormFile? file, string userId)
        {
            string extractedLiftRootPath;
            try
            {
                var extractDir = await FileOperations.ExtractZipFile(file);
                _liftService.StoreImport(userId, extractDir);
                extractedLiftRootPath = LiftHelper.GetLiftRootFromExtractedZip(extractDir);
            }
            catch (Exception e)
            {
                _liftService.DeleteImport(userId);
                return BadRequest(e.Message);
            }

            return Ok(Language.GetWritingSystems(extractedLiftRootPath));
        }

        /// <summary> Adds data from a directory containing a .lift file </summary>
        /// <returns> Number of words added </returns>
        [HttpPost("finishupload", Name = "FinishUploadLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        public async Task<IActionResult> FinishUploadLiftFile(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Import, projectId))
            {
                return Forbid();
            }
            var userId = _permissionService.GetUserId(HttpContext);
            return await FinishUploadLiftFile(projectId, userId);
        }

        internal async Task<IActionResult> FinishUploadLiftFile(string projectId, string userId)
        {
            // Sanitize projectId
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure LIFT file has not already been imported.
            if (!await _projRepo.CanImportLift(projectId))
            {
                return BadRequest("A LIFT file has already been uploaded into this project.");
            }

            var extractDir = _liftService.RetrieveImport(userId);
            if (string.IsNullOrWhiteSpace(extractDir))
            {
                return BadRequest("No in-progress import to finish.");
            }

            string extractedLiftRootPath;
            try
            {
                extractedLiftRootPath = LiftHelper.GetLiftRootFromExtractedZip(extractDir);
            }
            catch (Exception e)
            {
                _liftService.DeleteImport(userId);
                return BadRequest(e.Message);
            }

            var liftStoragePath = FileStorage.GenerateLiftImportDirPath(projectId);

            // Clear out any files left by a failed import
            RobustIO.DeleteDirectoryAndContents(liftStoragePath);

            // Copy the extracted contents into the persistent storage location for the project.
            FileOperations.CopyDirectory(extractedLiftRootPath, liftStoragePath);
            _liftService.DeleteImport(userId);

            return await AddImportToProject(liftStoragePath, projectId);
        }

        /// <summary> Adds data from a zipped directory containing a LIFT file </summary>
        /// <returns> Number of words added </returns>
        [HttpPost("upload", Name = "UploadLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        // Allow clients to POST large import files to the server (default limit is 28MB).
        // Note: The HTTP Proxy in front, such as NGINX, also needs to be configured
        //     to allow large requests through as well.
        [RequestSizeLimit(250_000_000)]  // 250MB.
        public async Task<IActionResult> UploadLiftFile(string projectId, IFormFile? file)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Import, projectId))
            {
                return Forbid();
            }

            // Sanitize projectId
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure LIFT file has not already been imported.
            if (!await _projRepo.CanImportLift(projectId))
            {
                return BadRequest("A LIFT file has already been uploaded into this project.");
            }

            string extractDir;
            string extractedLiftRootPath;
            try
            {
                extractDir = await FileOperations.ExtractZipFile(file);
                extractedLiftRootPath = LiftHelper.GetLiftRootFromExtractedZip(extractDir);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

            var liftStoragePath = FileStorage.GenerateLiftImportDirPath(projectId);

            // Clear out any files left by a failed import
            RobustIO.DeleteDirectoryAndContents(liftStoragePath);

            // Copy the extracted contents into the persistent storage location for the project.
            FileOperations.CopyDirectory(extractedLiftRootPath, liftStoragePath);
            Directory.Delete(extractDir, true);

            return await AddImportToProject(liftStoragePath, projectId);
        }

        private async Task<IActionResult> AddImportToProject(string liftStoragePath, string projectId)
        {
            // Sanitize projectId
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            int liftParseResult;
            // Sets the projectId of our parser to add words to that project
            var liftMerger = _liftService.GetLiftImporterExporter(
                projectId, proj.VernacularWritingSystem.Bcp47, _wordRepo);
            var importedAnalysisWritingSystems = new List<WritingSystem>();
            var doesImportHaveDefinitions = false;
            var doesImportHaveGrammaticalInfo = false;
            try
            {
                // Add character set to project from ldml file
                await _liftService.LdmlImport(liftStoragePath, _projRepo, proj);

                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(liftMerger);

                // Import words from .lift file
                liftParseResult = parser.ReadLiftFile(
                    FileOperations.FindFilesWithExtension(liftStoragePath, ".lift", true).First());

                // Get data from imported words before they're deleted by SaveImportEntries.
                importedAnalysisWritingSystems = liftMerger.GetImportAnalysisWritingSystems();
                doesImportHaveDefinitions = liftMerger.DoesImportHaveDefinitions();
                doesImportHaveGrammaticalInfo = liftMerger.DoesImportHaveGrammaticalInfo();

                await liftMerger.SaveImportEntries();
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error importing LIFT file into project {ProjectId}.", projectId);
                return BadRequest("Error processing the LIFT data. Contact support for help.");
            }

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }

            // Add analysis writing systems found in the data, avoiding duplicate and empty bcp47 codes.
            project.AnalysisWritingSystems.AddRange(importedAnalysisWritingSystems.Where(
                iws => !project.AnalysisWritingSystems.Any(ws => ws.Bcp47 == iws.Bcp47)));
            project.AnalysisWritingSystems.RemoveAll(ws => string.IsNullOrWhiteSpace(ws.Bcp47));
            if (project.AnalysisWritingSystems.Count == 0)
            {
                // The list cannot be empty.
                project.AnalysisWritingSystems.Add(new("en", "English"));
            }

            // Store whether we have imported any senses with definitions or grammatical info
            // to signal the frontend to display that data for this project.
            project.DefinitionsEnabled = doesImportHaveDefinitions;
            project.GrammaticalInfoEnabled = doesImportHaveGrammaticalInfo;

            // Add new custom domains to the project
            liftMerger.GetCustomSemanticDomains().ForEach(customDom =>
            {
                if (!project.SemanticDomains.Any(dom => dom.Id == customDom.Id && dom.Lang == customDom.Lang))
                {
                    project.SemanticDomains.Add(customDom);
                }
            });

            // Store that we have imported LIFT data already for this project
            // to signal the frontend not to attempt to import again in this project.
            project.LiftImported = true;

            await _projRepo.Update(projectId, project);

            return Ok(liftParseResult);
        }

        /// <summary> Cancels project data into zip file </summary>
        /// <returns> ProjectId, if cancel successful </returns>
        [HttpGet("cancelExport", Name = "CancelLiftExport")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CancelLiftExport(string projectId)
        {
            // get userID
            var userId = _permissionService.GetUserId(HttpContext);
            return await CancelLiftExport(projectId, userId);
        }

        private async Task<IActionResult> CancelLiftExport(string projectId, string userId)
        {
            // _liftService.SetExportCanceled();

            _liftService.SetCancelExport(userId, true);
            // stand-in for async
            await _notifyService.Clients.All.SendAsync(CombineHub.DownloadReady, userId);
            return Ok(projectId);
        }

        /// <summary> Packages project data into zip file </summary>
        /// <returns> ProjectId, if export successful </returns>
        [HttpGet("export", Name = "ExportLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> ExportLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            // need to go through permissionservice to get this?
            var exportId = HttpContext.TraceIdentifier;
            return await ExportLiftFile(projectId, userId, exportId);
        }

        private async Task<IActionResult> ExportLiftFile(string projectId, string userId, string exportId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Export, projectId))
            {
                return Forbid();
            }

            // Sanitize projectId
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
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
            _liftService.SetExportInProgress(userId, true, exportId);

            // Ensure project has words
            var words = await _wordRepo.GetAllWords(projectId);
            if (words.Count == 0)
            {
                _liftService.SetExportInProgress(userId, false, "");
                return BadRequest("No words to export.");
            }

            // Run the task without waiting for completion.
            // This Task will be scheduled within the exiting Async executor thread pool efficiently.
            // See: https://stackoverflow.com/a/64614779/1398841
            _ = Task.Run(() => CreateLiftExportThenSignal(projectId, userId, exportId));
            // maybe here check if there was a cancellation
            return Ok(projectId);
        }

        // These internal methods are extracted for unit testing.
        internal async Task<bool> CreateLiftExportThenSignal(string projectId, string userId, string exportId)
        {
            // Export the data to a zip, read into memory, and delete zip.
            try
            {
                var exportedFilepath = await CreateLiftExport(projectId);



                // Store the temporary path to the exported file for user to download later.

                var proceed = _liftService.StoreExport(userId, exportedFilepath, exportId);

                // want to check whether a cancelation has 
                // been made anytime during the exporting, and if so, do not want to let user know
                // about a download. 

                if (proceed)
                {
                    await _notifyService.Clients.All.SendAsync(CombineHub.DownloadReady, userId);
                }
                else
                {
                    // check if want to notify, since may be a while later
                    await _notifyService.Clients.All.SendAsync(CombineHub.CancelExport, userId);
                }
                return true;
            }
            catch (Exception e)
            {
                _logger.LogError("Error exporting project {ProjectId}{NewLine}{Message}:{ExceptionStack}",
                    projectId, Environment.NewLine, e.Message, e.StackTrace);
                _liftService.DeleteExport(userId);
                await _notifyService.Clients.All.SendAsync(CombineHub.ExportFailed, userId);
                throw;
            }
        }

        internal async Task<string> CreateLiftExport(string projectId)
        {
            return await _liftService.LiftExport(projectId, _wordRepo, _projRepo);
        }

        /// <summary> Downloads project data in zip file </summary>
        /// <returns> Binary LIFT file </returns>
        [HttpGet("download", Name = "DownloadLiftFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        public async Task<IActionResult> DownloadLiftFile(string projectId)
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return await DownloadLiftFile(projectId, userId);
        }

        internal async Task<IActionResult> DownloadLiftFile(string projectId, string userId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Export, projectId))
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
        public IActionResult DeleteLiftFile()
        {
            var userId = _permissionService.GetUserId(HttpContext);
            return DeleteLiftFile(userId);
        }

        internal IActionResult DeleteLiftFile(string userId)
        {
            // Don't check _permissionService.HasProjectPermission,
            // since the LIFT file is user-specific, not tied to a project.

            _liftService.DeleteExport(userId);
            return Ok(userId);
        }

        /// <summary> Check if LIFT import has already happened for this project </summary>
        /// <returns> A bool </returns>
        [HttpGet("check", Name = "CanUploadLift")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> CanUploadLift(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Import, projectId))
            {
                return Forbid();
            }

            // Sanitize user input
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            return Ok(await _projRepo.CanImportLift(projectId));
        }
    }
}
