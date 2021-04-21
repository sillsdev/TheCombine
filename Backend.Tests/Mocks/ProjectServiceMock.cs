using System.Threading.Tasks;
using BackendFramework.Interfaces;

namespace Backend.Tests.Mocks
{
    public class ProjectServiceMock : IProjectService
    {

        public Task<bool> CanImportLift(string projectId)
        {
            return Task.FromResult(true);
        }
    }
}
