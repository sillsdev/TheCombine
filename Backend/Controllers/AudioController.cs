using System.IO;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/words/{wordId}/audio")]
    public class AudioController(
        IWordRepository wordRepo, IWordService wordService, IPermissionService permissionService) : Controller
    {
        private readonly IWordRepository _wordRepo = wordRepo;
        private readonly IPermissionService _permissionService = permissionService;
        private readonly IWordService _wordService = wordService;

        private const string otelTagName = "otel.AudioController";

        /// <summary> Gets the audio file in the form of a stream from disk. </summary>
        /// <returns> Audio file stream. </returns>
        [AllowAnonymous]
        [HttpGet("download/{fileName}", Name = "DownloadAudioFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public IActionResult DownloadAudioFile(string projectId, string fileName)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "downloading an audio file");

            // Sanitize user input
            try
            {
                fileName = Sanitization.SanitizeFileName(fileName);
                projectId = Sanitization.SanitizeId(projectId);
            }
            catch
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
        /// Adds a pronunciation <see cref="FormFile"/> to a specified project word
        /// and saves locally to ~/.CombineFiles/{ProjectId}/Import/ExtractedLocation/Lift/audio
        /// </summary>
        /// <returns> Id of updated word </returns>
        [HttpPost("upload", Name = "UploadAudioFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public async Task<IActionResult> UploadAudioFile(string projectId, string wordId, IFormFile? file)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "uploading an audio file");

            return await UploadAudioFile(projectId, wordId, "", file);
        }


        /// <summary>
        /// Adds a pronunciation <see cref="FormFile"/> with a specified speaker to a project word
        /// and saves locally to ~/.CombineFiles/{ProjectId}/Import/ExtractedLocation/Lift/audio
        /// </summary>
        /// <returns> Id of updated word </returns>
        [HttpPost("upload/{speakerId}", Name = "UploadAudioFileWithSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public async Task<IActionResult> UploadAudioFile(
            string projectId, string wordId, string speakerId, IFormFile? file)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "uploading an audio file with speaker");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }
            var userId = _permissionService.GetUserId(HttpContext);

            // sanitize user input
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
                wordId = Sanitization.SanitizeId(wordId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            if (file is null)
            {
                return BadRequest("Null File");
            }

            // Ensure file is not empty
            if (file.Length == 0)
            {
                return BadRequest("Empty File");
            }

            var word = await _wordRepo.GetFrontier(projectId, wordId);
            if (word is null)
            {
                return NotFound($"wordId: {wordId}");
            }

            // This path should be unique even though it is only based on the Word ID because currently, a new
            // Word is created each time an audio file is uploaded.
            var filePath = FileStorage.GenerateAudioFilePathForWord(projectId, wordId);

            // Copy the file data to a new local file
            await using (var fs = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fs);
            }

            // Add the relative path to the audio field
            var audio = new Pronunciation(Path.GetFileName(filePath), speakerId);
            word.Audio.Add(audio);

            // Update the word with new audio file
            string? updatedId = (await _wordService.Update(userId, word))?.Id;

            return updatedId is null ? NotFound($"wordId: {wordId}") : Ok(updatedId);
        }

        /// <summary> Deletes audio in <see cref="Word"/> with specified ID </summary>
        [HttpDelete("delete/{fileName}", Name = "DeleteAudioFile")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public async Task<IActionResult> DeleteAudioFile(string projectId, string wordId, string fileName)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting an audio file");

            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }
            var userId = _permissionService.GetUserId(HttpContext);

            // sanitize user input
            try
            {
                fileName = Sanitization.SanitizeFileName(fileName);
                projectId = Sanitization.SanitizeId(projectId);
                wordId = Sanitization.SanitizeId(wordId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            string? newId = await _wordService.DeleteAudio(projectId, userId, wordId, fileName);
            return newId is null ? NotFound($"wordId: {wordId}; fileName: {fileName}") : Ok(newId);
        }
    }
}
