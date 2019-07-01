using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
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
            string extension = Path.GetExtension(file.FileName);

            if (file.Length > 0)
            {
                User gotUser = await _userService.GetUser(userId);

                if (gotUser != null)
                {

                    string wanted_path = Path.GetDirectoryName(Path.GetDirectoryName(System.IO.Directory.GetCurrentDirectory()));
                    System.IO.Directory.CreateDirectory(wanted_path + "/Avatars");

                    model.FilePath = Path.Combine(wanted_path + "/Avatars/" + userId + extension);

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
