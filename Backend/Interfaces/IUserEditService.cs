using BackendFramework.ValueModels;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserEditService
    {
        Task<List<UserEdit>> GetAllUserEdits();
        Task<UserEdit> GetUserEdit(string Id);
        Task<UserEdit> Create(UserEdit userEdit);
        Task<bool> Update(string Id, int goalIndex, string userEdit);
        Task<Tuple<bool, int>> AddEditsToUserEdit(string Id, Edit edit);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllUserEdits();
    }
}
