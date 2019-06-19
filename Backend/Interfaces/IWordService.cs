using BackendFramework.ValueModels;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IWordService
    {
        Task<bool> Update(string Id, Project word);
        Task<bool> Delete(string Id);
        Task<Project> Merge(MergeWords mergeWords);
    }
}
