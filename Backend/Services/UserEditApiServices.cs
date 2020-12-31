using System;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="UserEdit"/>s </summary>
    public class UserEditService : IUserEditService
    {
        private readonly IUserEditRepository _repo;

        public UserEditService(IUserEditRepository repo)
        {
            _repo = repo;
        }

        /// <summary> Adds an <see cref="Edit"/> to a specified <see cref="UserEdit"/> </summary>
        /// <returns> Tuple of a bool: success of operation and int: index at which the new edit was placed </returns>
        public async Task<Tuple<bool, int>> AddGoalToUserEdit(string projectId, string userEditId, Edit edit)
        {
            // Get userEdit to change
            var userEntry = await _repo.GetUserEdit(projectId, userEditId);
            var newUserEdit = userEntry.Clone();

            // Add the new goal index to Edits list
            newUserEdit.Edits.Add(edit);

            // Replace the old UserEdit object with the new one that contains the new list entry
            var replaceSucceeded = await _repo.Replace(projectId, userEditId, newUserEdit);
            var indexOfNewestEdit = -1;
            if (replaceSucceeded)
            {
                var newestEdit = await _repo.GetUserEdit(projectId, userEditId);
                indexOfNewestEdit = newestEdit.Edits.Count - 1;
            }

            return new Tuple<bool, int>(replaceSucceeded, indexOfNewestEdit);
        }

        /// <summary> Adds a string representation of a step to a <see cref="Edit"/> at a specified index </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> AddStepToGoal(string projectId, string userEditId, int goalIndex, string userEdit)
        {
            var addUserEdit = await _repo.GetUserEdit(projectId, userEditId);
            var newUserEdit = addUserEdit.Clone();
            newUserEdit.Edits[goalIndex].StepData.Add(userEdit);
            var updateResult = await _repo.Replace(projectId, userEditId, newUserEdit);
            return updateResult;
        }
    }
}
