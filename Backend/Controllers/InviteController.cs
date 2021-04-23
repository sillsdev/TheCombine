using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/invite")]
    [EnableCors("AllowAll")]
    public class InviteController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IUserRepository _userRepo;
        private readonly IInviteService _inviteService;

        public InviteController(IInviteService inviteService, IProjectRepository projRepo, IUserRepository userRepo)
        {
            _projRepo = projRepo;
            _userRepo = userRepo;
            _inviteService = inviteService;
        }

        /// <summary> Generates invite link and sends email containing link </summary>
        /// <remarks> PUT: v1/invite </remarks>
        [HttpPut]
        public async Task<IActionResult> EmailInviteToProject([FromBody] EmailInviteData data)
        {
            var projectId = data.ProjectId;
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var linkWithIdentifier = await _inviteService.CreateLinkWithToken(project, data.EmailAddress);

            await _inviteService.EmailLink(data.EmailAddress, data.Message, linkWithIdentifier, data.Domain, project);

            return new OkObjectResult(linkWithIdentifier);
        }

        /// <summary> Validates token in url and adds user to project </summary>
        /// <remarks> PUT: v1/invite/{projectId}/validate/{token} </remarks>
        [AllowAnonymous]
        [HttpPut("{projectId}/validate/{token}")]
        public async Task<IActionResult> ValidateToken(string projectId, string token)
        {

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var activeTokenExists = false;
            var tokenObj = new EmailInvite();
            foreach (var tok in project.InviteTokens)
            {
                if (tok.Token == token && DateTime.Now < tok.ExpireTime)
                {
                    activeTokenExists = true;
                    tokenObj = tok;
                    break;
                }
            }

            var users = await _userRepo.GetAllUsers();
            var currentUser = new User();
            var userIsRegistered = false;
            foreach (var user in users)
            {
                if (user.Email == tokenObj.Email)
                {
                    currentUser = user;
                    userIsRegistered = true;
                    break;
                }
            }

            var status = new[] { activeTokenExists, userIsRegistered };
            if (activeTokenExists && !userIsRegistered)
            {
                return new OkObjectResult(status);
            }
            if (activeTokenExists && userIsRegistered
                                  && !currentUser.ProjectRoles.ContainsKey(projectId)
                                  && await _inviteService.RemoveTokenAndCreateUserRole(project, currentUser, tokenObj))
            {
                return new OkObjectResult(status);
            }
            status[0] = false;
            status[1] = false;
            return new OkObjectResult(status);
        }

        /// <remarks>
        /// All [FromBody] serialization classes must have mutable attributes (i.e. not readonly).
        /// </remarks>
        public class EmailInviteData
        {
            public string EmailAddress{ get; set; }
            public string Message{ get; set; }
            public string ProjectId{ get; set; }
            public string Domain{ get; set; }

            public EmailInviteData()
            {
                EmailAddress = "";
                Message = "";
                ProjectId = "";
                Domain = "";
            }
        }
    }
}
