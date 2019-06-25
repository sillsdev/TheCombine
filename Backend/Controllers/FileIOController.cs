using BackendFramework.Interfaces;
using BackendFramework.ValueModels;
using Microsoft.AspNetCore.Mvc;
using SIL.Lift.Parsing;
using System;
using System.IO;
using System.Threading.Tasks;

namespace BackendFramework.Controllers
{
    //[Authorize]
    [Produces("application/json")]
    [Route("v1")]
    public class FileIOController : Controller
    {
        public readonly ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> _merger;
        public readonly IWordService _wordService;
        private readonly IUserService _userService;
        public readonly IWordRepository _wordRepo;

        public FileIOController(ILexiconMerger<LiftObject, LiftEntry, LiftSense, LiftExample> merger, IWordRepository repo, IWordService wordService, IUserService userService)
        {
            _merger = merger;
            _wordRepo = repo;
            _userService = userService;
            _wordService = wordService;
        }

        // POST: v1/Project/Words/upload
        // Implements: Upload(), Arguments: FileUpload model
        [HttpPost("projects/words/upload")]
        public async Task<IActionResult> UploadLiftFile([FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                string wanted_path = Path.GetDirectoryName(Path.GetDirectoryName(System.IO.Directory.GetCurrentDirectory()));
                System.IO.Directory.CreateDirectory(wanted_path + "/Words");

                model.FilePath = Path.Combine(wanted_path + "/Words/UploadFile-" + model.Name + ".xml");
                using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                {
                    await file.CopyToAsync(fs);
                }
            }
            try
            {
                var parser = new LiftParser<LiftObject, LiftEntry, LiftSense, LiftExample>(_merger);
                return new ObjectResult(parser.ReadLiftFile(model.FilePath));
            }
            catch (Exception)
            {
                return new UnsupportedMediaTypeResult();
            }
        }

        [HttpPost("users/{Id}/upload/avatar")]
        public async Task<IActionResult> UploadAvatar(string userId, [FromForm] FileUpload model)
        {
            var file = model.File;
            string extention = Path.GetExtension(file.FileName);

            if (file.Length > 0)
            {
                User gotUser = await _userService.GetUser(userId);

                string wanted_path = Path.GetDirectoryName(Path.GetDirectoryName(System.IO.Directory.GetCurrentDirectory()));
                System.IO.Directory.CreateDirectory(wanted_path + "/Avatars");

                model.FilePath = Path.Combine(wanted_path + "/Avatars/" + userId + extention);

                using (var fs = new FileStream(model.FilePath, FileMode.OpenOrCreate))
                {
                    await file.CopyToAsync(fs);
                }


                if (gotUser != null)
                {
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
                return new UnsupportedMediaTypeResult();
            }
        }

        [HttpPost("projects/words/{Id}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string wordId, [FromForm] FileUpload model)
        {
            var file = model.File;

            if (file.Length > 0)
            {
                string wanted_path = Path.GetDirectoryName(Path.GetDirectoryName(System.IO.Directory.GetCurrentDirectory()));
                System.IO.Directory.CreateDirectory(wanted_path + "/Audio");

                model.FilePath = Path.Combine(wanted_path + "/Audio/" + wordId + ".mp3");
                using (var fs = new FileStream(model.FilePath, FileMode.Create))
                {
                    await file.CopyToAsync(fs);
                }
                //add the relative path to the audio field of 
                Word gotWord = await _wordRepo.GetWord(wordId);
                gotWord.Audio = model.FilePath;
                //update the entry
                _ = await _wordService.Update(wordId, gotWord);

                return new ObjectResult(model.FilePath);
            }
            return new UnsupportedMediaTypeResult();
        }

        [HttpGet("project")]
        public async Task<IActionResult> ExportLiftLiftFile()
        {
            var words = await _wordRepo.GetAllWords();
            if(words.Count == 0)
            {
                return new BadRequestResult();
            }
           // int success = liftExport(words);

            return new OkObjectResult(words);
        }
    }
}
