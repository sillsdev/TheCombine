using System.Threading.Tasks;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users/emailverify")]
    public class EmailVerifyController(IUserRepository userRepo, IEmailVerifyService emailVerifyService,
        IPermissionService permissionService) : Controller
    {
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IEmailVerifyService _emailVerifyService = emailVerifyService;
        private readonly IPermissionService _permissionService = permissionService;

        /// <summary> Sends an email verify request </summary>
        [HttpPost("", Name = "RequestEmailVerify")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RequestEmailVerify([FromBody, BindRequired] string emailOrUsername)
        {
            var user = await _userRepo.GetUserByEmailOrUsername(emailOrUsername);
            if (user is null || !await _permissionService.CanModifyUser(HttpContext, user.Id))
            {
                return Forbid();
            }

            var result = await _emailVerifyService.RequestEmailVerify(user);
            return result ? Ok() : StatusCode(StatusCodes.Status500InternalServerError);
        }

        /// <summary> Validates email verify token in url </summary>
        [AllowAnonymous]
        [HttpGet("validate/{token}", Name = "ValidateEmailToken")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> ValidateEmailToken(string token)
        {
            return Ok(await _emailVerifyService.ValidateToken(token));
        }
    }
}
