using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class MergeBlacklistRepositoryMock : IMergeBlacklistRepository
    {
        private readonly List<MergeWordSet> _mergeBlacklist;

        public MergeBlacklistRepositoryMock()
        {
            _mergeBlacklist = new List<MergeWordSet>();
        }

        public Task<List<MergeWordSet>> GetAllSets(string projectId, string? userId = null)
        {
            var cloneList = _mergeBlacklist.Select(e => e.Clone()).ToList();
            var enumerable = userId is null ?
                cloneList.Where(e => e.ProjectId == projectId) :
                cloneList.Where(e => e.ProjectId == projectId && e.UserId == userId);
            return Task.FromResult(enumerable.ToList());
        }

        public Task<MergeWordSet?> GetSet(string projectId, string entryId)
        {
            try
            {
                var foundMergeBlacklist = _mergeBlacklist.Single(entry => entry.Id == entryId);
                return Task.FromResult<MergeWordSet?>(foundMergeBlacklist.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<MergeWordSet?>(null);
            }
        }

        public Task<MergeWordSet> Create(MergeWordSet wordSetEntry)
        {
            wordSetEntry.Id = Guid.NewGuid().ToString();
            _mergeBlacklist.Add(wordSetEntry.Clone());
            return Task.FromResult(wordSetEntry.Clone());
        }

        public Task<bool> DeleteAllSets(string projectId)
        {
            _mergeBlacklist.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string entryId)
        {
            var rmCount = _mergeBlacklist.RemoveAll(entry => entry.Id == entryId);
            return Task.FromResult(rmCount > 0);
        }

        public Task<ResultOfUpdate> Update(MergeWordSet wordSetEntry)
        {
            var rmCount = _mergeBlacklist.RemoveAll(
                e => e.ProjectId == wordSetEntry.ProjectId && e.Id == wordSetEntry.Id);
            if (rmCount == 0)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _mergeBlacklist.Add(wordSetEntry.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
