using System.Collections.Generic;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IRepositoryByProjectId<T>
    {
        Task<T> Create(T entry);
        Task<List<T>> GetAllEntries(string projectId);
        Task<T?> GetEntry(string projectId, string entryId);
        Task<bool> Delete(string projectId, string entryId);
        Task<bool> DeleteAll(string projectId);
    }
}
