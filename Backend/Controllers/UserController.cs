﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Users
        // Implements GetAllUsers()
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _userService.GetAllUsers());
        }

        // DELETE: v1/users
        // Implements DeleteAllUsers()
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
                return new ObjectResult(await _userService.DeleteAllUsers());
#else
            return new UnauthorizedResult();
#endif
        }

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

        // GET: v1/Users/name
        // Implements GetUser(), Arguments: string id of target user
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            List<string> ids = new List<string>();
            ids.Add(Id);
            var user = await _userService.GetUsers(ids);
            if (user.Count == 0)
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
            var returnuser = await _userService.Create(user);
            if (returnuser == null)
            {
                return BadRequest();
            }
            return new OkObjectResult(user.Id);
        }

        // PUT: v1/Users/{Id}
        // Implements Update(), 
        // Arguments: string id of target user, user object with updates from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] User user)
        {
            List<string> ids = new List<string>();
            ids.Add(Id);
            var document = await _userService.GetUsers(ids);
            if (document.Count == 0)
            {
                return new NotFoundResult();
            }
            user.Id = (document.First()).Id;
            await _userService.Update(Id, user);
            return new OkObjectResult(user.Id);
        }
        // DELETE: v1/ApiWithActions/{Id}
        // Implements Delete(), Arguments: string id of target user
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
#if DEBUG
                if (await _userService.Delete(Id))
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
