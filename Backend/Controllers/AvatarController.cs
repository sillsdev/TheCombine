using System.IO;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

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
            var avatar = await _userService.GetUserAvatar(userId);
            if (avatar is null)
            {
                return new NotFoundObjectResult(userId);
            }

            var imageFile = System.IO.File.OpenRead(avatar);
            return File(imageFile, "application/octet-stream");
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

            var file = fileUpload.File;
            if (file is null)
            {
                return new BadRequestObjectResult("Null File");
            }

            // Ensure file is not empty.
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            // Get user to apply avatar to.
            var user = await _userService.GetUser(userId);
            if (user is null)
            {
                return new NotFoundObjectResult(userId);
            }

            // Generate path to store avatar file.
            fileUpload.FilePath = FileStorage.GenerateAvatarFilePath(userId);

            // Copy file data to a new local file.
            await using (var fs = new FileStream(fileUpload.FilePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Update the user's avatar file.
            user.Avatar = fileUpload.FilePath;
            user.HasAvatar = true;
            _ = await _userService.Update(userId, user);

            return new OkResult();
        }
    }
}
