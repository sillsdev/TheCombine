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
        [AllowAnonymous]
        [HttpGet("download", Name = "DownloadAvatar")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DownloadAvatar(string userId)
        {
            var avatar = (await _userRepo.GetUser(userId, false))?.Avatar;
            if (string.IsNullOrEmpty(avatar))
            {
                return NotFound();
            }

            var imageFile = System.IO.File.OpenRead(avatar);
            return File(imageFile, "application/octet-stream");
        }

        /// <summary>
        /// Adds an avatar image to current <see cref="User"/> and saves locally to ~/.CombineFiles/{ProjectId}/Avatars
        /// </summary>
        /// <returns> Path to local avatar file </returns>
        [HttpPost("upload", Name = "UploadAvatar")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UploadAvatar(IFormFile? file)
        {
            if (!_permissionService.IsCurrentUserAuthorized(HttpContext))
            {
                return Forbid();
            }

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
            var userId = _permissionService.GetUserId(HttpContext);
            var user = await _userRepo.GetUser(userId, false);
            if (user is null)
            {
                return NotFound();
            }

            // Generate path to store avatar file.
            var filePath = FileStorage.GenerateAvatarFilePath(userId);

            // Copy file data to a new local file.
            await using (var fs = new FileStream(filePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Update the user's avatar file.
            user.Avatar = filePath;
            user.HasAvatar = true;
            _ = await _userRepo.Update(userId, user);

            return Ok();
        }
    }
}
