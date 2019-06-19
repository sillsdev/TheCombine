using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordRepository
    {
        //calls for collection
        Task<List<Project>> GetAllWords();
        //called on collection, returns a list of words
        Task<List<Project>> GetWords(List<string> Ids);
        Task<Project> Create(Project word);
        Task<Project> Add(Project word);
        Task<bool> DeleteAllWords();

        Task<List<Project>> GetFrontier();
        Task<Project> AddFrontier(Project word);
        Task<bool> DeleteFrontier(string id);
    }
}
