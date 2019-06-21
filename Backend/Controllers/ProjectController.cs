using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
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

        // GET: v1/Project/{id}
        // Implements GetProject(), Arguments: string id    
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            var project = await _projectService.GetProject(Id);
            if (project == null)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(project);
        }

        // POST: v1/Project/
        // Implements Create(), Arguments: new project from body
        [HttpPost()]
        public async Task<IActionResult> Post([FromBody] Project project)
        {
            await _projectService.Create(project);
            return new OkObjectResult(project.Id);
        }

        // PUT: v1/Project/{Id}
        // Implements Update(), Arguments: string id of target project, new project from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] Project project)
        {
            if (await _projectService.Update(Id, project))
            {
                return new OkObjectResult(project.Id);
            }
            return new NotFoundResult();
        }

        // DELETE: v1/Project/Projects/{Id}
        // Implements Delete(), Arguments: string id of target project
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (await _projectService.Delete(Id))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }
    }
}
