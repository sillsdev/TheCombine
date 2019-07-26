using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1")]
    public class AvatarController : Controller
    {
        private readonly IUserService _userService;
        private readonly IPermissionService _permissionService;

        public AvatarController(IUserService service, IPermissionService permissionService)
        {
            _userService = service;
            _permissionService = permissionService;
        }

        // POST: v1/users/{userId}/upload/avatar
        // Implements UploadAvatar()
        [HttpPost("users/{userId}/upload/avatar")]
        public async Task<IActionResult> UploadAvatar(string userId, [FromForm] FileUpload model)
        {
            if (!_permissionService.IsAuthenticated("1", HttpContext))
            {
                return new UnauthorizedResult();
            }

            var file = model.File;

            //ensure file is not empty
            if (file.Length > 0)
            {
                //get user to apply avatar to
                User gotUser = await _userService.GetUser(userId);

                if (gotUser != null)
                {
                    //get path to home
                    Utilities util = new Utilities();
                    model.FilePath = util.GenerateFilePath(Utilities.filetype.avatar, false, userId, "Avatars");

                    //copy stream to filepath
                    using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                    {
                        await file.CopyToAsync(fs);
                    }

                    gotUser.Avatar = model.FilePath;
                    var result = await _userService.Update(userId, gotUser);
                    if (result == ResultOfUpdate.Updated)
                    {
                        return new OkObjectResult(userId);
                    }
                    else
                    {
                        return new StatusCodeResult(304);
                    }
                }
                else
                {
                    return new NotFoundObjectResult(gotUser.Id);
                }
            }
            else
            {
                return new BadRequestObjectResult("Empty File");
            }
        }
    }
}
