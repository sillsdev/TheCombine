using BackendFramework.ValueModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserEditRepository
    {
        Task<List<UserEdit>> GetAllUserEdits();
        Task<UserEdit> GetUserEdit(string Id);
        Task<UserEdit> Create(UserEdit userEdit);
        Task<bool> Delete(string Id);
        Task<bool> DeleteAllUserEdits();
        Task<bool> Replace(string Id, UserEdit userEdit);
    }
}
