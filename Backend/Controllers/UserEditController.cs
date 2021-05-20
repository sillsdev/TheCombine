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
        /// <remarks> GET: v1/projects/{projectId}/useredits </remarks>
        /// <returns> UserEdit List </returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<UserEdit>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Get(string projectId)
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
        /// <remarks> GET: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> UserEdit </returns>
        [HttpGet("{userEditId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserEdit))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Get(string projectId, string userEditId)
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
        /// <remarks> POST: v1/projects/{projectId}/useredits </remarks>
        /// <returns> UpdatedUser </returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(User))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Post(string projectId)
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
        /// <remarks> POST: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> Index of added/updated edit </returns>
        [HttpPost("{userEditId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Post(
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
        /// <remarks> PUT: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        /// <returns> Index of added/modified step in specified goal </returns>
        [HttpPut("{userEditId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(int))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Put(string projectId, string userEditId,
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
        /// <remarks> DELETE: v1/projects/{projectId}/useredits/{userEditId} </remarks>
        [HttpDelete("{userEditId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        public async Task<IActionResult> Delete(string projectId, string userEditId)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.DatabaseAdmin))
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
