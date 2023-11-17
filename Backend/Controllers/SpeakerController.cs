using System.Collections.Generic;
using IO = System.IO;
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
    [Route("v1/projects/{projectId}/speakers")]
    public class SpeakerController : Controller
    {
        private readonly ISpeakerRepository _speakerRepo;
        private readonly IPermissionService _permissionService;

        public SpeakerController(ISpeakerRepository speakerRepo, IPermissionService permissionService)
        {
            _speakerRepo = speakerRepo;
            _permissionService = permissionService;
        }

        /// <summary> Gets all <see cref="Speaker"/>s for specified projectId </summary>
        /// <returns> List of Speakers </returns>
        [HttpGet(Name = "GetProjectSpeakers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Speaker>))]
        public async Task<IActionResult> GetProjectSpeakers(string projectId)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Return speakers
            return Ok(await _speakerRepo.GetAllSpeakers(projectId));
        }

        /// <summary> Deletes all <see cref="Speaker"/>s for specified projectId </summary>
        /// <returns> bool: true if success; false if no speakers in project </returns>
        [HttpDelete(Name = "DeleteProjectSpeakers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteProjectSpeakers(string projectId)
        {
            // Check permissions
            if (!await _permissionService.IsSiteAdmin(HttpContext))
            {
                return Forbid();
            }

            // Delete speakers and return success
            return Ok(await _speakerRepo.DeleteAllSpeakers(projectId));
        }

        /// <summary> Gets the <see cref="Speaker"/> for the specified projectId and speakerId </summary>
        /// <returns> Speaker </returns>
        [HttpGet("{speakerId}", Name = "GetSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Speaker))]
        public async Task<IActionResult> GetSpeaker(string projectId, string speakerId)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            var speaker = await _speakerRepo.GetSpeaker(projectId, speakerId);
            if (speaker is null)
            {
                return NotFound(speakerId);
            }

            // Return speaker
            return Ok(speaker);
        }

        /// <summary> Creates a <see cref="Speaker"/> for the specified projectId </summary>
        /// <returns> Id of created Speaker </returns>
        [HttpGet("/create/{name}", Name = "CreateSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CreateSpeaker(string projectId, string name)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Create speaker and return id
            var speaker = new Speaker { Name = name, ProjectId = projectId };
            return Ok((await _speakerRepo.Create(speaker)).Id);
        }

        /// <summary> Deletes the <see cref="Speaker"/> for the specified projectId and speakerId </summary>
        /// <returns> bool: true if success; false if failure </returns>
        [HttpDelete("{speakerId}", Name = "DeleteSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        public async Task<IActionResult> DeleteSpeaker(string projectId, string speakerId)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            if (await _speakerRepo.GetSpeaker(projectId, speakerId) is null)
            {
                return NotFound(speakerId);
            }

            // Delete speaker and return success
            return Ok(await _speakerRepo.Delete(projectId, speakerId));
        }

        /// <summary> Removes consent of the <see cref="Speaker"/> for specified projectId and speakerId </summary>
        /// <returns> Id of updated Speaker </returns>
        [HttpGet("removeconsent/{speakerId}", Name = "RemoveConsent")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> RemoveConsent(string projectId, string speakerId)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            var speaker = await _speakerRepo.GetSpeaker(projectId, speakerId);
            if (speaker is null)
            {
                return NotFound(speakerId);
            }

            // Delete consent file
            var filePath = speaker.Consent.FileName;
            if (string.IsNullOrEmpty(filePath))
            {
                return StatusCode(StatusCodes.Status304NotModified, speakerId);
            }
            if (speaker.Consent.FileType == ConsentType.Audio)
            {
                filePath = FileStorage.GenerateAudioFilePath(projectId, filePath);
            }
            if (IO.File.Exists(filePath))
            {
                IO.File.Delete(filePath);
            }

            // Update speaker and return result with id
            speaker.Consent = new();
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(speakerId),
                ResultOfUpdate.Updated => Ok(speakerId),
                _ => StatusCode(StatusCodes.Status304NotModified, speakerId)
            };
        }

        /// <summary> Updates the <see cref="Speaker"/>'s name for the specified projectId and speakerId </summary>
        /// <returns> Id of updated Speaker </returns>
        [HttpGet("update/{speakerId}/{name}", Name = "UpdateSpeakerName")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateSpeakerName(string projectId, string speakerId, string name)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            var speaker = await _speakerRepo.GetSpeaker(projectId, speakerId);
            if (speaker is null)
            {
                return NotFound(speakerId);
            }

            // Update name and return result with id
            speaker.Name = name;
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(speakerId),
                ResultOfUpdate.Updated => Ok(speakerId),
                _ => StatusCode(StatusCodes.Status304NotModified, speakerId)
            };
        }

        /// <summary>
        /// Adds an audio consent from <see cref="FileUpload"/>
        /// locally to ~/.CombineFiles/{ProjectId}/Import/ExtractedLocation/Lift/audio
        /// and updates the <see cref="Consent"/> of the specified <see cref="Speaker"/>
        /// </summary>
        /// <returns> Updated speaker </returns>
        [HttpPost("uploadconsentaudio/{speakerId}", Name = "UploadConsentAudio")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Speaker))]
        public async Task<IActionResult> UploadConsentAudio(
            string projectId, string speakerId, [FromForm] FileUpload fileUpload)
        {
            // Sanitize user input
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
                speakerId = Sanitization.SanitizeId(speakerId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            // Check permissions
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            var speaker = await _speakerRepo.GetSpeaker(projectId, speakerId);
            if (speaker is null)
            {
                return NotFound(speakerId);
            }

            // Ensure file is valid
            var file = fileUpload.File;
            if (file is null)
            {
                return BadRequest("Null File");
            }
            if (file.Length == 0)
            {
                return BadRequest("Empty File");
            }

            // Copy file data to a local file with speakerId-dependent name
            var path = FileStorage.GenerateAudioFilePathForWord(projectId, speakerId);
            await using (var fs = new IO.FileStream(path, IO.FileMode.Create))
            {
                await file.CopyToAsync(fs);
            }

            // Update speaker consent and return result with speaker
            var fileName = IO.Path.GetFileName(path);
            speaker.Consent = new() { FileName = fileName, FileType = ConsentType.Audio };
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(speaker),
                _ => Ok(speaker),
            };
        }

        /// <summary>
        /// Adds an image consent from <see cref="FileUpload"/>
        /// locally to ~/.CombineFiles/{ProjectId}/Avatars
        /// and updates the <see cref="Consent"/> of the specified <see cref="Speaker"/>
        /// </summary>
        /// <returns> Updated speaker </returns>
        [HttpPost("uploadconsentimage/{speakerId}", Name = "UploadConsentImage")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Speaker))]
        public async Task<IActionResult> UploadConsentImage(
            string projectId, string speakerId, [FromForm] FileUpload fileUpload)
        {
            // Sanitize user input
            try
            {
                projectId = Sanitization.SanitizeId(projectId);
                speakerId = Sanitization.SanitizeId(speakerId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            // Check permissions
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            var speaker = await _speakerRepo.GetSpeaker(projectId, speakerId);
            if (speaker is null)
            {
                return NotFound(speakerId);
            }

            // Ensure file is not empty.
            var file = fileUpload.File;
            if (file is null)
            {
                return BadRequest("Null File");
            }
            if (file.Length == 0)
            {
                return BadRequest("Empty File");
            }

            // Copy file data to a new local file
            var path = FileStorage.GenerateAvatarFilePath(speakerId);
            await using (var fs = new IO.FileStream(path, IO.FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Update speaker consent and return result with speaker
            speaker.Consent = new() { FileName = path, FileType = ConsentType.Image };
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(speaker),
                _ => Ok(speaker),
            };
        }
    }
}
