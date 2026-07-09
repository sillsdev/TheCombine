using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="UserEdit"/>s </summary>
    public class UserEditService : IUserEditService
    {
        private readonly IUserEditRepository _userEditRepo;

        private const string otelTagName = "otel.UserEditService";

        public UserEditService(IUserEditRepository userEditRepo)
        {
            _userEditRepo = userEditRepo;
        }

        /// <summary>
        /// Adds an <see cref="Edit"/> to a specified <see cref="UserEdit"/>,
        /// or updates existing one if edit with same <see cref="Guid"/> already present.
        /// </summary>
        /// <returns>
        /// Tuple of
        ///     bool: true if the Edit was added or updated, false if the UserEdit was not found
        ///     Guid?: guid of the added/updated Edit, or null if the UserEdit was not found
        /// </returns>
        public async Task<Tuple<bool, Guid?>> AddGoalToUserEdit(string projectId, string userEditId, Edit edit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding goal to user edit");

            edit.Modified = DateTime.UtcNow;

            // Replace the Edit with this guid if present, otherwise add it. Each repo call is atomic on its
            // own; taking the branch from ReplaceEdit's result rather than a prior read closes the stale-read
            // race. Two concurrent first-time writes of the same new guid could still both add it, but guids
            // are client-generated and unique per goal, so that window is tolerated rather than locked.
            var isSuccess = await _userEditRepo.ReplaceEdit(projectId, userEditId, edit)
                || await _userEditRepo.AddEdit(projectId, userEditId, edit);

            return new Tuple<bool, Guid?>(isSuccess, isSuccess ? edit.Guid : null);
        }

        /// <summary> Adds a string representation of a step to a specified <see cref="Edit"/> </summary>
        /// <returns> A bool: success of operation (false if userEdit or edit not found) </returns>
        public async Task<bool> AddStepToGoal(string projectId, string userEditId, Guid editGuid, string stepString)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding step to goal");

            return await _userEditRepo.AddStepToEdit(projectId, userEditId, editGuid, stepString);
        }

        /// <summary> Updates a specified step in a specified <see cref="Edit"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> UpdateStepInGoal(
            string projectId, string userEditId, Guid editGuid, string stepString, int stepIndex)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating step in goal");

            if (stepIndex < 0)
            {
                return false;
            }

            // The repository bounds-checks stepIndex atomically with the write.
            return await _userEditRepo.UpdateStepInEdit(projectId, userEditId, editGuid, stepIndex, stepString);
        }
    }
}
