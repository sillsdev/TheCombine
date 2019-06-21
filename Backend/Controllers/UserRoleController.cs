using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Projects/UserRoles")]
    public class UserRoleController : Controller
    {
        private readonly IUserRoleService _userRoleService;

        public UserRoleController(IUserRoleService userRoleService)
        {
            _userRoleService = userRoleService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Project/UserRoles
        // Implements GetAllUserRoles(),
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _userRoleService.GetAllUserRoles());
        }

        // DELETE v1/Project/UserRoles
        // Implements DeleteAllUserRoles()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            return new ObjectResult(await _userRoleService.DeleteAllUserRoles());
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Project/UserRoles/{Id}
        // Implements GetUserRole(), Arguments: string id of target userRole
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            List<string> Ids = new List<string>();
            Ids.Add(Id);

            var userRole = await _userRoleService.GetUserRoles(Ids);
            if (userRole.Count == 0)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(userRole);
        }

        // POST: v1/Project/UserRoles
        // Implements Create(), Arguments: new userRole from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]UserRole userRole)
        {
            userRole.Id = null;
            await _userRoleService.Create(userRole);
            return new OkObjectResult(userRole.Id);
        }

        // PUT: v1/Project/UserRoles/{Id}
        // Implements Update(), Arguments: string id of target userRole, new userRole from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] UserRole userRole)
        {
            List<string> ids = new List<string>();
            ids.Add(Id);

            var document = await _userRoleService.GetUserRoles(ids);
            if (document.Count == 0)
            {
                return new NotFoundResult();
            }

            userRole.Id = (document.First()).Id;
            await _userRoleService.Update(Id, userRole);

            return new OkObjectResult(userRole.Id);
        }

        // DELETE: v1/Project/UserRoles/{Id}
        // Implements Delete(), Arguments: string id of target userRole
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (await _userRoleService.Delete(Id))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }
    }
}
