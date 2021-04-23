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

        public Task<List<MergeBlacklistEntry>> GetAll(string projectId)
        {
            var cloneList = _mergeBlacklist.Select(entry => entry.Clone()).ToList();
            return Task.FromResult(cloneList.Where(entry => entry.ProjectId == projectId).ToList());
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

        public Task<ResultOfUpdate> Update(string entryId, MergeBlacklistEntry entry)
        {
            var foundMergeBlacklist = _mergeBlacklist.Single(ur => ur.Id == entryId);
            var success = _mergeBlacklist.Remove(foundMergeBlacklist);
            if (success)
            {
                _mergeBlacklist.Add(entry.Clone());
                return Task.FromResult(ResultOfUpdate.Updated);
            }
            return Task.FromResult(ResultOfUpdate.NotFound);
        }

        public Task<bool> Replace(string projectId, List<MergeBlacklistEntry> blacklist)
        {
            _ = DeleteAll(projectId).Result;
            foreach (var entry in blacklist)
            {
                _mergeBlacklist.Add(entry.Clone());
            }
            return Task.FromResult(true);
        }
    }
}
