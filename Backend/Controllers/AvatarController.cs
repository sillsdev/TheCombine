using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    //[Authorize]
    [Produces("application/json")]
    [Route("v1")]
    public class AvatarController : Controller
    {
        private readonly IUserService _userService;

        public AvatarController(IUserService service)
        {
            _userService = service;
        }

        [HttpPost("users/{Id}/upload/avatar")]
        public async Task<IActionResult> UploadAvatar(string userId, [FromForm] FileUpload model)
        {
            var file = model.File;

            //ensure file is not empty
            if (file.Length > 0)
            {
                //get user to apply avatar to
                User gotUser = await _userService.GetUser(userId);

                if (gotUser != null)
                {
                    //get path to desktop
                    Utilities util = new Utilities();
                    model.FilePath = util.GenerateFilePath(Utilities.filetype.avatar, false, userId);

                    //copy stream to filepath
                    using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                    {
                        await file.CopyToAsync(fs);
                    }

                    gotUser.Avatar = model.FilePath;
                    bool success = await _userService.Update(userId, gotUser);

                    return new OkObjectResult(success);
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
