using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
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
        [HttpPost(Name = "CreateSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> CreateSpeaker(string projectId, [FromBody, BindRequired] Speaker speaker)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Create speaker and return id
            speaker.ProjectId = projectId;
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

        /// <summary> Updates the <see cref="Speaker"/> for the specified projectId and speakerId </summary>
        /// <returns> Id of updated Speaker </returns>
        [HttpPut("{speakerId}", Name = "UpdateSpeaker")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
        public async Task<IActionResult> UpdateSpeaker(
            string projectId, string speakerId, [FromBody, BindRequired] Speaker speaker)
        {
            // Check permissions
            if (!await _permissionService.HasProjectPermission(
                HttpContext, Permission.DeleteEditSettingsAndUsers, projectId))
            {
                return Forbid();
            }

            // Update speaker and return result
            speaker.Id = speakerId;
            speaker.ProjectId = projectId;
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(speakerId),
                ResultOfUpdate.Updated => Ok(speakerId),
                _ => StatusCode(StatusCodes.Status304NotModified, speakerId)
            };
        }

        /// <summary> Updates the <see cref="Speaker"/>'s name for the specified projectId and speakerId </summary>
        /// <returns> Id of updated Speaker </returns>
        [HttpGet("{speakerId}/changename/{name}", Name = "UpdateSpeakerName")]
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

            // Update name and return result
            speaker.Name = name;
            return await _speakerRepo.Update(speakerId, speaker) switch
            {
                ResultOfUpdate.NotFound => NotFound(speakerId),
                ResultOfUpdate.Updated => Ok(speakerId),
                _ => StatusCode(StatusCodes.Status304NotModified, speakerId)
            };
        }
    }
}
