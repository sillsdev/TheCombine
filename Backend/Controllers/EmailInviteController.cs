
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects")]
    [EnableCors("AllowAll")]

    public class EmailInviteController : Controller
    {
        private readonly IProjectService _projectService;
        private readonly IEmailInviteService _emailInviteService;
        public EmailInviteController(IProjectService projectService, IEmailInviteService emailInviteService)
        {
            _projectService = projectService;
            _emailInviteService = emailInviteService;
        }

        [HttpPut("{projectId}/invite/{emailAddress}")]
        public async Task<IActionResult> CreateLinkWithToken(string projectId, string emailAddress)
        {
            var linkWithIdentifier = await _emailInviteService.CreateLinkWithToken(projectId, emailAddress);

            return new OkObjectResult(linkWithIdentifier);
        }

        [HttpPut("{projectId}/invite/validate/{userId}/{token}")]
        public async Task<IActionResult> ValidateToken(string projectId, string userId, string token)
        {
            var project = await _projectService.GetProject(projectId);
            if (project.InviteTokens.Contains(token) && await _emailInviteService.RemoveTokenAndCreateUserRole(project, userId, token))
            {
                return new OkObjectResult(true);
            }
            else
            {
                return new ForbidResult();
            }
        }
    }
}
