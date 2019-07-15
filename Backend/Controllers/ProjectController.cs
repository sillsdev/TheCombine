using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    // [Authorize]
    [Produces("application/json")]
    [Route("v1/projects")]
    public class ProjectController : Controller
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Project/
        // Implements GetAllProjects(), 
        // Arguments: 
        // Default: null
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _projectService.GetAllProjects());
        }

        // DELETE v1/Project/
        // Implements DeleteAllProjects()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            return new ObjectResult(await _projectService.DeleteAllProjects());
#else
            return new UnauthorizedResult();
#endif
        }

        // GET: v1/Project/{projectId}
        // Implements GetProject(), Arguments: string id    
        [HttpGet("{projectId}")]
        public async Task<IActionResult> Get(string projectId)
        {
            var project = await _projectService.GetProject(projectId);
            if (project == null)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(project);
        }

        // POST: v1/Project/
        // Implements Create(), Arguments: new project from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Project project)
        {
            await _projectService.Create(project);
            return new OkObjectResult(project.Id);
        }

        // PUT: v1/Project/{projectId}
        // Implements Update(), Arguments: string id of target project, new project from body
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody] Project project)
        {
            if (await _projectService.Update(projectId, project))
            {
                return new OkObjectResult(project.Id);
            }
            return new NotFoundResult();
        }

        // DELETE: v1/Project/Projects/{projectId}
        // Implements Delete(), Arguments: string id of target project
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (await _projectService.Delete(projectId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }
    }
}
