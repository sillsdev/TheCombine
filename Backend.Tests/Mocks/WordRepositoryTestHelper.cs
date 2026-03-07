using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Repositories;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Tests.Mocks;

/// <summary>
/// A test helper that wraps the real <see cref="WordRepository"/> with an in-memory MongoDB context.
/// Provides additional methods needed by test suites to set up test data directly.
/// </summary>
/// <remarks>
/// Each instance has its own isolated <see cref="MongoDbContextMock"/>, ensuring test isolation.
/// The real <see cref="WordRepository"/> code runs against the in-memory MongoDB, so tests exercise
/// the actual repository logic rather than a hand-written mock.
/// </remarks>
internal sealed class WordRepositoryTestHelper : IWordRepository
{
    private readonly MongoDbContextMock _context;
    private readonly WordRepository _repo;
    private Task<bool>? _getAllFrontierDelay;
    private int _getAllFrontierCallCount;

    public WordRepositoryTestHelper()
    {
        _context = new MongoDbContextMock();
        _repo = new WordRepository(_context);
    }

    // --- IWordRepository delegation ---

    public Task<List<Word>> GetAllWords(string projectId) => _repo.GetAllWords(projectId);

    public Task<Word?> GetWord(string projectId, string wordId) => _repo.GetWord(projectId, wordId);

    public Task<Word> RepoCreate(Word word) => _repo.RepoCreate(word);

    public Task<List<Word>> RepoCreate(List<Word> words) => _repo.RepoCreate(words);

    public Task<Word?> RepoUpdateFrontier(string projectId, string wordId, Action<Word> modifyWord)
        => _repo.RepoUpdateFrontier(projectId, wordId, modifyWord);

    public Task<Word?> RepoUpdateFrontier(Word word, Action<Word, Word?> modifyNewWordFromOldWord)
        => _repo.RepoUpdateFrontier(word, modifyNewWordFromOldWord);

    public Task<List<Word>?> RepoReplaceFrontier(string projectId, List<Word> newWords,
        List<string> idsToDelete, Action<Word, Word?> modifyUpdatedWord, Action<Word> modifyDeletedWord)
        => _repo.RepoReplaceFrontier(projectId, newWords, idsToDelete, modifyUpdatedWord, modifyDeletedWord);

    public Task<List<Word>> RepoRevertReplaceFrontier(string projectId, List<string> idsToRestore,
        List<string> idsToDelete, Action<Word> modifyDeletedWord)
        => _repo.RepoRevertReplaceFrontier(projectId, idsToRestore, idsToDelete, modifyDeletedWord);

    public Task<Word?> RepoDeleteFrontier(string projectId, string wordId, Action<Word> modifyWord)
        => _repo.RepoDeleteFrontier(projectId, wordId, modifyWord);

    public Task<bool> DeleteAllFrontierWords(string projectId) => _repo.DeleteAllFrontierWords(projectId);

    public Task<bool> HasWords(string projectId) => _repo.HasWords(projectId);

    public Task<bool> HasFrontierWords(string projectId) => _repo.HasFrontierWords(projectId);

    public Task<bool> IsInFrontier(string projectId, string wordId) => _repo.IsInFrontier(projectId, wordId);

    public Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count)
        => _repo.AreInFrontier(projectId, wordIds, count);

    public Task<int> GetFrontierCount(string projectId) => _repo.GetFrontierCount(projectId);

    /// <summary>
    /// Overrides the real GetAllFrontier with optional delay support for concurrency tests.
    /// </summary>
    public async Task<List<Word>> GetAllFrontier(string projectId)
    {
        if (_getAllFrontierDelay is not null)
        {
            var callCount = Interlocked.Increment(ref _getAllFrontierCallCount);
            if (callCount == 1)
            {
                await _getAllFrontierDelay;
            }
        }

        return await _repo.GetAllFrontier(projectId);
    }

    public Task<Word?> GetFrontier(string projectId, string wordId, string? audioFileName = null)
        => _repo.GetFrontier(projectId, wordId, audioFileName);

    public Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        => _repo.GetFrontierWithVernacular(projectId, vernacular);

    public Task<List<Word>> RepoRestoreFrontier(string projectId, List<string> wordIds)
        => _repo.RepoRestoreFrontier(projectId, wordIds);

    public Task<List<Word>> AddFrontier(List<Word> words) => _repo.AddFrontier(words);

    public Task<int> CountFrontierWordsWithDomain(string projectId, string domainId)
        => _repo.CountFrontierWordsWithDomain(projectId, domainId);

    // --- Test-only helper methods (not on IWordRepository) ---

    /// <summary>
    /// Adds a word directly to the Words collection (not the Frontier).
    /// Assigns a new valid ObjectId if the word has an empty or non-ObjectId Id.
    /// Mirrors the test behavior of the old WordRepositoryMock.Add.
    /// </summary>
    public async Task<Word> Add(Word word)
    {
        if (string.IsNullOrEmpty(word.Id) || !ObjectId.TryParse(word.Id, out _))
        {
            word.Id = ObjectId.GenerateNewId().ToString();
        }

        var wordsCollection = _context.Db.GetCollection<Word>("WordsCollection");
        await wordsCollection.InsertOneAsync(word);
        return word;
    }

    /// <summary>
    /// Adds a single word directly to the Frontier (not the Words collection).
    /// Assigns a new Id if the word has no valid ObjectId.
    /// </summary>
    public async Task<Word> AddFrontier(Word word)
    {
        if (string.IsNullOrEmpty(word.Id) || !ObjectId.TryParse(word.Id, out _))
        {
            word.Id = ObjectId.GenerateNewId().ToString();
        }

        await _repo.AddFrontier([word]);
        return word;
    }

    /// <summary>
    /// Removes all words and all frontier entries for a given project.
    /// Used for test cleanup between test cases.
    /// </summary>
    public async Task DeleteAllWords(string projectId)
    {
        await _repo.DeleteAllFrontierWords(projectId);
        var allWords = await _repo.GetAllWords(projectId);
        var wordsCollection = _context.Db.GetCollection<Word>("WordsCollection");
        var filterDef = new FilterDefinitionBuilder<Word>();
        var filter = filterDef.Eq(w => w.ProjectId, projectId);
        await wordsCollection.DeleteManyAsync(filter);
    }

    /// <summary>
    /// Sets a delay to be awaited on the first call to <see cref="GetAllFrontier"/>.
    /// Used for concurrency testing in MergeServiceTests.
    /// </summary>
    public void SetGetFrontierDelay(Task<bool> delay)
    {
        _getAllFrontierDelay = delay;
        _getAllFrontierCallCount = 0;
    }
}
