using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/useredits")]
    public class UserEditController : Controller
    {
        private readonly IUserEditRepository _repo;
        private readonly IUserEditService _userEditService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;

        public UserEditController(IUserEditRepository repo, IUserEditService userEditService, IProjectService projectService, IPermissionService permissionService)
        {
            _repo = repo;
            _userEditService = userEditService;
            _projectService = projectService;
            _permissionService = permissionService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Projects/{projectId}/UserEdits
        // Implements GetAllUserEdits()
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.GetAllUserEdits(projectId));
        }

        // DELETE v1/Projects/{projectId}/UserEdits
        // Implements DeleteAllUserEdits()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }
#if DEBUG
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.DeleteAllUserEdits(projectId));
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Projects/{projectId}/UserEdits/{userEditId}
        // Implements GetUserEdit(), Arguments: string id of target userEdit
        [HttpGet("{userEditId}")]
        public async Task<IActionResult> Get(string projectId, string userEditId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var userEdit = await _repo.GetUserEdit(projectId, userEditId);
            if (userEdit == null)
            {
                return new NotFoundObjectResult(userEditId);
            }
            return new ObjectResult(userEdit);
        }

        // POST v1/Projects/{projectId}/UserEdits
        // Implements Create()
        [HttpPost]
        public async Task<IActionResult> Post(string projectId)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            UserEdit userEdit = new UserEdit();
            userEdit.ProjectId = projectId;
            await _repo.Create(userEdit);
            return new OkObjectResult(userEdit.Id);
        }

        // POST: v1/Projects/{projectId}/UserEdits/{userEditId}
        // Implements AddGoalToUserEdit(), Arguments: new userEdit from body
        // Creates a goal
        [HttpPost("{userEditId}")]
        public async Task<IActionResult> Post(string projectId, string userEditId, [FromBody]Edit newEdit)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            UserEdit toBeMod = await _repo.GetUserEdit(projectId, userEditId);

            if (toBeMod == null)
            {
                return new NotFoundObjectResult(userEditId);
            }

            Tuple<bool, int> result = await _userEditService.AddGoalToUserEdit(projectId, userEditId, newEdit);

            if (result.Item1)
            {
                return new OkObjectResult(result.Item2);
            }
            else
            {
                return new NotFoundObjectResult(result.Item2);
            }
        }

        // PUT: v1/Projects/{projectId}/UserEdits/{userEditId}
        // Implements AddStepToGoal(), Arguments: string id of target userEdit, 
        // wrapper object to hold the goal index and the step to add to the goal history
        // Adds steps to a goal
        [HttpPut("{userEditId}")]
        public async Task<IActionResult> Put(string projectId, string userEditId, [FromBody] UserEditObjectWrapper userEdit)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var document = await _repo.GetUserEdit(projectId, userEditId);
            if (document == null)
            {
                return new NotFoundResult();
            }

            await _userEditService.AddStepToGoal(projectId, userEditId, userEdit.GoalIndex, userEdit.NewEdit);

            return new OkObjectResult(document.Edits[userEdit.GoalIndex].StepData.Count);
        }

        // DELETE: v1/Projects/{projectId}/UserEdits/{userEditId}
        // Implements Delete(), Arguments: string id of target userEdit
        [HttpDelete("{userEditId}")]
        public async Task<IActionResult> Delete(string projectId, string userEditId)
        {
            if (!_permissionService.IsAuthenticated("6", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _repo.Delete(projectId, userEditId))
            {
                return new OkResult();
            }
            return new NotFoundObjectResult(userEditId);
        }
    }
}
