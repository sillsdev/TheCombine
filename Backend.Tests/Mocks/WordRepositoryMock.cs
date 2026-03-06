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
        public void SetGetFrontierDelay(Task<bool> delay)
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
            try
            {
                return Task.FromResult<Word?>(_words.Single(w => w.ProjectId == projectId && w.Id == wordId).Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<Word?>(null);
            }
        }

        public async Task<Word> RepoCreate(Word word)
        {
            return (await RepoCreate([word])).First();
        }

        public Task<List<Word>> RepoCreate(List<Word> words)
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

        private Task<Word> RepoUpdateFrontier(Word word, bool createIfNotFound,
            Action<Word, Word?> modifyNewWordFromOldWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == word.ProjectId && w.Id == word.Id);
            if (removedWord is null && !createIfNotFound)
            {
                throw new InvalidOperationException("Cannot update a missing frontier word when createIfNotFound is false");
            }

            if (removedWord is not null)
            {
                _frontier.Remove(removedWord);
            }

            modifyNewWordFromOldWord(word, removedWord?.Clone());
            word.Id = Guid.NewGuid().ToString();

            _words.Add(word.Clone());
            _frontier.Add(word.Clone());
            return Task.FromResult(word);
        }

        public async Task<Word?> RepoUpdateFrontier(Word word, Action<Word, Word?> modifyNewWordFromOldWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == word.ProjectId && w.Id == word.Id);
            if (removedWord is null)
            {
                return null;
            }

            return await RepoUpdateFrontier(word, createIfNotFound: false, modifyNewWordFromOldWord);
        }

        /// <summary> Removes all words and frontier words for the given projectId. </summary>
        internal void DeleteAllWords(string projectId)
        {
            _words.RemoveAll(word => word.ProjectId == projectId);
            _frontier.RemoveAll(word => word.ProjectId == projectId);
        }

        public Task<bool> DeleteAllFrontierWords(string projectId)
        {
            _frontier.RemoveAll(word => word.ProjectId == projectId);
            return Task.FromResult(true);
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

        public Task<List<Word>> RepoRestoreFrontier(string projectId, List<string> wordIds)
        {
            var restoreSet = wordIds.ToHashSet();
            var wordsToRestore = _words
                .Where(w => w.ProjectId == projectId && restoreSet.Contains(w.Id))
                .Select(w => w.Clone())
                .ToList();

            if (wordsToRestore.Count != restoreSet.Count)
            {
                throw new ArgumentException("Some ids to be restored were not found");
            }

            if (wordsToRestore.Any(w => w.Accessibility == Status.Deleted))
            {
                throw new ArgumentException("Cannot add a word with Deleted status to Frontier");
            }
            if (wordsToRestore.Any(word => _frontier.Any(f => f.ProjectId == projectId && f.Id == word.Id)))
            {
                throw new ArgumentException("Cannot restore a word with an Id already in the Frontier");
            }

            wordsToRestore.ForEach(word => _frontier.Add(word.Clone()));
            return Task.FromResult(wordsToRestore);
        }

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

        /// <summary> Adds a new word to the repository without adding it to the frontier. </summary>
        internal Task<Word> Add(Word word)
        {
            word.Id = Guid.NewGuid().ToString();
            _words.Add(word.Clone());
            return Task.FromResult(word);
        }

        public async Task<List<Word>?> RepoReplaceFrontier(string projectId, List<Word> newWords,
            List<string> idsToDelete, Action<Word, Word?> modifyUpdatedWord, Action<Word> modifyDeletedWord)
        {
            if (newWords.Any(w => w.ProjectId != projectId))
            {
                throw new ArgumentException("All new words must have the specified projectId");
            }

            var oldIdSet = idsToDelete.ToHashSet();

            foreach (var word in newWords)
            {
                await RepoUpdateFrontier(word, createIfNotFound: true, modifyUpdatedWord);
                oldIdSet.Remove(word.Id);
            }

            foreach (var oldId in oldIdSet)
            {
                await RepoDeleteFrontier(projectId, oldId, modifyDeletedWord);
            }

            return newWords;
        }

        public async Task<List<Word>> RepoRevertReplaceFrontier(
            string projectId, List<string> idsToRestore, List<string> idsToDelete, Action<Word> modifyDeletedWord)
        {
            var restoreSet = idsToRestore.ToHashSet();
            var deleteSet = idsToDelete.ToHashSet();
            if (deleteSet.Intersect(restoreSet).Any())
            {
                throw new ArgumentException("Ids to delete and restore must be disjoint");
            }

            var restoredWords = await RepoRestoreFrontier(projectId, restoreSet.ToList());
            if (restoredWords.Count != restoreSet.Count)
            {
                throw new ArgumentException("Some ids to be restored were not found");
            }

            foreach (var id in deleteSet)
            {
                await RepoDeleteFrontier(projectId, id, modifyDeletedWord);
            }

            return restoredWords;
        }

        public Task<Word?> RepoDeleteFrontier(string projectId, string wordId, Action<Word> modifyWord)
        {
            var removedWord = _frontier.Find(w => w.ProjectId == projectId && w.Id == wordId);
            if (removedWord is null)
            {
                return Task.FromResult<Word?>(null);
            }

            _frontier.Remove(removedWord);

            var modifiedWord = removedWord.Clone();
            modifyWord(modifiedWord);
            modifiedWord.Id = Guid.NewGuid().ToString();

            _words.Add(modifiedWord.Clone());
            return Task.FromResult<Word?>(modifiedWord);
        }

        public Task<int> CountFrontierWordsWithDomain(string projectId, string domainId)
        {
            var count = _frontier.Count(
                w => w.ProjectId == projectId && w.Senses.Any(s => s.SemanticDomains.Any(sd => sd.Id == domainId)));
            return Task.FromResult(count);
        }
    }
}
