using System.Collections.Generic;
using System.Linq;
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
    [Route("v1/projects/{projectId}/merge")]
    [EnableCors("AllowAll")]
    public class MergeController : Controller
    {
        private readonly IProjectRepository _projRepo;
        private readonly IMergeService _mergeService;
        private readonly IPermissionService _permissionService;

        public MergeController(
            IProjectRepository projRepo, IMergeService mergeService, IPermissionService permissionService)
        {
            _projRepo = projRepo;
            _mergeService = mergeService;
            _permissionService = permissionService;
        }

        /// <summary> Merge children <see cref="Word"/>s with the parent </summary>
        /// <remarks> PUT: v1/projects/{projectId}/merge </remarks>
        /// <returns> List of ids of new words </returns>
        [HttpPut]
        public async Task<IActionResult> Put(string projectId, [FromBody] List<MergeWords> mergeWordsList)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.MergeAndCharSet))
            {
                return new ForbidResult();
            }

            // Ensure project exists
            var proj = await _projRepo.GetProject(projectId);
            if (proj is null)
            {
                return new NotFoundObjectResult(projectId);
            }

            try
            {
                var newWords = await _mergeService.Merge(projectId, mergeWordsList);
                return new OkObjectResult(newWords.Select(w => w.Id).ToList());
            }
            catch
            {
                return new BadRequestResult();
            }
        }
    }
}
