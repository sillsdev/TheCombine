using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Word"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class WordRepository(IMongoDbContext dbContext) : IWordRepository
    {
        private readonly IMongoDbContext _dbContext = dbContext;
        private readonly IMongoCollection<Word> _frontier = dbContext.Db.GetCollection<Word>("FrontierCollection");
        private readonly IMongoCollection<Word> _words = dbContext.Db.GetCollection<Word>("WordsCollection");

        private const string otelTagName = "otel.WordRepository";

        /// <summary>
        /// Creates a mongo filter for all words in a specified project (and optionally with specified vernacular).
        /// Since a variant in FieldWorks can export as an entry without any senses, filters out 0-sense words.
        /// </summary>
        private static FilterDefinition<Word> GetAllProjectWordsFilter(string projectId, string? vernacular = null)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return (vernacular is null)
                ? filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.SizeGt(w => w.Senses, 0))
                : filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.SizeGt(w => w.Senses, 0),
                    filterDef.Eq(w => w.Vernacular, vernacular));
        }

        /// <summary> Creates a mongo filter for words in a specified project with specified wordId. </summary>
        private static FilterDefinition<Word> GetProjectWordFilter(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.Eq(w => w.Id, wordId));
        }

        /// <summary> Creates a mongo filter for project words with specified wordId and audio. </summary>
        private static FilterDefinition<Word> GetProjectWordWithAudioFilter(
            string projectId, string wordId, string fileName)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.Eq(w => w.Id, wordId),
                filterDef.ElemMatch(w => w.Audio, a => a.FileName == fileName));
        }

        /// <summary> Creates a mongo filter for words in a specified project with specified wordIds. </summary>
        private static FilterDefinition<Word> GetProjectWordsFilter(string projectId, List<string> wordIds)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.In(w => w.Id, wordIds));
        }

        /// <summary> Finds all <see cref="Word"/>s with specified projectId </summary>
        public async Task<List<Word>> GetAllWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all words");

            return await _words.Find(GetAllProjectWordsFilter(projectId)).ToListAsync();
        }

        /// <summary> Finds <see cref="Word"/> with specified wordId and projectId </summary>
        public async Task<Word?> GetWord(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a word");

            var wordList = await _words.FindAsync(GetProjectWordFilter(projectId, wordId));
            try
            {
                return await wordList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Finds project <see cref="Word"/>s with specified ids </summary>
        private async Task<List<Word>> GetWordsWithSession(IClientSessionHandle session,
            string projectId, List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting words");

            return wordIds.Count == 0
                ? []
                : await _words.Find(session, GetProjectWordsFilter(projectId, wordIds)).ToListAsync();
        }

        /// <summary> Removes all <see cref="Word"/>s from the Frontier for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all words from Frontier");

            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.Eq(x => x.ProjectId, projectId);

            var deleted = await _frontier.DeleteManyAsync(filter);
            return deleted.DeletedCount != 0;
        }

        private async Task<List<Word>> CreateWithSession(IClientSessionHandle session, List<Word> words)
        {
            if (words.Count == 0)
            {
                return words;
            }

            words.ForEach(w => w.Id = "");
            await _words.InsertManyAsync(session, words);
            await _frontier.InsertManyAsync(session, words);
            return words;
        }

        /// <summary> Adds a <see cref="Word"/> to the WordsCollection and Frontier </summary>
        /// <remarks>
        /// Clears Id to be generated by the database.
        /// </remarks>
        /// <returns> The word created </returns>
        public async Task<Word> RepoCreate(Word word)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating a word in WordsCollection and Frontier");

            return (await RepoCreate([word])).First();
        }

        /// <summary> Adds <see cref="Word"/>s to the WordsCollection and Frontier </summary>
        /// <remarks>
        /// Clears Ids to be generated by the database.
        /// </remarks>
        /// <returns> The words created </returns>
        public async Task<List<Word>> RepoCreate(List<Word> words)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating words in WordsCollection and Frontier");

            return words.Count == 0
                ? []
                : await _dbContext.ExecuteWithTransaction(async s => await CreateWithSession(s, words));
        }

        /// <summary>
        /// Replaces a Frontier <see cref="Word"/> with an updated copy in both collections.
        /// </summary>
        /// <remarks>
        /// Removes the existing Frontier word identified by <paramref name="word"/>'s Id and ProjectId, modifies the
        /// provided word based on the removed word using <paramref name="modifyNewWordFromOldWord"/>, clears the ID,
        /// and adds the modified word to WordsCollection and Frontier.
        /// </remarks>
        private async Task<Word?> RepoUpdateFrontierWithSession(IClientSessionHandle session,
            Word word, bool createIfNotFound, Action<Word, Word?> modifyNewWordFromOldWord)
        {
            // Make sure old word exists in the Frontier.
            var deletedWord =
                await _frontier.FindOneAndDeleteAsync(session, GetProjectWordFilter(word.ProjectId, word.Id));
            if (deletedWord is null && !createIfNotFound)
            {
                return null;
            }

            modifyNewWordFromOldWord(word, deletedWord?.Clone());
            await CreateWithSession(session, [word]);
            return word;
        }


        public async Task<Word?> RepoUpdateFrontier(string projectId, string wordId, Action<Word> modifyWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "updating a word in WordsCollection and Frontier, deleting old word from Frontier");

            return await _dbContext.ExecuteWithTransactionAllowNull(async session =>
                {
                    // Make sure old word exists in the Frontier.
                    var deletedWord =
                        await _frontier.FindOneAndDeleteAsync(session, GetProjectWordFilter(projectId, wordId));
                    if (deletedWord is null)
                    {
                        return null;
                    }

                    var word = deletedWord.Clone();
                    modifyWord(word);
                    await CreateWithSession(session, [word]);
                    return word;
                });
        }

        /// <summary>
        /// Replaces a Frontier <see cref="Word"/> with an updated copy in both collections.
        /// </summary>
        /// <remarks>
        /// Removes the existing Frontier word identified by <paramref name="word"/>'s Id and ProjectId, modifies the
        /// provided word based on the removed word using <paramref name="modifyNewWordFromOldWord"/>, clears the ID,
        /// and adds the modified word to WordsCollection and Frontier.
        /// </remarks>
        /// <param name="word"> Updated word. Its Id and ProjectId identify the Frontier word to replace. </param>
        /// <param name="modifyNewWordFromOldWord"> Action to modify the new word based on the old word. </param>
        /// <returns> The updated word added to both collections, or null if no Frontier word was found. </returns>
        public async Task<Word?> RepoUpdateFrontier(Word word, Action<Word, Word?> modifyNewWordFromOldWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "creating word in WordsCollection and Frontier, deleting old word from Frontier");

            return await _dbContext.ExecuteWithTransactionAllowNull(
                async s => await RepoUpdateFrontierWithSession(s, word, false, modifyNewWordFromOldWord));
        }

        public async Task<List<Word>?> RepoReplaceFrontier(string projectId, List<Word> newWords,
            List<string> idsToDelete, Action<Word, Word?> modifyUpdatedWord, Action<Word> modifyDeletedWord)
        {
            if (newWords.Count == 0 && idsToDelete.Count == 0)
            {
                return [];
            }

            if (newWords.Any(w => w.ProjectId != projectId))
            {
                throw new ArgumentException("All new words must have the specified projectId");
            }

            var oldIdSet = idsToDelete.ToHashSet();

            return await _dbContext.ExecuteWithTransactionAllowNull(async session =>
                {
                    // Update the new words
                    foreach (var word in newWords)
                    {
                        oldIdSet.Remove(word.Id);
                        if (await RepoUpdateFrontierWithSession(session, word, true, modifyUpdatedWord) is null)
                        {
                            return null;
                        }
                    }

                    // Delete any remaining old words that weren't updated with a new word
                    await RepoDeleteFrontierWithSession(session, projectId, oldIdSet, modifyDeletedWord);
                    return newWords;
                });
        }

        public async Task<List<Word>> RepoRevertReplaceFrontier(
            string projectId, List<string> idsToRestore, List<string> idsToDelete, Action<Word> modifyDeletedWord)
        {
            if (idsToRestore.Count == 0 && idsToDelete.Count == 0)
            {
                return [];
            }

            var restoreSet = idsToRestore.ToHashSet();
            var deleteSet = idsToDelete.ToHashSet();
            if (deleteSet.Intersect(restoreSet).Any())
            {
                throw new ArgumentException("Ids to delete and restore must be disjoint");
            }

            return await _dbContext.ExecuteWithTransaction(async session =>
                {
                    var restoredWords = await RepoRestoreFrontierWithSession(session, projectId, restoreSet.ToList());
                    if (restoredWords.Count != restoreSet.Count)
                    {
                        throw new ArgumentException("Some ids to be restored were not found");
                    }

                    await RepoDeleteFrontierWithSession(session, projectId, deleteSet, modifyDeletedWord);
                    return restoredWords;
                });
        }

        /// <remarks> This will throw if any of the words has Deleted status or an Id already in the Frontier </remarks>
        private async Task<List<Word>> RepoAddFrontierWithSession(IClientSessionHandle session, List<Word> words)
        {
            if (words.Count == 0)
            {
                return words;
            }

            if (words.Any(w => w.Accessibility == Status.Deleted))
            {
                throw new ArgumentException("Cannot add a word with Deleted status to Frontier");
            }

            await _frontier.InsertManyAsync(session, words);
            return words;
        }

        private async Task RepoDeleteFrontierWithSession(IClientSessionHandle session,
            string projectId, HashSet<string> wordIds, Action<Word> modifyWord)
        {
            foreach (var id in wordIds)
            {
                await RepoDeleteFrontierWithSession(session, projectId, id, modifyWord);
            }
        }

        private async Task<Word?> RepoDeleteFrontierWithSession(IClientSessionHandle session,
            string projectId, string wordId, Action<Word> modifyWord)
        {
            var deletedWord = await _frontier.FindOneAndDeleteAsync(session, GetProjectWordFilter(projectId, wordId));
            if (deletedWord is null)
            {
                return null;
            }

            var modifiedWord = deletedWord.Clone();
            modifyWord(modifiedWord);
            modifiedWord.Id = "";
            await _words.InsertOneAsync(session, modifiedWord);
            return modifiedWord;
        }

        /// <summary>
        /// Removes a <see cref="Word"/> from the Frontier, modifies it, and adds it to the WordsCollection.
        /// </summary>
        /// <remarks>
        /// Id is cleared before it is added to WordsCollection.
        /// </remarks>
        /// <param name="projectId"> Id of the project containing the Frontier word. </param>
        /// <param name="wordId"> Id of the Frontier word to remove. </param>
        /// <param name="modifyWord">
        /// Action that modifies the removed Frontier word before it is added to WordsCollection.
        /// </param>
        /// <returns>
        /// The modified word added to WordsCollection, or null if no matching Frontier word was found to remove.
        /// </returns>
        public async Task<Word?> RepoDeleteFrontier(string projectId, string wordId, Action<Word> modifyWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "adding word to WordsCollection, deleting word from Frontier");

            return await _dbContext.ExecuteWithTransactionAllowNull(
                async s => await RepoDeleteFrontierWithSession(s, projectId, wordId, modifyWord)
            );
        }

        /// <summary> Checks if Words collection for specified <see cref="Project"/> has any words. </summary>
        public async Task<bool> HasWords(string projectId)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "checking if WordsCollection has words");

            return await _words.Find(GetAllProjectWordsFilter(projectId)).Limit(1).AnyAsync();
        }

        /// <summary> Checks if Frontier for specified <see cref="Project"/> has any words. </summary>
        public async Task<bool> HasFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier has words");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId)).Limit(1).AnyAsync();
        }

        /// <summary> Checks if specified word is in Frontier for specified <see cref="Project"/> </summary>
        public async Task<bool> IsInFrontier(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains a word");

            return await AreInFrontier(projectId, [wordId], 1);
        }

        /// <summary> Checks if given words are in the project Frontier. </summary>
        /// <param name="projectId"> Id of project to check in. </param>
        /// <param name="wordIds"> Ids of words to check for. </param>
        /// <param name="count"> Minimum number of words required. </param>
        public async Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains words");

            return await _frontier
                .CountDocumentsAsync(GetProjectWordsFilter(projectId, wordIds), new() { Limit = count }) == count;
        }

        /// <summary> Gets number of <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        public async Task<int> GetFrontierCount(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting count of Frontier");

            return (int)await _frontier.CountDocumentsAsync(GetAllProjectWordsFilter(projectId));
        }

        /// <summary> Finds all <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        public async Task<List<Word>> GetAllFrontier(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all Frontier words");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId)).ToListAsync();
        }

        /// <summary> Gets a specified <see cref="Word"/> from the Frontier </summary>
        /// <returns> The word, or null if not found. </returns>
        public async Task<Word?> GetFrontier(string projectId, string wordId, string? audioFileName = null)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a word from Frontier");

            return string.IsNullOrEmpty(audioFileName)
                ? await _frontier.Find(GetProjectWordFilter(projectId, wordId)).FirstOrDefaultAsync()
                : await _frontier.Find(GetProjectWordWithAudioFilter(projectId, wordId, audioFileName))
                    .FirstOrDefaultAsync();
        }

        /// <summary> Finds all <see cref="Word"/>s in project Frontier with specified vernacular </summary>
        public async Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "getting all words from Frontier with vern");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId, vernacular)).ToListAsync();
        }

        /// <summary> Restores non-Frontier words to the Frontier </summary>
        /// <returns> The restored words </returns>
        private async Task<List<Word>> RepoRestoreFrontierWithSession(IClientSessionHandle session,
            string projectId, List<string> wordIds)
        {
            var wordsToRestore = await GetWordsWithSession(session, projectId, wordIds);
            await RepoAddFrontierWithSession(session, wordsToRestore);
            return wordsToRestore;
        }

        /// <summary> Restores non-Frontier words to the Frontier </summary>
        /// <returns> The restored words </returns>
        public async Task<List<Word>> RepoRestoreFrontier(string projectId, List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "restoring words to Frontier");

            return wordIds.Count == 0
                ? []
                : await _dbContext.ExecuteWithTransaction(
                    async s => await RepoRestoreFrontierWithSession(s, projectId, wordIds));
        }

        /// <summary> Adds a list of <see cref="Word"/>s only to the Frontier </summary>
        /// <param name="words"></param>
        /// <returns> The words created </returns>
        public async Task<List<Word>> AddFrontier(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding words to Frontier");

            if (words.Count == 0)
            {
                return words;
            }

            await _frontier.InsertManyAsync(words);
            return words;
        }

        /// <summary>
        /// Counts the number of Frontier words that have the specified semantic domain.
        /// </summary>
        /// <param name="projectId"> The project id </param>
        /// <param name="domainId"> The semantic domain id </param>
        /// <returns> The count of words containing at least one sense with the specified domain. </returns>
        public async Task<int> CountFrontierWordsWithDomain(string projectId, string domainId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "counting frontier words with domain");

            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.And(
                filterDef.Eq(w => w.ProjectId, projectId),
                filterDef.ElemMatch(w => w.Senses, s => s.SemanticDomains.Any(sd => sd.Id == domainId)));

            return (int)await _frontier.CountDocumentsAsync(filter);
        }

        // WITH-SESSION HELPER METHODS

        // TODO: Move them all here.

    }
}
