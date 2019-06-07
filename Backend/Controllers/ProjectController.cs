using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Diagnostics;
using BackendFramework.ValueModels;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Microsoft.AspNetCore.Cors;
using BackendFramework.Interfaces;

namespace BackendFramework.Controllers
{
    [Produces("application/json")]
    [Route("v1/Project/")]
    public class ProjectController : Controller
    {
        private readonly IProjectService _projectService;
        public WordController(IProjectService projectService)
        {
            _projService = projectService;
        }

        [EnableCors("AllowAll")]

        // GET: v1/Project/
        // Implements GetAllProjects(), 
        // Arguments: 
        // Default: null
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (Ids != null)
            {
                var projectList = await _projectService.GetWords(Ids);
                if (projectList.Count != Ids.Count)
                {
                    return new NotFoundResult();
                }
                return new ObjectResult(projectList);
            }
            return new ObjectResult(await _projectService.GetAllWords());
        }

        // DELETE v1/Project/
        // Implements DeleteAllProjects()
        // DEBUG ONLY
        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            #if DEBUG
                return new ObjectResult(await _projectService.DeleteAllWords());
            #else
                return new UnauthorizedResult();
            #endif
        }

        // GET: v1/Project/{id}
        // Implements GetProject(), Arguments: string id    
        [HttpGet("{Id}")]
        public async Task<IActionResult> Get(string Id)
        {
            List<string> Ids = new List<string>();
            Ids.Add(Id);

            var project = await _projectService.GetProjects(Ids);
            if (project.Count == 0)
            {
                return new NotFoundResult();
            }
            return new ObjectResult(project);
        }

        // POST: v1/Project/
        // Implements Create(), Arguments: new project from body
        [HttpPost]
        public async Task<IActionResult> Post([FromBody]Project project)
        {
            await _projectService.Create(project);
            return new OkObjectResult(project.Id);
        }

        // PUT: v1/Project/{Id}
        // Implements Update(), Arguments: string id of target word, new word from body
        [HttpPut("{Id}")]
        public async Task<IActionResult> Put(string Id, [FromBody] Project project)
        {
            if (await _projectService.Update(Id, project))
            {
                return new OkObjectResult(project.Id);
            }
            return new NotFoundResult();
        }
        // DELETE: v1/Project/Words/{Id}
        // Implements Delete(), Arguments: string id of target word
        [HttpDelete("{Id}")]
        public async Task<IActionResult> Delete(string Id)
        {
            if (await _projectService.Delete(Id))
            {
                return new OkResult();
            }
            return new NotFoundResult();
        }

        // PUT: v1/Project/
        [HttpPut]
        public async Task<IActionResult> Put([FromBody] MergeWords mergeWords)
        {
        }
    }
}
