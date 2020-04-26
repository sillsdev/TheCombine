using BackendFramework.Helper;
using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using BackendFramework.Models;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users")]
    [EnableCors("AllowAll")]
    public class AvatarController : Controller
    {
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public AvatarController(IUserService service, IPermissionService permissionService)
        {
            _userService = service;
            _permissionService = permissionService;
        }

        /// <summary> Returns the url of the users avatar on disk </summary>
        /// <remarks> GET: v1/users/{userId}/download/avatar </remarks>
        /// <returns> Path to local avatar file </returns>
        [HttpGet("{userId}/download/avatar")]
        public async Task<IActionResult> DownloadAvatar(string userId)
        {
            string avatar = await _userService.GetUserAvatar(userId);

            if (avatar == null)
            {
                return new NotFoundObjectResult(userId);
            }

            FileStream image = System.IO.File.OpenRead(avatar);
            return File(image, "image/jpeg");
        }

        /// <summary>
        /// Adds an avatar image to a <see cref="User"/> and saves locally to ~/.CombineFiles/{ProjectId}/Avatars
        /// </summary>
        /// <remarks> POST: v1/users/{userId}/upload/avatar </remarks>
        /// <returns> Path to local avatar file </returns>
        [HttpPost("{userId}/upload/avatar")]
        public async Task<IActionResult> UploadAvatar(string userId, [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.IsUserIdAuthorized(HttpContext, userId))
            {
                return new ForbidResult();
            }

            IFormFile file = fileUpload.File;

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            // Get user to apply avatar to
            User gotUser = await _userService.GetUser(userId);
            if (gotUser == null)
            {
                return new NotFoundObjectResult(gotUser.Id);
            }

            // Get path to home
            var util = new Utilities();
            fileUpload.FilePath = util.GenerateFilePath(
                Utilities.FileType.Avatar, false, userId, "Avatars");

            // Copy file data to a new local file
            using (var fs = new FileStream(fileUpload.FilePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Update the user's avatar file
            gotUser.Avatar = fileUpload.FilePath;
            _ = await _userService.Update(userId, gotUser);

            return new OkResult();
        }
    }
}
