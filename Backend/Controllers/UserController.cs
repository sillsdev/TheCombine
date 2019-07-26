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
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public UserController(IUserService userService, IPermissionService permissionService)
        {
            _userService = userService;
            _permissionService = permissionService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/users
        // Implements GetAllUsers()
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (!_permissionService.IsAuthenticated("5", HttpContext))
            {
                return new UnauthorizedResult();
            }

            return new ObjectResult(await _userService.GetAllUsers());
        }

        // DELETE: v1/users
        // Implements DeleteAllUsers()
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

        // GET: v1/Users/authenticate
        // Implements Authenticate()
        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody]Credentials cred)
        {
            User user;
            try
            {
                user = await _userService.Authenticate(cred.Username, cred.Password);
                if (user == null)
                {
                    return new UnauthorizedResult();
                }
            }
            catch (KeyNotFoundException)
            {
                return new NotFoundResult();
            }

            return new OkObjectResult(user);
        }

        // GET: v1/Users/{userId}
        // Implements GetUser(), Arguments: string id of target user
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

        // POST: v1/Users
        // Implements Create(), Arguments: new user object from body
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]User user)
        {

            //create a new user
            var returnUser = await _userService.Create(user);

            //check if creations were valid
            if (returnUser == null)
            {
                return BadRequest();
            }
            return new OkObjectResult(user.Id);
        }

        // PUT: v1/Users/{userId}
        // Implements Update(), 
        // Arguments: string id of target user, user object with updates from body
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
            else
            {
                return new StatusCodeResult(304);
            }
        }

        // DELETE: v1/ApiWithActions/{userId}
        // Implements Delete(), Arguments: string id of target user
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
