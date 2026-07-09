using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserEditRepository
    {
        Task<List<UserEdit>> GetAllUserEdits(string projectId);
        Task<UserEdit?> GetUserEdit(string projectId, string userEditId);
        Task<UserEdit> Create(UserEdit userEdit);
        Task<bool> Delete(string projectId, string userEditId);
        Task<bool> DeleteAllUserEdits(string projectId);
        Task<bool> AddEdit(string projectId, string userEditId, Edit edit);
        Task<bool> ReplaceEdit(string projectId, string userEditId, Edit edit);
        Task<bool> AddStepToEdit(string projectId, string userEditId, Guid editGuid, string stepData);
        Task<bool> UpdateStepInEdit(string projectId, string userEditId, Guid editGuid, int stepIndex, string stepData);
    }
}
