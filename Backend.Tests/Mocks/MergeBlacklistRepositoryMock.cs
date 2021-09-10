using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class MergeBlacklistRepositoryMock : IMergeBlacklistRepository
    {
        private readonly List<MergeBlacklistEntry> _mergeBlacklist;

        public MergeBlacklistRepositoryMock()
        {
            _mergeBlacklist = new List<MergeBlacklistEntry>();
        }

        public Task<List<MergeBlacklistEntry>> GetAll(string projectId, string? userId = null)
        {
            var cloneList = _mergeBlacklist.Select(e => e.Clone()).ToList();
            var enumerable = userId is null ?
                cloneList.Where(e => e.ProjectId == projectId) :
                cloneList.Where(e => e.ProjectId == projectId && e.UserId == userId);
            return Task.FromResult(enumerable.ToList());
        }

        public Task<MergeBlacklistEntry?> Get(string projectId, string entryId)
        {
            try
            {
                var foundMergeBlacklist = _mergeBlacklist.Single(entry => entry.Id == entryId);
                return Task.FromResult<MergeBlacklistEntry?>(foundMergeBlacklist.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<MergeBlacklistEntry?>(null);
            }
        }

        public Task<MergeBlacklistEntry> Create(MergeBlacklistEntry entry)
        {
            entry.Id = Guid.NewGuid().ToString();
            _mergeBlacklist.Add(entry.Clone());
            return Task.FromResult(entry.Clone());
        }

        public Task<bool> DeleteAll(string projectId)
        {
            _mergeBlacklist.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string entryId)
        {
            var foundMergeBlacklist = _mergeBlacklist.Single(entry => entry.Id == entryId);
            return Task.FromResult(_mergeBlacklist.Remove(foundMergeBlacklist));
        }

        public Task<ResultOfUpdate> Update(MergeBlacklistEntry entry)
        {
            var foundEntry = _mergeBlacklist.Single(e => e.ProjectId == entry.ProjectId && e.Id == entry.Id);
            var success = _mergeBlacklist.Remove(foundEntry);
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _mergeBlacklist.Add(entry.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
