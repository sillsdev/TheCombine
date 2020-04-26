using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Controllers
{
    [Authorize]
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
        /// <remarks> GET: v1/users/projects/{projectId}/allusers </remarks>
        [HttpGet("projects/{projectId}/allusers")]
        public async Task<IActionResult> GetAllUsers()
        {
            if (!_permissionService.IsProjectAuthorized("5", HttpContext))
            {
                return new ForbidResult();
            }

            return new ObjectResult(await _userService.GetAllUsers());
        }

        /// <summary> Deletes all <see cref="User"/>s </summary>
        /// <remarks> DELETE: v1/users </remarks>
        /// <returns> true: if success, false: if there were no users </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            if (!_permissionService.IsProjectAuthorized("6", HttpContext))
            {
                return new ForbidResult();
            }

            return new ObjectResult(await _userService.DeleteAllUsers());
#else
            return new NotFoundResult();
#endif
        }

        /// <summary> Logs in a <see cref="User"/> and gives a token </summary>
        /// <remarks> POST: v1/users/authenticate </remarks>
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
            if (!_permissionService.IsUserIdAuthorized(HttpContext, userId))
            {
                return new ForbidResult();
            }

            User user = await _userService.GetUser(userId);
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

        /// <summary> Checks whether a username is taken </summary>
        /// <remarks> POST: v1/users/checkusername/ </remarks>
        /// <returns> Bool </returns>
        [AllowAnonymous]
        [HttpPost("checkusername/{username}")]
        public async Task<IActionResult> CheckUsername(string username)
        {
            bool usernameTaken = (await _userService.GetAllUsers()).Find(x => x.Username == username) != null;

            if (usernameTaken)
            {
                return BadRequest();
            }
            else
            {
                return new OkResult();
            }
        }

        /// <summary> Checks whether a email is taken </summary>
        /// <remarks> POST: v1/users/checkemail/ </remarks>
        /// <returns> Bool </returns>
        [AllowAnonymous]
        [HttpPost("checkemail/{email}")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            bool emailTaken = (await _userService.GetAllUsers()).Find(x => x.Email == email) != null;

            if (emailTaken)
            {
                return BadRequest();
            }
            else
            {
                return new OkResult();
            }
        }

        /// <summary> Updates <see cref="User"/> with specified id </summary>
        /// <remarks> PUT: v1/users/{userId} </remarks>
        /// <returns> Id of updated user </returns>
        [HttpPut("{userId}")]
        public async Task<IActionResult> Put(string userId, [FromBody] User user)
        {
            // The model seems to have flaws, and this prevents an admin from editing a user's user edits
            // One solution is to change the updating user roles so that the backend updates a user's
            // worked projects when it updates their user roles
            //
            // For the record, commenting this out was Mark's idea, not Micah's
            //
            // if (!_permissionService.IsUserIdAuthenticated(HttpContext, userId))
            // {
            //     return new ForbidResult();
            // }

            ResultOfUpdate result = await _userService.Update(userId, user);
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
#if DEBUG
            if (!_permissionService.IsProjectAuthorized("6", HttpContext))
            {
                return new ForbidResult();
            }

            if (await _userService.Delete(userId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
#else
            return new NotFoundResult();
#endif
        }
    }
}
