using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects")]
    [EnableCors("AllowAll")]
    public class ProjectController : Controller
    {
        private readonly IProjectService _projectService;
        private readonly ISemDomParser _semDomParser;

        public ProjectController(IProjectService projectService, ISemDomParser semDomParser)
        {
            _projectService = projectService;
            _semDomParser = semDomParser;
        }

        /// <summary> Returns all <see cref="Project"/>s </summary>
        /// <remarks> GET: v1/projects </remarks>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            return new ObjectResult(await _projectService.GetAllProjects());
        }

        /// <summary> Deletes all <see cref="Project"/>s </summary>
        /// <remarks> DELETE: v1/projects </remarks>
        /// <returns> true: if success, false: if there were no projects </returns>
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
#if DEBUG
            return new ObjectResult(await _projectService.DeleteAllProjects());
#else
            return new UnauthorizedResult();
#endif
        }

        /// <summary> Returns <see cref="Project"/> with specified id </summary>
        /// <remarks> GET: v1/projects/{projectId} </remarks>
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

        /// <summary> Creates a <see cref="Project"/> </summary>
        /// <remarks> POST: v1/projects </remarks>
        /// <returns> Id of created project </returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Project project)
        {
            await _projectService.Create(project);
            return new OkObjectResult(project.Id);
        }

        /// <summary> Updates <see cref="Project"/> with specified id </summary>
        /// <remarks> PUT: v1/projects/{projectId} </remarks>
        /// <returns> Id of updated project </returns>
        [HttpPut("{projectId}")]
        public async Task<IActionResult> Put(string projectId, [FromBody] Project project)
        {
            var result = await _projectService.Update(projectId, project);
            if (result == ResultOfUpdate.NotFound)
            {
                return new NotFoundObjectResult(projectId);
            }
            else if (result == ResultOfUpdate.Updated)
            {
                return new OkObjectResult(projectId);
            }
            else
            {
                return new StatusCodeResult(304);
            }
        }

        /// <summary> Deletes <see cref="Project"/> with specified id </summary>
        /// <remarks> DELETE: v1/projects/{projectId} </remarks>
        [HttpDelete("{projectId}")]
        public async Task<IActionResult> Delete(string projectId)
        {
            if (await _projectService.Delete(projectId))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        /// <summary> UNUSED: Returns tree of <see cref="SemanticDomainWithSubdomains"/> for specified <see cref="Project"/> </summary>
        /// <remarks> GET: v1/projects/{projectId}/semanticdomains </remarks>
        [HttpGet("{projectId}/semanticdomains")]
        public async Task<IActionResult> GetSemDoms(string projectId)
        {
            try
            {
                var result = await _semDomParser.ParseSemanticDomains(projectId);
                return new OkObjectResult(result);
            }
            catch
            {
                return new NotFoundResult();
            }
        }
    }
}
