﻿using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;

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
            User currentUser = await _userService.GetUser(userId);

            if (currentUser == null)
            {
                return new NotFoundObjectResult(currentUser.Id);
            }

            var image = System.IO.File.OpenRead(currentUser.Avatar);
            return File(image, "image/jpeg");
        }



        /// <summary> Adds an avatar image to a <see cref="User"/> and saves locally to ~/.CombineFiles/{ProjectId}/Avatars </summary>
        /// <remarks> POST: v1/users/{userId}/upload/avatar </remarks>
        /// <returns> Path to local avatar file </returns>
        [HttpPost("{userId}/upload/avatar")]
        public async Task<IActionResult> UploadAvatar(string userId, [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.IsUserIdAuthenticated(HttpContext, userId))
            {
                return new UnauthorizedResult();
            }

            var file = fileUpload.File;

            //ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            //get user to apply avatar to
            User gotUser = await _userService.GetUser(userId);
            if (gotUser == null)
            {
                return new NotFoundObjectResult(gotUser.Id);
            }

            //get path to home
            Utilities util = new Utilities();
            fileUpload.FilePath = util.GenerateFilePath(Utilities.Filetype.avatar, false, userId, "Avatars");

            //copy file data to a new local file
            using (var fs = new FileStream(fileUpload.FilePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            //update the user's avatar file
            gotUser.Avatar = fileUpload.FilePath;
            var result = await _userService.Update(userId, gotUser);

            if (result == ResultOfUpdate.Updated)
            {
                return new OkObjectResult(fileUpload.FilePath);
            }
            else //there was no change
            {
                return new StatusCodeResult(304);
            }
        }
    }
}
