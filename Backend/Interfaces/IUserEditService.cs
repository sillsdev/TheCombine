using System;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IUserEditService
    {
        Task<Tuple<bool, int>> AddGoalToUserEdit(string projectId, string userEditId, Edit edit);
        Task<bool> AddStepToGoal(string projectId, string userEditId, int goalIndex, string stepString);
        Task<bool> UpdateStepInGoal(string projectId, string userEditId, int goalIndex, string stepString, int stepIndex);
    }
}
