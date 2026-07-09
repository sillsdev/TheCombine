using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class UserEditRepositoryMock : IUserEditRepository
    {
        private readonly List<UserEdit> _userEdits;

        public UserEditRepositoryMock()
        {
            _userEdits = new List<UserEdit>();
        }

        public Task<List<UserEdit>> GetAllUserEdits(string projectId)
        {
            var cloneList = _userEdits.Select(userEdit => userEdit.Clone()).ToList();
            return Task.FromResult(cloneList.Where(userEdit => userEdit.ProjectId == projectId).ToList());
        }

        public Task<UserEdit?> GetUserEdit(string projectId, string userEditId)
        {
            try
            {
                var foundUserEdit = _userEdits.Single(ue => ue.ProjectId == projectId && ue.Id == userEditId);
                return Task.FromResult<UserEdit?>(foundUserEdit.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<UserEdit?>(null);
            }
        }

        public Task<UserEdit> Create(UserEdit userEdit)
        {
            userEdit.Id = Guid.NewGuid().ToString();
            _userEdits.Add(userEdit.Clone());
            return Task.FromResult(userEdit.Clone());
        }

        public Task<bool> DeleteAllUserEdits(string projectId)
        {
            var rmCount = _userEdits.RemoveAll(userEdit => userEdit.ProjectId == projectId);
            return Task.FromResult(rmCount > 0);
        }

        public Task<bool> Delete(string projectId, string userEditId)
        {
            var rmCount = _userEdits.RemoveAll(
                userEdit => userEdit.ProjectId == projectId && userEdit.Id == userEditId);
            return Task.FromResult(rmCount > 0);
        }

        public Task<bool> AddEdit(string projectId, string userEditId, Edit edit)
        {
            var userEdit = _userEdits.Find(ue => ue.ProjectId == projectId && ue.Id == userEditId);
            if (userEdit is null)
            {
                return Task.FromResult(false);
            }
            userEdit.Edits.Add(edit.Clone());
            return Task.FromResult(true);
        }

        public Task<bool> ReplaceEdit(string projectId, string userEditId, Edit edit)
        {
            var userEdit = _userEdits.Find(ue => ue.ProjectId == projectId && ue.Id == userEditId);
            // Match the first entry by guid, as MongoDB's UpdateOne does in the real repository.
            var editIndex = userEdit?.Edits.FindIndex(e => e.Guid == edit.Guid) ?? -1;
            if (userEdit is null || editIndex == -1)
            {
                return Task.FromResult(false);
            }
            userEdit.Edits[editIndex] = edit.Clone();
            return Task.FromResult(true);
        }

        public Task<bool> AddStepToEdit(string projectId, string userEditId, Guid editGuid, string stepData)
        {
            var userEdit = _userEdits.Find(ue => ue.ProjectId == projectId && ue.Id == userEditId);
            var edit = userEdit?.Edits.Find(e => e.Guid == editGuid);
            if (edit is null)
            {
                return Task.FromResult(false);
            }
            edit.StepData.Add(stepData);
            edit.Modified = DateTime.UtcNow;
            return Task.FromResult(true);
        }

        public Task<bool> UpdateStepInEdit(
            string projectId, string userEditId, Guid editGuid, int stepIndex, string stepData)
        {
            var userEdit = _userEdits.Find(ue => ue.ProjectId == projectId && ue.Id == userEditId);
            var edit = userEdit?.Edits.Find(e => e.Guid == editGuid);
            if (edit is null || stepIndex < 0 || stepIndex >= edit.StepData.Count)
            {
                return Task.FromResult(false);
            }
            edit.StepData[stepIndex] = stepData;
            edit.Modified = DateTime.UtcNow;
            return Task.FromResult(true);
        }
    }
}
