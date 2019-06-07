using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.ValueModels;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Microsoft.AspNetCore.Cors;
using BackendFramework.Interfaces;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Users")]
    public class UserController : Controller
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [EnableCors("AllowAll")]

        // GET: v1/Users
        // Implements GetAllUsers(), 
        // Arguments: list of string ids of target users (if given, else returns all users),
        // Default: null
        [HttpGet]
        public async Task<IActionResult> Get([FromBody] List<string> Ids = null)
        {
            if (Ids != null)
            {
                var userList = await _userService.GetUsers(Ids);
                if (userList.Count != Ids.Count)
                {
                    return new NotFoundResult();
                }
                return new ObjectResult(userList);
            }
            return new ObjectResult(await _userService.GetAllUsers());
        }

        // DELETE: v1/users
        // Implements DeleteAllUsers()
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            return new ObjectResult(await _userService.DeleteAllUsers());
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
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]User user)
        {
            Console.WriteLine("Post: " + user);
            await _userService.Create(user);
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
            if (await _userService.Delete(Id))
            {
                return new OkResult();
            }

            return new NotFoundResult();
        }
    }

}
