using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="UserEdit"/>s </summary>
    public class UserEditService : IUserEditService
    {
        private readonly IUserEditRepository _userEditRepo;

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
            // Get userEdit to change
            var userEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (userEdit is null)
            {
                return new Tuple<bool, Guid?>(false, null);
            }

            edit.Modified = DateTime.UtcNow;

            // Update existing Edit if guid exists, otherwise add new one at end of List.
            var editIndex = userEdit.Edits.FindLastIndex(e => e.Guid == edit.Guid);
            if (editIndex > -1)
            {
                userEdit.Edits[editIndex] = edit;
            }
            else
            {
                userEdit.Edits.Add(edit);
            }

            // Replace the old UserEdit object with the new one that contains the new/updated edit
            var editReplaced = await _userEditRepo.Replace(projectId, userEditId, userEdit);

            return new Tuple<bool, Guid?>(editReplaced, edit.Guid);
        }

        /// <summary> Adds a string representation of a step to a specified <see cref="Edit"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> AddStepToGoal(string projectId, string userEditId, Guid editGuid, string stepString)
        {
            var userEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (userEdit is null)
            {
                return false;
            }
            var edit = userEdit.Edits.FindLast(e => e.Guid == editGuid);
            if (edit is null)
            {
                return false;
            }
            edit.Modified = DateTime.UtcNow;
            edit.StepData.Add(stepString);
            return await _userEditRepo.Replace(projectId, userEditId, userEdit);
        }

        /// <summary> Updates a specified step in a specified <see cref="Edit"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> UpdateStepInGoal(
            string projectId, string userEditId, Guid editGuid, string stepString, int stepIndex)
        {
            if (stepIndex < 0)
            {
                return false;
            }
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
            edit.Modified = DateTime.UtcNow;
            edit.StepData[stepIndex] = stepString;
            return await _userEditRepo.Replace(projectId, userEditId, userEdit);
        }
    }
}
