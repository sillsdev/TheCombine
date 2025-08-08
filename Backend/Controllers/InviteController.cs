using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/invite")]
    public class InviteController(
        IProjectRepository projRepo, IInviteService inviteService, IPermissionService permissionService) : Controller
    {
        private readonly IProjectRepository _projRepo = projRepo;
        private readonly IInviteService _inviteService = inviteService;
        private readonly IPermissionService _permissionService = permissionService;

        /// <summary> Generates invite link and sends email containing link </summary>
        [HttpPut(Name = "EmailInviteToProject")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> EmailInviteToProject([FromBody, BindRequired] EmailInviteData data)
        {
            var projectId = data.ProjectId;
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }
            if (!await _permissionService.ContainsProjectRole(HttpContext, data.Role, projectId))
            {
                return Forbid();
            }

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return NotFound($"projectId: {projectId}");
            }

            return Ok(await _inviteService.EmailLink(project, data.Role, data.EmailAddress, data.Message));
        }

        /// <summary> Validates invite token in url and adds user to project </summary>
        [AllowAnonymous]
        [HttpPut("{projectId}/validate/{token}", Name = "ValidateToken")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(EmailInviteStatus))]
        public async Task<IActionResult> ValidateToken(string projectId, string token)
        {
            return Ok(await _inviteService.ValidateProjectToken(projectId, token));
        }
    }

    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
    /// </remarks>
    public class EmailInviteData
    {
        [Required]
        public string EmailAddress { get; set; }
        [Required]
        public string Message { get; set; }
        [Required]
        public string ProjectId { get; set; }
        [Required]
        public Role Role { get; set; }

        public EmailInviteData()
        {
            EmailAddress = "";
            Message = "";
            ProjectId = "";
            Role = Role.Harvester;
        }
    }
}
