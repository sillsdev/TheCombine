using System;
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
        /// <returns> UserEdit list </returns>
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.GetAllUserEdits(projectId));
        }

        /// <summary> Delete all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/useredits </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        // TODO: Remove this warning suppression when the function is implemented for release mode.
#pragma warning disable 1998
        public async Task<IActionResult> Delete(string projectId)
#pragma warning restore 1998
        {
#if DEBUG
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
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
        /// <returns> UserEdit </returns>
        [HttpGet("{userEditId}")]
        public async Task<IActionResult> Get(string projectId, string userEditId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            var userEdit = await _repo.GetUserEdit(projectId, userEditId);
            if (userEdit is null)
            {
                return new NotFoundObjectResult(userEditId);
            }
            return new ObjectResult(userEdit);
        }

        /// <summary> Creates a <see cref="UserEdit"/> </summary>
        /// <remarks> POST: v1/projects/{projectId}/useredits </remarks>
        /// <returns> UpdatedUser </returns>
        [HttpPost]
        public async Task<IActionResult> Post(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            // Generate the new userEdit
            var userEdit = new UserEdit { ProjectId = projectId };
            await _repo.Create(userEdit);
            // Update current user
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userService.GetUser(currentUserId);
            if (currentUser is null)
            {
                return new NotFoundObjectResult(currentUserId);
            }

            currentUser.WorkedProjects.Add(projectId, userEdit.Id);
            await _userService.Update(currentUserId, currentUser);

            // Generate the JWT based on the new userEdit
            var currentUpdatedUser = await _userService.MakeJwt(currentUser);
            if (currentUpdatedUser is null)
            {
                return new BadRequestObjectResult("Invalid JWT Token supplied.");
            }

            await _userService.Update(currentUserId, currentUpdatedUser);

            var output = new WithUser(currentUpdatedUser);
            return new OkObjectResult(output);
        }

        /// <summary> Adds/updates a goal to/in a specified <see cref="UserEdit"/> </summary>
        /// <remarks> POST: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> Index of added/updated edit </returns>
        [HttpPost("{userEditId}")]
        public async Task<IActionResult> Post(string projectId, string userEditId, [FromBody] Edit newEdit)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Check to see if user is changing the correct user edit
            if (await _permissionService.IsViolationEdit(HttpContext, userEditId, projectId))
            {
                return new BadRequestObjectResult("You can not edit another users UserEdit");
            }

            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Ensure userEdit exists
            var toBeMod = await _repo.GetUserEdit(projectId, userEditId);
            if (toBeMod is null)
            {
                return new NotFoundObjectResult(userEditId);
            }

            var (isSuccess, editIndex) = await _userEditService.AddGoalToUserEdit(projectId, userEditId, newEdit);

            // If the replacement was successful
            if (isSuccess)
            {
                return new OkObjectResult(editIndex);
            }

            return new NotFoundObjectResult(editIndex);
        }

        /// <summary> Adds/updates a step to/in specified goal </summary>
        /// <remarks> PUT: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> Index of added/modified step in specified goal </returns>
        [HttpPut("{userEditId}")]
        public async Task<IActionResult> Put(string projectId, string userEditId,
            [FromBody] UserEditStepWrapper stepEdit)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // Check to see if user is changing the correct user edit
            if (await _permissionService.IsViolationEdit(HttpContext, userEditId, projectId))
            {
                return new BadRequestObjectResult("You can not edit another users UserEdit");
            }

            // Ensure project exists.
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            // Ensure userEdit exists.
            var document = await _repo.GetUserEdit(projectId, userEditId);
            if (document is null)
            {
                return new NotFoundResult();
            }

            // Ensure indices exist.
            if (stepEdit.GoalIndex < 0 || stepEdit.GoalIndex >= document.Edits.Count)
            {
                return new BadRequestObjectResult("Goal index out of range.");
            }
            var maxStepIndex = document.Edits[stepEdit.GoalIndex].StepData.Count;
            var stepIndex = stepEdit.StepIndex ?? maxStepIndex;
            if (stepIndex < 0 || stepIndex > maxStepIndex)
            {
                return new BadRequestObjectResult("Step index out of range.");
            }

            // Add new step to or update step in goal.
            if (stepIndex == maxStepIndex)
            {
                await _userEditService.AddStepToGoal(
                    projectId, userEditId, stepEdit.GoalIndex, stepEdit.StepString);
            }
            else
            {
                await _userEditService.UpdateStepInGoal(
                    projectId, userEditId, stepEdit.GoalIndex, stepEdit.StepString, stepIndex);
            }

            return new OkObjectResult(stepIndex);
        }

        /// <summary> Deletes <see cref="UserEdit"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        [HttpDelete("{userEditId}")]
        public async Task<IActionResult> Delete(string projectId, string userEditId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projectService.GetProject(projectId);
            if (proj is null)
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
