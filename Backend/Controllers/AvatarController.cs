using System.IO;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/users/{userId}/avatar")]
    public class AvatarController : Controller
    {
        private readonly IUserRepository _userRepo;
        private readonly IPermissionService _permissionService;

        public AvatarController(IUserRepository userRepo, IPermissionService permissionService)
        {
            _userRepo = userRepo;
            _permissionService = permissionService;
        }

        /// <summary> Get user's avatar on disk </summary>
        /// <returns> Stream of local avatar file </returns>
        [HttpGet("download", Name = "DownloadAvatar")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        public async Task<IActionResult> DownloadAvatar(string userId)
        {
            // SECURITY: Omitting authentication so the frontend can use the API endpoint directly as a URL.
            // if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            // {
            //     return Forbid();
            // }

            var user = await _userRepo.GetUser(userId);
            var avatar = string.IsNullOrEmpty(user?.Avatar) ? null : user.Avatar;

            if (avatar is null)
            {
                return NotFound(userId);
            }

            var imageFile = System.IO.File.OpenRead(avatar);
            return File(imageFile, "application/octet-stream");
        }

        /// <summary>
        /// Adds an avatar image to a <see cref="User"/> and saves locally to ~/.CombineFiles/{ProjectId}/Avatars
        /// </summary>
        /// <returns> Path to local avatar file </returns>
        [HttpPost("upload", Name = "UploadAvatar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> UploadAvatar(string userId, [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.IsUserIdAuthorized(HttpContext, userId))
            {
                return Forbid();
            }

            var file = fileUpload.File;
            if (file is null)
            {
                return BadRequest("Null File");
            }

            // Ensure file is not empty.
            if (file.Length == 0)
            {
                return BadRequest("Empty File");
            }

            // Get user to apply avatar to.
            var user = await _userRepo.GetUser(userId);
            if (user is null)
            {
                return NotFound(userId);
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
            _ = await _userRepo.Update(userId, user);

            return Ok();
        }
    }
}
