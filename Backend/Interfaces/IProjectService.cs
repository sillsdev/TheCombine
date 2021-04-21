using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IProjectService
    {
        Task<bool> CanImportLift(string projectId);
    }
}
