using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/auth")]
    public class AuthController(
        IUserRepository userRepo,
        IPermissionService permissionService,
        ILexboxAuthService lexboxAuthService) : Controller
    {
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IPermissionService _permissionService = permissionService;
        private readonly ILexboxAuthService _lexboxAuthService = lexboxAuthService;

        private const string otelTagName = "otel.AuthController";

        /// <summary> Gets authentication status for the current request. </summary>
        [AllowAnonymous]
        [HttpGet("status", Name = "GetAuthStatus")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthStatus))]
        public async Task<IActionResult> GetAuthStatus()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting auth status");

            if (!_permissionService.IsCurrentUserAuthenticated(HttpContext))
            {
                return Ok(AuthStatus.LoggedOut());
            }

            var userId = _permissionService.GetUserId(HttpContext);
            var user = await _userRepo.GetUser(userId);
            return user is null ? Ok(AuthStatus.LoggedOut()) : Ok(AuthStatus.LoggedInUser(user));
        }

        /// <summary> Generates a Lexbox login URL for OIDC sign-in. </summary>
        [AllowAnonymous]
        [HttpGet("lexbox/login-url", Name = "GetLexboxLoginUrl")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LexboxLoginUrl))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public IActionResult GetLexboxLoginUrl()
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting lexbox login url");

            try
            {
                var result = _lexboxAuthService.CreateLoginUrl(Request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Problem(ex.Message, statusCode: StatusCodes.Status500InternalServerError);
            }
        }
    }
}
