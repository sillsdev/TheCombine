using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    // [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/useredits")]
    public class UserEditController : Controller
    {
        private readonly IUserEditRepository _repo;
        private readonly IUserEditService _userEditService;
        private readonly IProjectService _projectService;

        public UserEditController(IUserEditRepository repo, IUserEditService userEditService, IProjectService projectService)
        {
            _repo = repo;
            _userEditService = userEditService;
            _projectService = projectService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Projects/UserEdits
        // Implements GetAllUserEdits()
        [HttpGet]
        public async Task<IActionResult> Get(string projectId)
        {
            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.GetAllUserEdits(projectId));
        }

        // DELETE v1/Projects/UserEdits
        // Implements DeleteAllUserEdits()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete(string projectId)
        {
#if DEBUG
            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            return new ObjectResult(await _repo.DeleteAllUserEdits(projectId));
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Projects/UserEdits/{Id}
        // Implements GetUserEdit(), Arguments: string id of target userEdit
        [HttpGet("{userEditId}")]
        public async Task<IActionResult> Get(string projectId, string userEditId)
        {
            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
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

        // POST v1/Projects/UserEdits
        // Implements Create()
        [HttpPost]
        public async Task<IActionResult> Post(string projectId)
        {
            UserEdit userEdit = new UserEdit();
            userEdit.ProjectId = projectId;
            await _repo.Create(userEdit);
            return new OkObjectResult(userEdit.Id);
        }

        // POST: v1/Projects/UserEdits/{Id}
        // Implements AddGoalToUserEdit(), Arguments: new userEdit from body
        // Creates a goal
        [HttpPost("{userEditId}")]
        public async Task<IActionResult> Post(string projectId, string userEditId, [FromBody]Edit newEdit)
        {
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

        // PUT: v1/Projects/UserEdits/{Id}
        // Implements AddStepToGoal(), Arguments: string id of target userEdit, 
        // wrapper object to hold the goal index and the step to add to the goal history
        // Adds steps to a goal
        [HttpPut("{userEditId}")]
        public async Task<IActionResult> Put(string projectId, string userEditId, [FromBody] UserEditObjectWrapper userEdit)
        {
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

        // DELETE: v1/Projects/UserEdits/{Id}
        // Implements Delete(), Arguments: string id of target userEdit
        [HttpDelete("{userEditId}")]
        public async Task<IActionResult> Delete(string projectId, string userEditId)
        {
            var isValid = _projectService.GetProject(projectId);
            if (isValid == null)
            {
                return new NotFoundObjectResult(projectId);
            }

            if (await _repo.Delete(projectId, userEditId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }
    }
}
