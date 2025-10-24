using System.Collections.Generic;
using IO = System.IO;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace BackendFramework.Controllers
{
    [Authorize]
    [Produces("application/json")]
    [Route("v1/projects/{projectId}/speakers")]
    public class SpeakerController : Controller
    {
        private readonly ISpeakerRepository _speakerRepo;
        private readonly IPermissionService _permissionService;

        private const string otelTagName = "otel.SpeakerController";

        public SpeakerController(ISpeakerRepository speakerRepo, IPermissionService permissionService)
        {
            _speakerRepo = speakerRepo;
            _permissionService = permissionService;
        }

        /// <summary> Gets all <see cref="Speaker"/>s for specified projectId </summary>
        /// <returns> List of Speakers </returns>
        [HttpGet(Name = "GetProjectSpeakers")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<Speaker>))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetProjectSpeakers(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting project speakers");

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
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteProjectSpeakers(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting project speakers");

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
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSpeaker(string projectId, string speakerId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a speaker");

            // Check permissions
            if (!await _permissionService.HasProjectPermission(HttpContext, Permission.WordEntry, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            var speaker = await _speakerRepo.GetSpeaker(projectId, speakerId);
            if (speaker is null)
            {
                return NotFound();
            }

            // Return speaker
            return Ok(speaker);
        }

        /// <summary> Checks if given speaker name is valid for the project with given id. </summary>
        /// <returns> null if valid; a BadRequestObjectResult if invalid. </returns>
        private async Task<IActionResult?> CheckSpeakerName(string projectId, string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("projectSettings.speaker.nameEmpty");
            }
            if (await _speakerRepo.IsSpeakerNameInProject(projectId, name))
            {
                return BadRequest("projectSettings.speaker.nameTaken");
            }
            return null;
        }

        /// <summary> Creates a <see cref="Speaker"/> for the specified projectId </summary>
        /// <returns> Id of created Speaker </returns>
        [HttpPut("create", Name = "CreateSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> CreateSpeaker(string projectId, [FromBody, BindRequired] string name)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a speaker");

            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Ensure the new name is valid
            name = name.Trim();
            var nameError = await CheckSpeakerName(projectId, name);
            if (nameError is not null)
            {
                return nameError;
            }

            // Create speaker and return id
            var speaker = new Speaker { Name = name, ProjectId = projectId };
            return Ok((await _speakerRepo.Create(speaker)).Id);
        }

        /// <summary> Deletes the <see cref="Speaker"/> for the specified projectId and speakerId </summary>
        /// <returns> bool: true if success; false if failure </returns>
        [HttpDelete("{speakerId}", Name = "DeleteSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteSpeaker(string projectId, string speakerId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a speaker");

            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Ensure the speaker exists
            if (await _speakerRepo.GetSpeaker(projectId, speakerId) is null)
            {
                return NotFound();
            }

            // Delete consent file
            var path = FileStorage.GetConsentFilePath(speakerId);
            if (path is not null)
            {
                IO.File.Delete(path);
            }

            // Delete speaker and return success
            return Ok(await _speakerRepo.Delete(projectId, speakerId));
        }

        /// <summary> Removes consent of the <see cref="Speaker"/> for specified projectId and speakerId </summary>
        [HttpDelete("consent/{speakerId}", Name = "RemoveConsent")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status304NotModified)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveConsent(string projectId, string speakerId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "removing speaker consent");

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
                return NotFound();
            }

            // Delete consent file
            if (speaker.Consent is ConsentType.None)
            {
                return StatusCode(StatusCodes.Status304NotModified);
            }
            var path = FileStorage.GetConsentFilePath(speaker.Id);
            if (path is not null)
            {
                IO.File.Delete(path);
            }

            // Update speaker and return result with id
            speaker.Consent = ConsentType.None;
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(),
                ResultOfUpdate.Updated => Ok(),
                _ => StatusCode(StatusCodes.Status304NotModified)
            };
        }

        /// <summary> Updates the <see cref="Speaker"/>'s name for the specified projectId and speakerId </summary>
        [HttpPut("update/{speakerId}", Name = "UpdateSpeakerName")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status304NotModified)]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateSpeakerName(
            string projectId, string speakerId, [FromBody, BindRequired] string name)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating speaker name");

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
                return NotFound();
            }

            // Ensure the new name is valid
            name = name.Trim();
            var nameError = await CheckSpeakerName(projectId, name);
            if (nameError is not null)
            {
                return nameError;
            }

            // Update name and return result with id
            speaker.Name = name;
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(),
                ResultOfUpdate.Updated => Ok(),
                _ => StatusCode(StatusCodes.Status304NotModified)
            };
        }

        /// <summary> Saves a consent file locally and updates the specified <see cref="Speaker"/> </summary>
        /// <returns> Updated speaker </returns>
        [HttpPost("consent/{speakerId}", Name = "UploadConsent")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(Speaker))]
        [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(string))]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public async Task<IActionResult> UploadConsent(string projectId, string speakerId, IFormFile? file)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "uploading speaker consent");

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
                return NotFound();
            }

            // Ensure file is valid
            if (file is null)
            {
                return BadRequest("Null File");
            }
            if (file.Length == 0)
            {
                return BadRequest("Empty File");
            }

            var extension = IO.Path.GetExtension(file.FileName) ?? "";
            if (file.ContentType.Contains("audio"))
            {
                speaker.Consent = ConsentType.Audio;
                extension = ".webm";
            }
            else if (file.ContentType.Contains("image"))
            {
                speaker.Consent = ConsentType.Image;
            }
            else
            {
                return BadRequest("File should be audio or image");
            }

            // Delete old consent file
            var old = FileStorage.GetConsentFilePath(speaker.Id);
            if (old is not null)
            {
                IO.File.Delete(old);
            }

            // Copy file data to a new local file
            var path = FileStorage.GenerateConsentFilePath(speakerId, extension);
            await using (var fs = new IO.FileStream(path, IO.FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Update and return speaker
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(),
                _ => Ok(speaker),
            };
        }

        /// <summary> Get speaker's consent </summary>
        /// <returns> Stream of local audio/image file </returns>
        [AllowAnonymous]
        [HttpGet("consent/{speakerId}", Name = "DownloadConsent")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(FileContentResult))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status415UnsupportedMediaType)]
        public IActionResult DownloadConsent(string speakerId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "downloading speaker consent");

            try
            {
                speakerId = Sanitization.SanitizeId(speakerId);
            }
            catch
            {
                return new UnsupportedMediaTypeResult();
            }

            // Ensure file exists
            var path = FileStorage.GetConsentFilePath(speakerId);
            if (path is null)
            {
                return NotFound();
            }

            // Return file as stream
            return File(IO.File.OpenRead(path), "application/octet-stream");
        }
    }
}
