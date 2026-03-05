using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Models;

namespace BackendFramework.Interfaces
{
    public interface IWordRepository
    {
        Task<List<Word>> GetAllWords(string projectId);
        Task<Word?> GetWord(string projectId, string wordId);
        Task<List<Word>> GetWords(string projectId, List<string> wordIds);
        Task<Word> RepoCreate(Word word);
        Task<List<Word>> RepoCreate(List<Word> words);
        Task<Word> Create(Word word, bool clearModified = true);
        Task<List<Word>> Create(List<Word> words, bool clearModified = true);
        Task<Word?> RepoUpdateFrontier(Word word, Action<Word, Word> modifyNewWordFromOldWord);
        Task<Word?> Update(Word word);
        Task<List<Word>?> RepoReplaceFrontier(string projectId, List<Word> newWords,
            List<string> idsToDelete, Action<Word, Word> modifyUpdatedWord, Action<Word> modifyDeletedWord);
        Task<List<Word>> RepoRevertReplaceFrontier(string projectId, List<string> idsToRestore,
            List<string> idsToDelete, Action<Word> modifyDeletedWord);
        Task<Word?> RepoDeleteFrontier(string projectId, string wordId, Action<Word> modifyWord);
        Task<Word?> ModifyAndDeleteFrontier(string projectId, string wordId, Func<Word, Word> modifyWord);
        Task<bool> DeleteAllFrontierWords(string projectId);
        Task<bool> HasWords(string projectId);
        Task<bool> HasFrontierWords(string projectId);
        Task<bool> IsInFrontier(string projectId, string wordId);
        Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count);
        Task<int> GetFrontierCount(string projectId);
        Task<List<Word>> GetAllFrontier(string projectId);
        Task<Word?> GetFrontier(string projectId, string wordId, string? audioFileName = null);
        Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular);
        Task<List<Word>> RepoRestoreFrontier(string projectId, List<string> wordIds);
        Task<List<Word>> AddFrontier(List<Word> words);
        Task<int> CountFrontierWordsWithDomain(string projectId, string domainId);
    }
}
