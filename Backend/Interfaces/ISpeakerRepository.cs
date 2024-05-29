using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface ISpeakerRepository
    {
        Task<List<Speaker>> GetAllSpeakers(string projectId);
        Task<Speaker?> GetSpeaker(string projectId, string speakerId);
        Task<Speaker> Create(Speaker speaker);
        Task<bool> Delete(string projectId, string speakerId);
        Task<bool> DeleteAllSpeakers(string projectId);
        Task<ResultOfUpdate> Update(string speakerId, Speaker speaker);
        Task<bool> IsSpeakerNameInProject(string projectId, string name);
    }
}
