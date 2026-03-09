using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    internal sealed class WordRepositoryMock : IWordRepository
    {
        private readonly List<Word> _words = [];
        private readonly List<Word> _frontier = [];

        private Task<bool>? _getAllFrontierDelay;
        private int _getAllFrontierCallCount;

        /// <summary>
        /// Sets a delay for the GetFrontier method. The first call to GetFrontier will wait
        /// until the provided Task is completed.
        /// </summary>
        internal void SetGetFrontierDelay(Task<bool> delay)
        {
            _getAllFrontierDelay = delay;
            _getAllFrontierCallCount = 0;
        }

        public Task<List<Word>> GetAllWords(string projectId)
        {
            return Task.FromResult(_words.Where(w => w.ProjectId == projectId).Select(w => w.Clone()).ToList());
        }

        public Task<Word?> GetWord(string projectId, string wordId)
        {
            return Task.FromResult(_words.FirstOrDefault(w => w.ProjectId == projectId && w.Id == wordId)?.Clone());
        }

        public async Task<Word> Create(Word word)
        {
            return (await Create([word])).First();
        }

        public Task<List<Word>> Create(List<Word> words)
        {
            if (words.Count == 0)
            {
                return Task.FromResult(words);
            }

            words.ForEach(word =>
            {
                word.Id = Guid.NewGuid().ToString();
                _words.Add(word.Clone());
                _frontier.Add(word.Clone());
            });

            return Task.FromResult(words);
        }

        /// <summary> Removes all words and frontier words for the given projectId. </summary>
        internal void DeleteAllWords(string projectId)
        {
            _words.RemoveAll(word => word.ProjectId == projectId);
            _frontier.RemoveAll(word => word.ProjectId == projectId);
        }

        public Task<bool> DeleteAllFrontierWords(string projectId)
        {
            return Task.FromResult(_frontier.RemoveAll(word => word.ProjectId == projectId) != 0);
        }

        public Task<bool> HasWords(string projectId)
        {
            return Task.FromResult(_words.Any(w => w.ProjectId == projectId));
        }

        public Task<bool> HasFrontierWords(string projectId)
        {
            return Task.FromResult(_frontier.Any(w => w.ProjectId == projectId));
        }

        public Task<bool> IsInFrontier(string projectId, string wordId)
        {
            return Task.FromResult(_frontier.Any(w => w.ProjectId == projectId && w.Id == wordId));
        }

        public Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count)
        {
            return Task.FromResult(_frontier.Count(w => w.ProjectId == projectId && wordIds.Contains(w.Id)) >= count);
        }

        public Task<int> GetFrontierCount(string projectId)
        {
            return Task.FromResult(_frontier.Count(w => w.ProjectId == projectId));
        }

        public async Task<List<Word>> GetAllFrontier(string projectId)
        {
            if (_getAllFrontierDelay is not null)
            {
                var callCount = Interlocked.Increment(ref _getAllFrontierCallCount);
                if (callCount == 1)
                {
                    // First call waits for the signal
                    await _getAllFrontierDelay;
                }
            }

            return _frontier.Where(w => w.ProjectId == projectId).Select(w => w.Clone()).ToList();
        }

        public Task<Word?> GetFrontier(string projectId, string wordId, string? audioFileName = null)
        {
            var word = _frontier.Find(w => w.ProjectId == projectId && w.Id == wordId &&
                (string.IsNullOrEmpty(audioFileName) || w.Audio.Any(a => a.FileName == audioFileName)));
            return Task.FromResult(word?.Clone());
        }

        public Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        {
            return Task.FromResult(_frontier.Where(
                w => w.ProjectId == projectId && w.Vernacular == vernacular).Select(w => w.Clone()).ToList());
        }

        /// <summary> Adds a new word to the words without adding it to the frontier. </summary>
        internal Task<Word> Add(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            _words.Add(word.Clone());
            return Task.FromResult(word);
        }

        /// <summary> Adds a new word to the frontier without adding it to the words. </summary>
        internal Task<Word> AddFrontier(Word word)
        {
            _frontier.Add(word.Clone());
            return Task.FromResult(word);
        }

        public Task<List<Word>> AddFrontier(List<Word> words)
        {
            words.ForEach(w => _frontier.Add(w.Clone()));
            return Task.FromResult(words);
        }

        public Task<Word?> DeleteFrontier(string projectId, string wordId, Action<Word> modifyDeletedWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == projectId && w.Id == wordId);
            if (removedWord is null)
            {
                return Task.FromResult<Word?>(null);
            }

            _frontier.Remove(removedWord);

            var modifiedWord = removedWord.Clone();
            modifyDeletedWord(modifiedWord);
            modifiedWord.Id = Guid.NewGuid().ToString();

            _words.Add(modifiedWord.Clone());
            return Task.FromResult<Word?>(modifiedWord);
        }

        public Task<bool> RestoreFrontier(string projectId, string wordId)
        {
            var word = _words.FirstOrDefault(w => w.ProjectId == projectId && w.Id == wordId);
            if (word is null)
            {
                return Task.FromResult(false);
            }
            if (word.Accessibility == Status.Deleted)
            {
                throw new ArgumentException("Cannot add a word with Deleted status to Frontier");
            }
            if (_frontier.Any(f => f.ProjectId == projectId && f.Id == word.Id))
            {
                throw new ArgumentException("Cannot restore a word with an Id already in the Frontier");
            }

            _frontier.Add(word.Clone());
            return Task.FromResult(true);
        }

        private Task<Word?> UpdateFrontier(Word word, bool createIfNotFound, Action<Word, Word?> modifyUpdatedWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == word.ProjectId && w.Id == word.Id);
            if (removedWord is null && !createIfNotFound)
            {
                return Task.FromResult<Word?>(null);
            }

            if (removedWord is not null)
            {
                _frontier.Remove(removedWord);
            }

            modifyUpdatedWord(word, removedWord?.Clone());
            word.Id = Guid.NewGuid().ToString();

            _words.Add(word.Clone());
            _frontier.Add(word.Clone());
            return Task.FromResult<Word?>(word);
        }

        public Task<Word?> UpdateFrontier(string projectId, string wordId, Action<Word> modifyUpdatedWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == projectId && w.Id == wordId);
            if (removedWord is null)
            {
                return Task.FromResult<Word?>(null);
            }

            var modifiedWord = removedWord.Clone();
            modifyUpdatedWord(modifiedWord);

            _frontier.Remove(removedWord);
            modifiedWord.Id = Guid.NewGuid().ToString();

            _words.Add(modifiedWord.Clone());
            _frontier.Add(modifiedWord.Clone());
            return Task.FromResult<Word?>(modifiedWord);
        }

        public async Task<Word?> UpdateFrontier(Word word, Action<Word, Word?> modifyUpdatedWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == word.ProjectId && w.Id == word.Id);
            if (removedWord is null)
            {
                return null;
            }

            return await UpdateFrontier(word, createIfNotFound: false, modifyUpdatedWord);
        }

        public async Task<List<Word>?> ReplaceFrontier(string projectId, List<Word> newWords,
            List<string> idsToDelete, Action<Word, Word?> modifyUpdatedWord, Action<Word> modifyDeletedWord)
        {
            if (newWords.Any(w => w.ProjectId != projectId))
            {
                throw new ArgumentException("All new words must have the specified projectId");
            }

            var oldIdSet = idsToDelete.ToHashSet();

            foreach (var word in newWords)
            {
                oldIdSet.Remove(word.Id);
                await UpdateFrontier(word, createIfNotFound: true, modifyUpdatedWord);
            }

            foreach (var oldId in oldIdSet)
            {
                await DeleteFrontier(projectId, oldId, modifyDeletedWord);
            }

            return newWords;
        }
        public async Task<bool> RevertReplaceFrontier(
            string projectId, List<string> idsToRestore, List<string> idsToDelete, Action<Word> modifyDeletedWord)
        {
            var restoreSet = idsToRestore.ToHashSet();
            if (restoreSet.Intersect(idsToDelete).Any())
            {
                throw new ArgumentException("Ids to delete and restore must be disjoint");
            }

            foreach (var id in idsToDelete)
            {
                await DeleteFrontier(projectId, id, modifyDeletedWord);
            }

            foreach (var id in restoreSet)
            {
                if (!await RestoreFrontier(projectId, id))
                {
                    return false;
                }
            }

            return true;
        }

        public Task<int> CountFrontierWordsWithDomain(string projectId, string domainId)
        {
            var count = _frontier.Count(
                w => w.ProjectId == projectId && w.Senses.Any(s => s.SemanticDomains.Any(sd => sd.Id == domainId)));
            return Task.FromResult(count);
        }
    }
}
