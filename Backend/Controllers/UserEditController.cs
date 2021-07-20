using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/useredits")]
    [EnableCors("AllowAll")]
    public class UserEditController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IUserRepository _userRepo;
        private readonly IUserEditRepository _userEditRepo;
        private readonly IPermissionService _permissionService;
        private readonly IUserEditService _userEditService;

        public UserEditController(IUserEditRepository userEditRepo, IUserEditService userEditService,
            IProjectRepository projRepo, IPermissionService permissionService, IUserRepository userRepo)
        {
            _projRepo = projRepo;
            _userRepo = userRepo;
            _userEditRepo = userEditRepo;
            _permissionService = permissionService;
            _userEditService = userEditService;
        }

        /// <summary> Returns all <see cref="UserEdit"/>s for specified <see cref="Project"/> </summary>
        /// <returns> UserEdit List </returns>
        [HttpGet(Name = "GetProjectUserEdits")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserEdit>))]
        public async Task<IActionResult> GetProjectUserEdits(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            return Ok(await _userEditRepo.GetAllUserEdits(projectId));
        }

        /// <summary> Returns <see cref="UserEdit"/>s with specified id </summary>
        /// <returns> UserEdit </returns>
        [HttpGet("{userEditId}", Name = "GetUserEdit")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserEdit))]
        public async Task<IActionResult> GetUserEdit(string projectId, string userEditId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            var userEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (userEdit is null)
            {
                return NotFound(userEditId);
            }
            return Ok(userEdit);
        }

        /// <summary> Creates a <see cref="UserEdit"/> </summary>
        /// <returns> UpdatedUser </returns>
        [HttpPost(Name = "CreateUserEdit")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        public async Task<IActionResult> CreateUserEdit(string projectId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return Forbid();
            }

            // Generate the new userEdit
            var userEdit = new UserEdit { ProjectId = projectId };
            await _userEditRepo.Create(userEdit);
            // Update current user
            var currentUserId = _permissionService.GetUserId(HttpContext);
            var currentUser = await _userRepo.GetUser(currentUserId);
            if (currentUser is null)
            {
                return NotFound(currentUserId);
            }

            currentUser.WorkedProjects.Add(projectId, userEdit.Id);
            await _userRepo.Update(currentUserId, currentUser);

            // Generate the JWT based on the new userEdit
            var currentUpdatedUser = await _permissionService.MakeJwt(currentUser);
            if (currentUpdatedUser is null)
            {
                return BadRequest("Invalid JWT Token supplied.");
            }

            await _userRepo.Update(currentUserId, currentUpdatedUser);

            return Ok(currentUpdatedUser);
        }

        /// <summary> Adds/updates a goal to/in a specified <see cref="UserEdit"/> </summary>
        /// <returns> Index of added/updated edit </returns>
        [HttpPost("{userEditId}", Name = "UpdateUserEditGoal")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        public async Task<IActionResult> UpdateUserEditGoal(
            string projectId, string userEditId, [FromBody, BindRequired] Edit newEdit)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Check to see if user is changing the correct user edit
            if (await _permissionService.IsViolationEdit(HttpContext, userEditId, projectId))
            {
                return BadRequest("You cannot edit another user's UserEdit.");
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            // Ensure userEdit exists
            var toBeMod = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (toBeMod is null)
            {
                return NotFound(userEditId);
            }

            var (isSuccess, editIndex) = await _userEditService.AddGoalToUserEdit(projectId, userEditId, newEdit);

            // If the replacement was successful
            if (isSuccess)
            {
                return Ok(editIndex);
            }

            return NotFound(editIndex.ToString());
        }

        /// <summary> Adds/updates a step to/in specified goal </summary>
        /// <returns> Index of added/modified step in specified goal </returns>
        [HttpPut("{userEditId}", Name = "UpdateUserEditStep")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        public async Task<IActionResult> UpdateUserEditStep(string projectId, string userEditId,
            [FromBody, BindRequired] UserEditStepWrapper stepEdit)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // Check to see if user is changing the correct user edit
            if (await _permissionService.IsViolationEdit(HttpContext, userEditId, projectId))
            {
                return BadRequest("You cannot edit another user's UserEdit.");
            }

            // Ensure project exists.
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            // Ensure userEdit exists.
            var document = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (document is null)
            {
                return NotFound(projectId);
            }

            // Ensure indices exist.
            if (stepEdit.GoalIndex < 0 || stepEdit.GoalIndex >= document.Edits.Count)
            {
                return BadRequest("Goal index out of range.");
            }
            var maxStepIndex = document.Edits[stepEdit.GoalIndex].StepData.Count;
            var stepIndex = stepEdit.StepIndex ?? maxStepIndex;
            if (stepIndex < 0 || stepIndex > maxStepIndex)
            {
                return BadRequest("Step index out of range.");
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

            return Ok(stepIndex);
        }

        /// <summary> Deletes <see cref="UserEdit"/> with specified id </summary>
        [HttpDelete("{userEditId}", Name = "DeleteUserEdit")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteUserEdit(string projectId, string userEditId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.Owner))
            {
                return Forbid();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return NotFound(projectId);
            }

            if (await _userEditRepo.Delete(projectId, userEditId))
            {
                return Ok();
            }
            return NotFound(userEditId);
        }
    }
}
