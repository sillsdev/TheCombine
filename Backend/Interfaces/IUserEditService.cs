using BackendFramework.ValueModels;
using System;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IUserEditService
    {
        Task<bool> AddStepToGoal(string Id, int goalIndex, string userEdit);
        Task<Tuple<bool, int>> AddGoalToUserEdit(string Id, Edit edit);
    }
}
