using System.IO;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using static BackendFramework.Helper.FileUtilities;

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
        /// <returns> Audio file stream </returns>
        [AllowAnonymous]
        [HttpGet("{wordId}/download/audio/{fileName}")]
        // Temporarily disable warning about missing await in this method.
        // It's needed for the return type to be correct, but nothing inside the function is awaiting yet.
#pragma warning disable 1998
        public async Task<IActionResult> DownloadAudioFile(string projectId, string wordId, string fileName)
#pragma warning restore 1998
        {
            // if we require authorization and authentication for audio files, the frontend cannot just use the api
            // endpoint as the src
            //if (!_permissionService.IsProjectAuthorized("1", HttpContext))
            //{
            //    return new ForbidResult();
            //}

            // sanitize user input
            if ((!SanitizeId(projectId)) || (!SanitizeId(wordId)))
            {
                return new UnsupportedMediaTypeResult();
            }

            var filePath = _wordService.GetAudioFilePath(projectId, wordId, fileName);
            if (filePath == null)
            {
                return new BadRequestObjectResult("There was more than one subDir of the extracted zip");
            }

            Stream stream = System.IO.File.OpenRead(filePath);
            if (stream == null)
            {
                return new BadRequestObjectResult("The file does not exist");
            }

            return File(stream, "video/webm");
        }

        /// <summary>
        /// Adds a pronunciation <see cref="FileUpload"/> to a <see cref="Word"/> and saves locally to
        /// ~/.CombineFiles/{ProjectId}/ExtractedLocation/Import/ExtractedLocation/Lift/audio
        /// </summary>
        /// <remarks> POST: v1/projects/{projectId}/words/{wordId}/upload/audio </remarks>
        /// <returns> Path to local audio file </returns>
        [HttpPost("{wordId}/upload/audio")]
        public async Task<IActionResult> UploadAudioFile(string projectId, string wordId,
            [FromForm] FileUpload fileUpload)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // sanitize user input
            if ((!SanitizeId(projectId)) || (!SanitizeId(wordId)))
            {
                return new UnsupportedMediaTypeResult();
            }

            var file = fileUpload.File;
            var requestedFileName = fileUpload.File?.FileName;
            if (string.IsNullOrEmpty(requestedFileName))
            {
                requestedFileName = wordId + ".webm";
            }

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return new BadRequestObjectResult("Empty File");
            }

            // Get path to home
            fileUpload.FilePath = GenerateFilePath(
                FileType.Audio, false, wordId, Path.Combine(projectId, "Import", "ExtractedLocation", "Lift", "audio"));

            // Copy the file data to a new local file
            await using (var fs = new FileStream(fileUpload.FilePath, FileMode.Create))
            {
                await file.CopyToAsync(fs);
            }

            // Add the relative path to the audio field
            var gotWord = await _wordRepo.GetWord(projectId, wordId);
            gotWord.Audio.Add(Path.GetFileName(fileUpload.FilePath));

            // Update the word with new audio file
            await _wordService.Update(projectId, wordId, gotWord);

            return new ObjectResult(gotWord.Id);
        }

        /// <summary> Deletes audio in <see cref="Word"/> with specified ID </summary>
        /// <remarks> DELETE: v1/projects/{projectId}/words/{wordId}/audio/delete/{fileName} </remarks>
        [HttpDelete("{wordId}/audio/delete/{fileName}")]
        public async Task<IActionResult> Delete(string projectId, string wordId, string fileName)
        {
            if (!_permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return new ForbidResult();
            }

            // sanitize user input
            if ((!SanitizeId(projectId)) || (!SanitizeId(wordId)))
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
