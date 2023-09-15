using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class MergeBlacklistRepositoryMock : IMergeWordSetRepository
    {
        private readonly List<MergeWordSetEntry> _mergeBlacklist;

        public MergeBlacklistRepositoryMock()
        {
            _mergeBlacklist = new List<MergeWordSetEntry>();
        }

        public Task<List<MergeWordSetEntry>> GetAllEntries(string projectId, string? userId = null)
        {
            var cloneList = _mergeBlacklist.Select(e => e.Clone()).ToList();
            var enumerable = userId is null ?
                cloneList.Where(e => e.ProjectId == projectId) :
                cloneList.Where(e => e.ProjectId == projectId && e.UserId == userId);
            return Task.FromResult(enumerable.ToList());
        }

        public Task<MergeWordSetEntry?> GetEntry(string projectId, string entryId)
        {
            try
            {
                var foundMergeBlacklist = _mergeBlacklist.Single(entry => entry.Id == entryId);
                return Task.FromResult<MergeWordSetEntry?>(foundMergeBlacklist.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<MergeWordSetEntry?>(null);
            }
        }

        public Task<MergeWordSetEntry> Create(MergeWordSetEntry wordSetEntry)
        {
            wordSetEntry.Id = Guid.NewGuid().ToString();
            _mergeBlacklist.Add(wordSetEntry.Clone());
            return Task.FromResult(wordSetEntry.Clone());
        }

        public Task<bool> DeleteAllEntries(string projectId)
        {
            _mergeBlacklist.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string entryId)
        {
            var foundMergeBlacklist = _mergeBlacklist.Single(entry => entry.Id == entryId);
            return Task.FromResult(_mergeBlacklist.Remove(foundMergeBlacklist));
        }

        public Task<ResultOfUpdate> Update(MergeWordSetEntry wordSetEntry)
        {
            var foundEntry = _mergeBlacklist.Single(
                e => e.ProjectId == wordSetEntry.ProjectId && e.Id == wordSetEntry.Id);
            var success = _mergeBlacklist.Remove(foundEntry);
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _mergeBlacklist.Add(wordSetEntry.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
