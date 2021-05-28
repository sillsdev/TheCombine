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
        ///     bool: success of operation
        ///     int: index at which the edit was placed or -1 on failure
        /// </returns>
        public async Task<Tuple<bool, int>> AddGoalToUserEdit(string projectId, string userEditId, Edit edit)
        {
            // Get userEdit to change
            var oldUserEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            const int invalidEditIndex = -1;
            var failureResult = new Tuple<bool, int>(false, invalidEditIndex);
            if (oldUserEdit is null)
            {
                return failureResult;
            }

            var newUserEdit = oldUserEdit.Clone();

            // Update existing Edit if guid exists, otherwise add new one at end of List.
            var indexOfNewestEdit = newUserEdit.Edits.FindIndex(e => e.Guid == edit.Guid);
            if (indexOfNewestEdit > invalidEditIndex)
            {
                newUserEdit.Edits[indexOfNewestEdit] = edit;
            }
            else
            {
                newUserEdit.Edits.Add(edit);
                indexOfNewestEdit = newUserEdit.Edits.Count - 1;
            }

            // Replace the old UserEdit object with the new one that contains the new/updated edit
            var replaceSucceeded = await _userEditRepo.Replace(projectId, userEditId, newUserEdit);
            if (!replaceSucceeded)
            {
                indexOfNewestEdit = invalidEditIndex;
            }

            return new Tuple<bool, int>(replaceSucceeded, indexOfNewestEdit);
        }

        /// <summary> Adds a string representation of a step to a specified <see cref="Edit"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> AddStepToGoal(string projectId, string userEditId, int goalIndex, string newStep)
        {
            var oldUserEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (oldUserEdit is null || goalIndex >= oldUserEdit.Edits.Count)
            {
                return false;
            }

            var newUserEdit = oldUserEdit.Clone();
            newUserEdit.Edits[goalIndex].StepData.Add(newStep);
            var updateResult = await _userEditRepo.Replace(projectId, userEditId, newUserEdit);
            return updateResult;
        }

        /// <summary> Updates a specified step to in a specified <see cref="Edit"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> UpdateStepInGoal(
            string projectId, string userEditId, int goalIndex, string updatedStep, int stepIndex)
        {
            var oldUserEdit = await _userEditRepo.GetUserEdit(projectId, userEditId);
            if (oldUserEdit is null || goalIndex >= oldUserEdit.Edits.Count
                || stepIndex >= oldUserEdit.Edits[goalIndex].StepData.Count)
            {
                return false;
            }

            var newUserEdit = oldUserEdit.Clone();
            newUserEdit.Edits[goalIndex].StepData[stepIndex] = updatedStep;
            var updateResult = await _userEditRepo.Replace(projectId, userEditId, newUserEdit);
            return updateResult;
        }
    }
}
