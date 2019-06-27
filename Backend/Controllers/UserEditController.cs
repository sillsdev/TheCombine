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
    [Route("v1/Projects/UserEdits")]
    public class UserEditController : Controller
    {
        private readonly IUserEditService _userEditService;

        public UserEditController(IUserEditService userEditService)
        {
            _userEditService = userEditService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Project/UserEdits
        // Implements GetAllUserEdits(),
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _userEditService.GetAllUserEdits());
        }

        // DELETE v1/Project/UserEdits
        // Implements DeleteAllUserEdits()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            return new ObjectResult(await _userEditService.DeleteAllUserEdits());
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Project/UserEdits/{Id}
        // Implements GetUserEdit(), Arguments: string id of target userEdit
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            var userEdit = await _userEditService.GetUserEdit(Id);
            if (userEdit == null)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(userEdit);
        }

        // POST: v1/Project/UserEdits
        // Implements Create(), Arguments: new userEdit from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]UserEdit userEdit)
        {
            userEdit.Id = null;
            await _userEditService.Create(userEdit);
            return new OkObjectResult(userEdit.Id);
        }

        // PUT: v1/Project/UserEdits/{Id}
        // Implements Update(), Arguments: string id of target userEdit, new userEdit from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] UserEdit userEdit)
        {
            var document = await _userEditService.GetUserEdit(Id);
            if (document == null)
            {
                return new NotFoundResult();
            }

            userEdit.Id = document.Id;
            await _userEditService.Update(Id, userEdit);

            return new OkObjectResult(userEdit.Id);
        }

        // DELETE: v1/Project/UserEdits/{Id}
        // Implements Delete(), Arguments: string id of target userEdit
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (await _userEditService.Delete(Id))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }
    }
}
