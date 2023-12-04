using System;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserEditService
    {
        Task<Tuple<bool, Guid?>> AddGoalToUserEdit(string projectId, string userEditId, Edit edit);
        Task<bool> AddStepToGoal(string projectId, string userEditId, Guid editGuid, string stepString);
        Task<bool> UpdateStepInGoal(
            string projectId, string userEditId, Guid editGuid, string stepString, int stepIndex);
    }
}
