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
    [Route("v1/projects/{projectId}/words/{wordId}/audio")]
    public class AudioController : Controller
    {
        private readonly IWordRepository _wordRepo;
        private readonly IPermissionService _permissionService;
        private readonly IWordService _wordService;

        public AudioController(IWordRepository repo, IWordService wordService, IPermissionService permissionService)
        {
            _wordRepo = repo;
            _permissionService = permissionService;
            _wordService = wordService;
        }

        /// <summary> Gets the audio file in the form of a stream from disk. </summary>
        /// <returns> Audio file stream. </returns>
        [AllowAnonymous]
        [HttpGet("download/{fileName}", Name = "DownloadAudioFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        public IActionResult DownloadAudioFile(string projectId, string wordId, string fileName)
        {
            // SECURITY: Omitting authentication so the frontend can use the API endpoint directly as a URL.
            // if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            // {
            //     return Forbid();
            // }

            // Sanitize user input
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId) ||
                !Sanitization.SanitizeFileName(fileName))
            {
                return new UnsupportedMediaTypeResult();
            }

            var filePath = FileStorage.GenerateAudioFilePath(projectId, fileName);
            if (!System.IO.File.Exists(filePath))
            {
                return BadRequest("Audio file does not exist.");
            }

            var file = System.IO.File.OpenRead(filePath);
            return File(file, "application/octet-stream");
        }

        /// <summary>
        /// Adds a pronunciation <see cref="FileUpload"/> to a <see cref="Word"/> and saves
        /// locally to ~/.CombineFiles/{ProjectId}/Import/ExtractedLocation/Lift/audio
        /// </summary>
        /// <returns> Path to local audio file </returns>
        [HttpPost("upload", Name = "UploadAudioFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UploadAudioFile(string projectId, string wordId,
            [FromForm] FileUpload fileUpload)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // sanitize user input
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId))
            {
                return new UnsupportedMediaTypeResult();
            }

            var file = fileUpload.File;
            if (file is null)
            {
                return BadRequest("Null File");
            }

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return BadRequest("Empty File");
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
                return NotFound(wordId);
            }
            word.Audio.Add(Path.GetFileName(fileUpload.FilePath));

            // Update the word with new audio file
            await _wordService.Update(projectId, wordId, word);

            return Ok(word.Id);
        }

        /// <summary> Deletes audio in <see cref="Word"/> with specified ID </summary>
        [HttpDelete("delete/{fileName}", Name = "DeleteAudioFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> DeleteAudioFile(string projectId, string wordId, string fileName)
        {
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry))
            {
                return Forbid();
            }

            // sanitize user input
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId))
            {
                return new UnsupportedMediaTypeResult();
            }

            var newWord = await _wordService.Delete(projectId, wordId, fileName);
            if (newWord is not null)
            {
                return Ok(newWord.Id);
            }
            return NotFound("The project was found, but the word audio was not deleted");
        }
    }
}
