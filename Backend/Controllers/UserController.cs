using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    //[Authorize]
    [Produces("application/json")]
    [Route("v1/users")]
    [EnableCors("AllowAll")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public UserController(IUserService userService, IPermissionService permissionService)
        {
            _userService = userService;
            _permissionService = permissionService;
        }

        /// <summary> Returns all <see cref="User"/>s </summary>
        /// <remarks> GET: v1/users </remarks>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            return new ObjectResult(await _userService.GetAllUsers());
        }

        /// <summary> Deletes all <see cref="User"/>s </summary>
        /// <remarks> DELETE: v1/users </remarks>
        /// <returns> true: if success, false: if there were no users </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

#if DEBUG
            return new ObjectResult(await _userService.DeleteAllUsers());
#else
            return new UnauthorizedResult();
#endif
        }

        /// <summary> Logs in a <see cref="User"/> and gives a token </summary>
        /// <remarks> DELETE: v1/users/authenticate </remarks>
        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody]Credentials cred)
        {
            try
            {
                User user = await _userService.Authenticate(cred.Username, cred.Password);
                if (user == null)
                {
                    return new UnauthorizedResult();
                }

                return new OkObjectResult(user);
            }
            catch (KeyNotFoundException)
            {
                return new NotFoundResult();
            }
        }

        /// <summary> Returns <see cref="User"/> with specified id </summary>
        /// <remarks> GET: v1/users/{userId} </remarks>
        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(string userId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var user = await _userService.GetUser(userId);
            if (user == null)
            {
                return new NotFoundResult();
            }

            return new ObjectResult(user);
        }

        /// <summary> Creates a <see cref="User"/> </summary>
        /// <remarks> POST: v1/users </remarks>
        /// <returns> Id of created user </returns>
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]User user)
        {
            var returnUser = await _userService.Create(user);
            if (returnUser == null)
            {
                return BadRequest();
            }

            return new OkObjectResult(user.Id);
        }

        /// <summary> Updates <see cref="User"/> with specified id </summary>
        /// <remarks> PUT: v1/users/{userId} </remarks>
        /// <returns> Id of updated user </returns>
        [HttpPut("{userId}")]
        public async Task<IActionResult> Put(string userId, [FromBody] User user)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var result = await _userService.Update(userId, user);
            if (result == ResultOfUpdate.NotFound)
            {
                return new NotFoundObjectResult(userId);
            }
            else if (result == ResultOfUpdate.Updated)
            {
                return new OkObjectResult(userId);
            }
            else //not updated
            {
                return new StatusCodeResult(304);
            }
        }

        /// <summary> Deletes <see cref="User"/> with specified id </summary>
        /// <remarks> DELETE: v1/users/{userId} </remarks>
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

#if DEBUG
            if (await _userService.Delete(userId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
#else
            return new UnauthorizedResult();
#endif
        }
    }
}
