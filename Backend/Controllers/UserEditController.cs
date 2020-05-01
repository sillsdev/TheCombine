using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/useredits")]
    [EnableCors("AllowAll")]
    public class UserEditController : Controller
    {
        private readonly IUserEditRepository _repo;
        private readonly IUserEditService _userEditService;
        private readonly IProjectService _projectService;
        private readonly IPermissionService _permissionService;
        private readonly IUserService _userService;

        public UserEditController(IUserEditRepository repo, IUserEditService userEditService,
            IProjectService projectService, IPermissionService permissionService, IUserService userService)
        {
            _repo = repo;
            _userService = userService;
            _projectService = projectService;
            _userEditService = userEditService;
            _permissionService = permissionService;
        }

        /// <summary> Returns all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <remarks> GET: v1/projects/{projectId}/useredits </remarks>
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!_permissionService.IsProjectAuthorized("1", HttpContext))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.GetAllUserEdits(projectId));
        }

        /// <summary> Delete all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/useredits </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
#if DEBUG
            if (!_permissionService.IsProjectAuthorized("6", HttpContext))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.DeleteAllUserEdits(projectId));
#else
           return new NotFoundResult();
#endif
        }

        /// <summary> Returns <see cref="UserEdit"/>s with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        [HttpGet("{userEditId}")]
        public async Task<IActionResult> Get(string projectId, string userEditId)
        {
            if (!_permissionService.IsProjectAuthorized("1", HttpContext))
            {
                return new ForbidResult();
            }

            // Ensure project exists
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

        /// <summary> Creates a <see cref="UserEdit"/> </summary>
        /// <remarks> POST: v1/projects/{projectId}/useredits </remarks>
        /// <returns> Id of create UserEdit </returns>
        [HttpPost]
        public async Task<IActionResult> Post(string projectId)
        {
            if (!_permissionService.IsProjectAuthorized("3", HttpContext))
            {
                return new ForbidResult();
            }

            var userEdit = new UserEdit {ProjectId = projectId};
            await _repo.Create(userEdit);
            return new OkObjectResult(userEdit.Id);
        }

        /// <summary> Adds a goal to <see cref="UserEdit"/> with specified id </summary>
        /// <remarks> POST: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> Index of newest edit </returns>
        [HttpPost("{userEditId}")]
        public async Task<IActionResult> Post(string projectId, string userEditId, [FromBody]Edit newEdit)
        {
            if (!_permissionService.IsProjectAuthorized("1", HttpContext))
            {
                return new ForbidResult();
            }

            // Check to see if user is changing the correct user edit
            if (_permissionService.IsViolationEdit(HttpContext, userEditId, projectId))
            {
                return new BadRequestObjectResult("You can not edit another users UserEdit");
            }

            // Ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Ensure userEdit exists
            var toBeMod = await _repo.GetUserEdit(projectId, userEditId);
            if (toBeMod == null)
            {
                return new NotFoundObjectResult(userEditId);
            }

            var result = await _userEditService.AddGoalToUserEdit(projectId, userEditId, newEdit);

            // If the replacement was successful
            if (result.Item1)
            {
                return new OkObjectResult(result.Item2);
            }
            else
            {
                return new NotFoundObjectResult(result.Item2);
            }
        }

        /// <summary> Adds a step to specified goal </summary>
        /// <remarks> PUT: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> Index of newest edit </returns>
        [HttpPut("{userEditId}")]
        public async Task<IActionResult> Put(string projectId, string userEditId,
            [FromBody] UserEditObjectWrapper userEdit)
        {
            if (!_permissionService.IsProjectAuthorized("1", HttpContext))
            {
                return new ForbidResult();
            }

            // Check to see if user is changing the correct user edit
            if (_permissionService.IsViolationEdit(HttpContext, userEditId, projectId))
            {
                return new BadRequestObjectResult("You can not edit another users UserEdit");
            }

            // Ensure project exists
            var proj = _projectService.GetProject(projectId);
            if (proj == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Ensure userEdit exists
            var document = await _repo.GetUserEdit(projectId, userEditId);
            if (document == null)
            {
                return new NotFoundResult();
            }

            // Ensure index exists
            if (userEdit.GoalIndex >= document.Edits.Count)
            {
                return new BadRequestObjectResult("Goal index out of range");
            }

            await _userEditService.AddStepToGoal(projectId, userEditId, userEdit.GoalIndex, userEdit.NewEdit);

            return new OkObjectResult(document.Edits[userEdit.GoalIndex].StepData.Count - 1);
        }

        /// <summary> Deletes <see cref="UserEdit"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        [HttpDelete("{userEditId}")]
        public async Task<IActionResult> Delete(string projectId, string userEditId)
        {
            if (!_permissionService.IsProjectAuthorized("6", HttpContext))
            {
                return new ForbidResult();
            }

            // Ensure project exists
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
