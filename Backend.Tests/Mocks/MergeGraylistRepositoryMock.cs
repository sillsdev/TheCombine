using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    public class MergeGraylistRepositoryMock : IMergeGraylistRepository
    {
        private readonly List<MergeWordSet> _mergeGraylist;

        public MergeGraylistRepositoryMock()
        {
            _mergeGraylist = new List<MergeWordSet>();
        }

        public Task<List<MergeWordSet>> GetAllEntries(string projectId)
        {
            var list = _mergeGraylist.Where(e => e.ProjectId == projectId).ToList();
            return Task.FromResult(list.Select(e => e.Clone()).ToList());
        }

        public Task<List<MergeWordSet>> GetAllEntries(string projectId, string userId)
        {
            var list = _mergeGraylist.Where(e => e.ProjectId == projectId && e.UserId == userId).ToList();
            return Task.FromResult(list.Select(e => e.Clone()).ToList());
        }

        public Task<MergeWordSet?> GetEntry(string projectId, string entryId)
        {
            try
            {
                var foundMergeGraylist = _mergeGraylist.Single(entry => entry.Id == entryId);
                return Task.FromResult<MergeWordSet?>(foundMergeGraylist.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<MergeWordSet?>(null);
            }
        }

        public Task<MergeWordSet> Create(MergeWordSet entry)
        {
            entry.Id = Guid.NewGuid().ToString();
            _mergeGraylist.Add(entry.Clone());
            return Task.FromResult(entry.Clone());
        }

        public Task<bool> DeleteAll(string projectId)
        {
            _mergeGraylist.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string entryId)
        {
            var foundMergeGraylist = _mergeGraylist.Single(entry => entry.Id == entryId);
            return Task.FromResult(_mergeGraylist.Remove(foundMergeGraylist));
        }

        public Task<ResultOfUpdate> Update(MergeWordSet entry)
        {
            var foundEntry = _mergeGraylist.Single(
                e => e.ProjectId == entry.ProjectId && e.Id == entry.Id);
            var success = _mergeGraylist.Remove(foundEntry);
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _mergeGraylist.Add(entry.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }
    }
}
