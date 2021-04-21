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
    [Route("v1/projectinvite")]
    [EnableCors("AllowAll")]
    public class ProjectInviteController : Controller
    {
        private readonly IProjectInviteService _projInvService;
        private readonly IProjectRepository _projRepo;
        private readonly IUserRepository _userRepo;

        public ProjectInviteController(IProjectInviteService projInvService, IProjectRepository projRepo, IUserRepository userRepo)
        {
            _projInvService = projInvService;
            _projRepo = projRepo;
            _userRepo = userRepo;
        }

        /// <summary> Generates invite link and sends email containing link </summary>
        /// <remarks> PUT: v1/projectinvite </remarks>
        [HttpPut()]
        public async Task<IActionResult> EmailInviteToProject([FromBody] EmailInviteData data)
        {
            var projectId = data.ProjectId;
            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var linkWithIdentifier = await _projInvService.CreateLinkWithToken(project, data.EmailAddress);

            await _projInvService.EmailLink(data.EmailAddress, data.Message, linkWithIdentifier, data.Domain, project);

            return new OkObjectResult(linkWithIdentifier);
        }

        /// <summary> Validates token in url and adds user to project </summary>
        /// <remarks> PUT: v1/projectinvite/{projectId}/validate/{token} </remarks>
        [AllowAnonymous]
        [HttpPut("{projectId}/validate/{token}")]
        public async Task<IActionResult> ValidateToken(string projectId, string token)
        {

            var project = await _projRepo.GetProject(projectId);
            if (project is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var users = await _userRepo.GetAllUsers();
            var status = new bool[2];
            var activeTokenExists = false;
            var userIsRegistered = false;
            var tokenObj = new EmailInvite();
            var currentUser = new User();

            foreach (var tok in project.InviteTokens)
            {
                if (tok.Token == token && DateTime.Now < tok.ExpireTime)
                {
                    tokenObj = tok;
                    activeTokenExists = true;
                    break;
                }
            }
            foreach (var user in users)
            {
                if (user.Email == tokenObj.Email)
                {
                    currentUser = user;
                    userIsRegistered = true;
                    break;
                }
            }

            status[0] = activeTokenExists;
            status[1] = userIsRegistered;

            if (activeTokenExists && !userIsRegistered)
            {
                return new OkObjectResult(status);
            }

            if (activeTokenExists && userIsRegistered
                                  && !currentUser.ProjectRoles.ContainsKey(projectId)
                                  && await _projInvService.RemoveTokenAndCreateUserRole(project, currentUser, tokenObj))
            {
                return new OkObjectResult(status);
            }

            status[0] = false;
            status[1] = false;
            return new OkObjectResult(status);
        }

        public class EmailInviteData
        {
            public readonly string EmailAddress;
            public readonly string Message;
            public readonly string ProjectId;
            public readonly string Domain;

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
