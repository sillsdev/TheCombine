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
        ///     bool: true if Edit added/updated, false if nothing modified
        ///     Guid?: guid of added/updated Edit, or null if UserEdit not found
        /// </returns>
        public async Task<Tuple<bool, Guid?>> AddGoalToUserEdit(string projectId, string userEditId, Edit edit)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding goal to user edit");

            // Get userEdit to change
            var userEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (userEdit is null)
            {
                return new Tuple<bool, Guid?>(false, null);
            }

            edit.Modified = DateTime.UtcNow;

            // Update existing Edit if guid exists, otherwise add new one at end of List.
            var isSuccess = userEdit.Edits.FindLastIndex(e => e.Guid == edit.Guid) > -1
                ? await _userEditRepo.ReplaceEdit(projectId, userEditId, edit)
                : await _userEditRepo.AddEdit(projectId, userEditId, edit);

            return new Tuple<bool, Guid?>(isSuccess, edit.Guid);
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

            // Read first to bounds-check stepIndex: a $set beyond the array's end
            // would pad the array with nulls instead of failing.
            var userEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (userEdit is null)
            {
                return false;
            }
            var edit = userEdit.Edits.FindLast(e => e.Guid == editGuid);
            if (edit is null || stepIndex >= edit.StepData.Count)
            {
                return false;
            }
            return await _userEditRepo.UpdateStepInEdit(projectId, userEditId, editGuid, stepIndex, stepString);
        }
    }
}
