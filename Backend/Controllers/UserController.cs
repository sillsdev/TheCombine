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

        public async Task<string> Message()
        {
            return "this is the user database mainpage";
        }

        // GET: v1/Users
        [EnableCors("AllowAll")]
        [HttpGet]
        public async Task<IActionResult> Get()
        {
                return new ObjectResult(await _userService.GetAllUsers());
        }
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
           // if( isTrue == true)
           // {
                return new ObjectResult(await _userService.DeleteAllUsers());
           // }
           // return new ObjectResult(isTrue);
           
        }
        // GET: v1/Users/name
        [HttpGet("{Id}", Name = "UserGet")]
        public async Task<IActionResult> Get(string Id)
        {
            var user = await _userService.GetUser(Id);
            if (user == null)
                return new NotFoundResult();
            return new ObjectResult(user);
        }

        // POST: v1/Users
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]User user) //tskes the user content from the http req body not from the path or 
        {
            Console.WriteLine("Post: " + user);
            await _userService.Create(user);
            return new OkObjectResult(user.Id);
        }

        // PUT: v1/Users/5
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] User user)   //also I dont think we need this
        {
            var document = await _userService.GetUser(Id);
            if (document.Count == 0)
                return new NotFoundResult();
            user.Id = document[0].Id;               //this is sloppy and it should be fixed
            await _userService.Update(Id,user);
            return new OkObjectResult(user.Id);
        }
        // DELETE: v1/ApiWithActions/5
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
