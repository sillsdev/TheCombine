using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using System.Diagnostics;
using BackendFramework.ValueModels;
using BackendFramework.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using BackendFramework.Interfaces;
using System.Xml;
using System.Net.Http;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Diagnostics;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

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
        public async Task<IActionResult> Get([FromBody] List<string> Ids = null)
        {
            if (Ids != null)
            {
                var projectList = await _projectService.GetProjects(Ids);
                if (projectList.Count != Ids.Count)
                {
                    return new NotFoundResult();
                }
                return new ObjectResult(projectList);
            }
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
        [HttpPost()]
        public async Task<IActionResult> Post([FromBody] Project project)
        {
            await _projectService.Create(project);
            return new OkObjectResult(project.Id);
        }

        // POST: v1/Project/
        // Implements Upload(), Arguments: new project from body
        //[HttpPost("{Id}/Upload")]
        //public async Task<HttpResponseMessage> PostFormData(string Id)
        //{
            // Check if the request contains multipart/form-data.
            //if (!Request.Content.IsMimeMultipartContent())
            //    var stream = await Request.Content.ReadAsStreamAsync();
            //{
            //    throw new httpresponseexception(httpstatuscode.unsupportedmediatype);
            //}

            //string root = HttpContext.Current.Server.MapPath("~/App_Data");
            //var provider = new MultipartFormDataStreamProvider(root);

            //try
            //{
            //    // Read the form data.
            //    await Request.Content.ReadAsMultipartAsync(provider);
            //    // This illustrates how to get the file names.
            //    foreach (MultipartFileData file in provider.FileData)
            //    {
            //        Trace.WriteLine(file.Headers.ContentDisposition.FileName);//get FileName
            //        Trace.WriteLine("Server file path: " + file.LocalFileName);//get File Path
            //    }
            //    return Request.CreateResponse(HttpStatusCode.OK, "pass upload file successed!");
            //}
            //catch (System.Exception e)
            //{
            //    return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, e);
            //}
        //}

        // public async Task<IActionResult> Post(RecieveFile fileContents, string Id)
        // {
        //     if (HttpContext.Request.Form.Files[0] != null)
        //     {
        //         var file = HttpContext.Request.Form.Files[0];
        //         using (FileStream fs = new FileStream("", FileMode.CreateNew, FileAccess.Write, FileShare.Write))
        //         {
        //             file.CopyTo(fs);
        //         }
        //     }
        //     return View();
        // }
        // public async Task<string> Post([FromForm] testClass file, string Id)
        // {
        //     long size = file.Length;
        //     string filePath = Path.GetTempFileName();

        //     // full path to file in temp location windows vs linux
        //     if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        //     {
        //         filePath = "/var/thecombine/uploads";
        //     }


        //     if (file.Length > 0)
        //     {
        //         using (var stream = new FileStream(filePath, FileMode.Create))
        //         {
        //             await file.CopyToAsync(stream);
        //         }
        //     }


        //     // process uploaded files
        //     var filenameExt = file.FileName.Substring(Math.Max(0, file.FileName.Length - 5));
        //     if (filenameExt == ".lift")
        //     {
        //         //woop
        //         if (await _projectService.Upload(file.FileName))
        //         {
        //             _projectService.Upload(file.FileName);
        //             return "yes";
        //             //return new OkObjectResult("yes");
        //         }
        //         else
        //         {
        //             return "no";
        //             //return new NotFoundResult();
        //         }
        //     }
        //     else
        //     {
        //         //womp
        //         return "nope";
        //     }
        //     //return Ok(new { count = file.Count, size, filePath; })
        // }

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
