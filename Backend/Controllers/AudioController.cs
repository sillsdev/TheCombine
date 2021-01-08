using System.IO;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using BackendFramework.Helper;

namespace BackendFramework.Controllers
{

    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words")]
    [EnableCors("AllowAll")]

    public class AudioController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IWordService _wordService;
        private readonly IPermissionService _permissionService;

        public AudioController(IWordRepository repo, IWordService wordService, IPermissionService permissionService)
        {
            _wordRepo = repo;
            _wordService = wordService;
            _permissionService = permissionService;
        }

        /// <summary> Returns the audio file in the form of a stream from disk</summary>
        /// <remarks> GET: v1/projects/{projectId}/words/{wordId}/download/audio </remarks>
        /// <returns> Audio file stream. </returns>
        [AllowAnonymous]
        [HttpGet("{wordId}/download/audio/{fileName}")]
        public IActionResult DownloadAudioFile(string projectId, string wordId, string fileName)
        {
            // if we require authorization and authentication for audio files, the frontend cannot just use the api
            // endpoint as the src
            //if (!_permissionService.IsProjectAuthorized("1", HttpContext))
            //{
            //    return new ForbidResult();
            //}

            // Sanitize user input
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId) ||
                !Sanitization.SanitizeFileName(fileName))
            {
                return new UnsupportedMediaTypeResult();
            }

            var filePath = FileStorage.GenerateAudioFilePath(projectId, fileName);
            var file = System.IO.File.OpenRead(filePath);
            if (file is null)
            {
                return new BadRequestObjectResult("The file does not exist");
            }

            return File(file, "application/octet-stream");
        }

        /// <summary>
        /// Adds a pronunciation <see cref="FileUpload"/> to a <see cref="Word"/> and saves
        /// locally to ~/.CombineFiles/{ProjectId}/Import/ExtractedLocation/Lift/audio
        /// </summary>
        /// <remarks> POST: v1/projects/{projectId}/words/{wordId}/upload/audio </remarks>
        /// <returns> Path to local audio file </returns>
        [HttpPost("{wordId}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string projectId, string wordId,
            [FromForm] FileUpload fileUpload)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // sanitize user input
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId))
            {
                return new UnsupportedMediaTypeResult();
            }

            var file = fileUpload.File;
            if (file is null)
            {
                return new BadRequestObjectResult("Null File");
            }

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            // This path should be unique even though it is only based on the Word ID because currently, a new
            // Word is created each time an audio file is uploaded.
            fileUpload.FilePath = FileStorage.GenerateAudioFilePathForWord(projectId, wordId);

            // Copy the file data to a new local file
            await using (var fs = new FileStream(fileUpload.FilePath, FileMode.Create))
            {
                await file.CopyToAsync(fs);
            }

            // Add the relative path to the audio field
            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word is null)
            {
                return new NotFoundObjectResult(wordId);
            }
            word.Audio.Add(Path.GetFileName(fileUpload.FilePath));

            // Update the word with new audio file
            await _wordService.Update(projectId, wordId, word);

            return new ObjectResult(word.Id);
        }

        /// <summary> Deletes audio in <see cref="Word"/> with specified ID </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/{wordId}/audio/delete/{fileName} </remarks>
        [HttpDelete("{wordId}/audio/delete/{fileName}")]
        public async Task<IActionResult> Delete(string projectId, string wordId, string fileName)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // sanitize user input
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId))
            {
                return new UnsupportedMediaTypeResult();
            }

            var newWord = await _wordService.Delete(projectId, wordId, fileName);
            if (newWord != null)
            {
                return new OkObjectResult(newWord.Id);
            }
            return new NotFoundObjectResult("The project was found, but the word audio was not deleted");
        }
    }
}
