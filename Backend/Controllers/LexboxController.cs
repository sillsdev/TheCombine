using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/lexbox")]
    public class LexboxController(ILexboxAuthService lexboxAuthService, ILexboxQueryService lexboxQueryService,
        IPermissionService permissionService, IProjectRepository projRepo, IWordService wordService) : Controller
    {
        private readonly ILexboxAuthService _lexboxAuthService = lexboxAuthService;
        private readonly ILexboxQueryService _lexboxQueryService = lexboxQueryService;
        private readonly IPermissionService _permissionService = permissionService;
        private readonly IProjectRepository _projRepo = projRepo;
        private readonly IWordService _wordService = wordService;

        private const string otelTagName = "otel.LexboxController";

        /// <summary> Gets authentication status for the current request. </summary>
        [HttpGet("auth-status", Name = "GetAuthStatus")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LexboxAuthStatus))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAuthStatus()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting auth status");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            return Ok(await _lexboxAuthService.GetAuthStatus(HttpContext, combineUserId));
        }

        /// <summary> Creates a single-use ticket for <see cref="GenerateLogin"/>. </summary>
        /// <remarks>
        /// The login page opens in a new window, which can't send the Combine auth header, so the ticket
        /// carries the Combine user's identity instead.
        /// </remarks>
        [HttpPost("login-ticket", Name = "CreateLoginTicket")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult CreateLoginTicket()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating login ticket");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            return Ok(_lexboxAuthService.CreateLoginTicket(combineUserId));
        }

        /// <summary> Generates a redirect to Lexbox login for OIDC sign-in. </summary>
        /// <param name="ticket"> From <see cref="CreateLoginTicket"/>. </param>
        [HttpGet("login", Name = "GenerateLogin")]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GenerateLogin([FromQuery] string? ticket)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "generating login");

            var combineUserId = _lexboxAuthService.RedeemLoginTicket(ticket);
            if (combineUserId is null)
            {
                return Forbid();
            }

            try
            {
                await _lexboxAuthService.Challenge(HttpContext, combineUserId);
                return new EmptyResult();
            }
            catch (Exception ex)
            {
                return Problem(title: "Lexbox OIDC challenge failed", detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        /// <summary> Signs out the current user from Lexbox cookie and OIDC. </summary>
        [HttpPost("logout", Name = "LogOut")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> LogOut()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "logging out");

            await _lexboxAuthService.SignOut(HttpContext);

            // TODO: Consider if we also need to sign out of the OIDC scheme here.
            // await HttpContext.SignOutAsync(LexboxOidcScheme)
            // is a no-op since it doesn't handle the redirect.

            return NoContent();
        }

        /// <summary> Gets Lexbox projects for the signed-in Lexbox user. </summary>
        [HttpGet("projects", Name = "GetProjects")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<LexboxProject>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> GetProjects()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting Lexbox projects");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext, combineUserId);
            if (string.IsNullOrEmpty(accessToken))
            {
                return LexboxProblem(LexboxQueryException.NotLoggedIn());
            }

            try
            {
                List<LexboxProject> projects = await _lexboxQueryService.GetMyProjectsAsync(accessToken);
                return Ok(projects);
            }
            catch (LexboxQueryException ex)
            {
                return LexboxProblem(ex);
            }
        }

        /// <summary> Checks that the signed-in Lexbox user can import the entries of a Lexbox project. </summary>
        /// <remarks> Lets the frontend catch a failing import before it creates a project to import into. </remarks>
        [HttpGet("projects/{projectCode}/check", Name = "CheckProject")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> CheckProject(string projectCode)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking Lexbox project");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext, combineUserId);
            if (string.IsNullOrEmpty(accessToken))
            {
                return LexboxProblem(LexboxQueryException.NotLoggedIn());
            }

            try
            {
                await _lexboxQueryService.CheckProjectEntriesAsync(accessToken, projectCode);
                return NoContent();
            }
            catch (LexboxQueryException ex)
            {
                return LexboxProblem(ex);
            }
        }

        /// <summary>
        /// Imports a Lexbox project's entries, in the Combine project's vernacular language, into a Combine project
        /// that has no imported data.
        /// </summary>
        /// <returns> The number of words imported. </returns>
        [HttpPost("import/{projectId}", Name = "ImportEntries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status502BadGateway)]
        public async Task<IActionResult> ImportEntries(string projectId, [FromBody] LexboxImportRequest request)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "importing Lexbox entries");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Import, projectId))
            {
                return Forbid();
            }

            var combineUserId = _permissionService.GetUserId(HttpContext);
            var accessToken = await _lexboxAuthService.TryGetAccessToken(HttpContext, combineUserId);
            if (string.IsNullOrEmpty(accessToken))
            {
                return LexboxProblem(LexboxQueryException.NotLoggedIn());
            }

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound(projectId);
            }
            if (project.LiftImported || project.LexboxProjectCode is not null)
            {
                return BadRequest("This project already has imported data.");
            }

            List<Word> words;
            try
            {
                words = await _lexboxQueryService.GetProjectEntriesAsync(accessToken, request.ProjectCode,
                    project.VernacularWritingSystem.Bcp47, request.AnalysisLangs);
            }
            catch (LexboxQueryException ex)
            {
                return LexboxProblem(ex);
            }

            words.ForEach(w => w.ProjectId = projectId);
            words = await _wordService.ImportWords(words);

            // Don't update an existing project if no words were imported in its vernacular language.
            var isNewProject = project.AnalysisWritingSystems.All(ws => string.IsNullOrEmpty(ws.Bcp47));
            if (!isNewProject && words.Count == 0)
            {
                return Ok(0);
            }

            AddImportToProject(project, request, words);
            await _projRepo.Update(projectId, project);

            return Ok(words.Count);
        }

        /// <summary> Updates project settings for imported data, as LIFT import does. </summary>
        private static void AddImportToProject(Project project, LexboxImportRequest request, List<Word> words)
        {
            // The Lexbox metadata can omit languages the entries use, so add those after the metadata's.
            var dataLangs = words.SelectMany(w => w.Senses.SelectMany(Language.GetSenseAnalysisLangTags));
            var newLangs = request.AnalysisLangs.Concat(dataLangs).Distinct()
                .Where(lang => !project.AnalysisWritingSystems.Any(ws => ws.Bcp47 == lang));
            project.AnalysisWritingSystems.AddRange(Language.ConvertLangTagsToWritingSystems(newLangs));
            project.AnalysisWritingSystems.RemoveAll(ws => string.IsNullOrWhiteSpace(ws.Bcp47));
            if (project.AnalysisWritingSystems.Count == 0)
            {
                // The list cannot be empty.
                project.AnalysisWritingSystems.Add(new("en", "English"));
            }

            // Signal the frontend to display definitions or grammatical info if any were imported.
            project.DefinitionsEnabled = words.Any(w => w.Senses.Any(s => s.Definitions.Count > 0));
            project.GrammaticalInfoEnabled = words.Any(
                w => w.Senses.Any(s => s.GrammaticalInfo.CatGroup != GramCatGroup.Unspecified));

            // An empty import leaves nothing for another import to duplicate.
            if (words.Count > 0)
            {
                project.LexboxProjectCode = request.ProjectCode;
            }
        }

        private ObjectResult LexboxProblem(LexboxQueryException ex)
            => Problem(title: ex.Title, detail: ex.Message, statusCode: ex.StatusCode);
    }
}
