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
        Task<bool> Replace(string projectId, string userEditId, UserEdit userEdit);
    }
}
