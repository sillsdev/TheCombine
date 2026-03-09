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

        // GET FILTER HELPER METHODS

        /// <summary>
        /// Creates a mongo filter for all words in a specified project (and optionally with specified vernacular).
        /// Since a variant in FieldWorks can export as an entry without any senses, filters out 0-sense words.
        /// </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <param name="vernacular">Optional vernacular to filter by.</param>
        /// <returns>A filter matching words in the project that have at least one sense.</returns>
        private static FilterDefinition<Word> GetAllProjectWordsFilter(string projectId, string? vernacular = null)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return (vernacular is null)
                ? filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.SizeGt(w => w.Senses, 0))
                : filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.SizeGt(w => w.Senses, 0),
                    filterDef.Eq(w => w.Vernacular, vernacular));
        }

        /// <summary> Creates a mongo filter for words in a specified project with specified wordId. </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <param name="wordId">Id of the word to match.</param>
        /// <returns>A filter matching the requested project and word id.</returns>
        private static FilterDefinition<Word> GetProjectWordFilter(string projectId, string wordId)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.Eq(w => w.Id, wordId));
        }

        /// <summary> Creates a mongo filter for project words with specified wordId and audio. </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <param name="wordId">Id of the word to match.</param>
        /// <param name="fileName">Audio file name that must exist on the word.</param>
        /// <returns>A filter matching the requested project, word id, and audio file.</returns>
        private static FilterDefinition<Word> GetProjectWordWithAudioFilter(
            string projectId, string wordId, string fileName)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.Eq(w => w.Id, wordId),
                filterDef.ElemMatch(w => w.Audio, a => a.FileName == fileName));
        }

        /// <summary> Creates a mongo filter for words in a specified project with specified wordIds. </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <param name="wordIds">Ids of words to match.</param>
        /// <returns>A filter matching the requested project and any of the provided word ids.</returns>
        private static FilterDefinition<Word> GetProjectWordsFilter(string projectId, IEnumerable<string> wordIds)
        {
            var filterDef = new FilterDefinitionBuilder<Word>();
            return filterDef.And(filterDef.Eq(w => w.ProjectId, projectId), filterDef.In(w => w.Id, wordIds));
        }

        // PUBLIC REPOSITORY METHODS

        /// <summary> Finds all <see cref="Word"/>s with specified projectId </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <returns>All project words with at least one sense.</returns>
        public async Task<List<Word>> GetAllWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all words");

            return await _words.Find(GetAllProjectWordsFilter(projectId)).ToListAsync();
        }

        /// <summary> Finds <see cref="Word"/> with specified wordId and projectId </summary>
        /// <param name="projectId">Id of the project containing the word.</param>
        /// <param name="wordId">Id of the word to retrieve.</param>
        /// <returns>The matching word, or null if not found.</returns>
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

        /// <summary> Removes all <see cref="Word"/>s from the Frontier for specified <see cref="Project"/> </summary>
        /// <param name="projectId">Id of the project whose Frontier words should be removed.</param>
        /// <returns>True if at least one Frontier word was deleted; otherwise false.</returns>
        public async Task<bool> DeleteAllFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting all words from Frontier");

            var filterDef = new FilterDefinitionBuilder<Word>();
            var filter = filterDef.Eq(x => x.ProjectId, projectId);

            var deleted = await _frontier.DeleteManyAsync(filter);
            return deleted.DeletedCount != 0;
        }

        /// <summary> Adds a <see cref="Word"/> to the WordsCollection and Frontier </summary>
        /// <remarks>Clears Id to be generated by the database.</remarks>
        /// <param name="word">The word to add.</param>
        /// <returns>The word created</returns>
        public async Task<Word> Create(Word word)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating a word in WordsCollection and Frontier");

            return (await Create([word])).First();
        }

        /// <summary> Adds <see cref="Word"/>s to the WordsCollection and Frontier </summary>
        /// <remarks>Clears Ids to be generated by the database.</remarks>
        /// <param name="words">Words to add.</param>
        /// <returns>The words created</returns>
        public async Task<List<Word>> Create(List<Word> words)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating words in WordsCollection and Frontier");

            return words.Count == 0
                ? []
                : await _dbContext.ExecuteInTransaction(async s => await CreateWithSession(s, words));
        }

        /// <summary>
        /// Replaces a Frontier <see cref="Word"/> by deleting it from Frontier, applying a modification, and
        /// creating the updated copy in both collections.
        /// </summary>
        /// <param name="projectId">Id of the project containing the Frontier word.</param>
        /// <param name="wordId">Id of the Frontier word to update.</param>
        /// <param name="modifyWord">Action that mutates the cloned Frontier word before it is re-created.</param>
        /// <returns>The updated word, or null if no matching Frontier word exists.</returns>
        public async Task<Word?> UpdateFrontier(string projectId, string wordId, Action<Word> modifyWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "updating a word in WordsCollection and Frontier, deleting old word from Frontier");

            return await _dbContext.ExecuteInTransactionAllowNull(
                async s => await UpdateFrontierWithSession(s, projectId, wordId, modifyWord));
        }

        /// <summary>
        /// Replaces a Frontier <see cref="Word"/> with an updated copy in both collections.
        /// </summary>
        /// <remarks>
        /// Removes the existing Frontier word identified by <paramref name="word"/>'s Id and ProjectId, modifies the
        /// provided word based on the removed word using <paramref name="modifyNewWordFromOldWord"/>, clears the ID,
        /// and adds the modified word to WordsCollection and Frontier.
        /// </remarks>
        /// <param name="word">Updated word. Its Id and ProjectId identify the Frontier word to replace.</param>
        /// <param name="modifyNewWordFromOldWord">Action to modify the new word based on the old word.</param>
        /// <returns>The updated word added to both collections, or null if no Frontier word was found.</returns>
        public async Task<Word?> UpdateFrontier(Word word, Action<Word, Word?> modifyNewWordFromOldWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "creating word in WordsCollection and Frontier, deleting old word from Frontier");

            return await _dbContext.ExecuteInTransactionAllowNull(
                async s => await UpdateFrontierWithSession(s, word, false, modifyNewWordFromOldWord));
        }

        /// <summary>
        /// Replaces and/or deletes Frontier words in a single transaction.
        /// </summary>
        /// <param name="projectId">Id of the project containing the Frontier words.</param>
        /// <param name="newWords">Words that replace existing Frontier words.</param>
        /// <param name="idsToDelete">Ids of Frontier words to delete without replacement.</param>
        /// <param name="modifyUpdatedWord">Action applied when building each replacement word.</param>
        /// <param name="modifyDeletedWord">Action applied to words deleted from Frontier before inserting into WordsCollection.</param>
        /// <returns>
        /// The replacement words when successful, an empty list if no work is needed, or null if replacement fails.
        /// </returns>
        public async Task<List<Word>?> ReplaceFrontier(string projectId, List<Word> newWords,
            List<string> idsToDelete, Action<Word, Word?> modifyUpdatedWord, Action<Word> modifyDeletedWord)
        {
            return (newWords.Count == 0 && idsToDelete.Count == 0)
                ? []
                : await _dbContext.ExecuteInTransactionAllowNull(async s => await ReplaceFrontierWithSession(
                    s, projectId, newWords, idsToDelete, modifyUpdatedWord, modifyDeletedWord));
        }

        /// <summary>
        /// Reverts a previous frontier replacement by deleting added words and restoring removed words.
        /// </summary>
        /// <param name="projectId">Id of the project containing the Frontier words.</param>
        /// <param name="idsToRestore">Ids of WordsCollection words to restore to Frontier.</param>
        /// <param name="idsToDelete">Ids of Frontier words to delete.</param>
        /// <param name="modifyDeletedWord">Action applied before deleted Frontier words are added to WordsCollection.</param>
        /// <returns>True when all requested restores succeed; otherwise false.</returns>
        public async Task<bool> RevertReplaceFrontier(
            string projectId, List<string> idsToRestore, List<string> idsToDelete, Action<Word> modifyDeletedWord)
        {
            return idsToRestore.Count == 0 && idsToDelete.Count == 0
                ? true
                : await _dbContext.ExecuteInTransaction(async s => await RevertReplaceFrontierWithSession(
                    s, projectId, idsToRestore, idsToDelete, modifyDeletedWord));
        }

        /// <summary>
        /// Removes a <see cref="Word"/> from the Frontier, modifies it, and adds it to the WordsCollection.
        /// </summary>
        /// <remarks>Id is cleared before it is added to WordsCollection.</remarks>
        /// <param name="projectId">Id of the project containing the Frontier word.</param>
        /// <param name="wordId">Id of the Frontier word to remove.</param>
        /// <param name="modifyWord">
        /// Action that modifies the removed Frontier word before it is added to WordsCollection.
        /// </param>
        /// <returns>
        /// The modified word added to WordsCollection, or null if no matching Frontier word was found to remove.
        /// </returns>
        public async Task<Word?> DeleteFrontier(string projectId, string wordId, Action<Word> modifyWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "adding word to WordsCollection, deleting word from Frontier");

            return await _dbContext.ExecuteInTransactionAllowNull(
                async s => await DeleteFrontierWithSession(s, projectId, wordId, modifyWord)
            );
        }

        /// <summary> Checks if Words collection for specified <see cref="Project"/> has any words. </summary>
        /// <param name="projectId">Id of the project to check.</param>
        /// <returns>True when at least one word exists in WordsCollection for the project.</returns>
        public async Task<bool> HasWords(string projectId)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "checking if WordsCollection has words");

            return await _words.Find(GetAllProjectWordsFilter(projectId)).Limit(1).AnyAsync();
        }

        /// <summary> Checks if Frontier for specified <see cref="Project"/> has any words. </summary>
        /// <param name="projectId">Id of the project to check.</param>
        /// <returns>True when at least one word exists in Frontier for the project.</returns>
        public async Task<bool> HasFrontierWords(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier has words");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId)).Limit(1).AnyAsync();
        }

        /// <summary> Checks if specified word is in Frontier for specified <see cref="Project"/> </summary>
        /// <param name="projectId">Id of the project to check.</param>
        /// <param name="wordId">Id of the word to check.</param>
        /// <returns>True if the word is currently in Frontier; otherwise false.</returns>
        public async Task<bool> IsInFrontier(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains a word");

            return await AreInFrontier(projectId, [wordId], 1);
        }

        /// <summary> Checks if given words are in the project Frontier. </summary>
        /// <param name="projectId">Id of project to check in.</param>
        /// <param name="wordIds">Ids of words to check for.</param>
        /// <param name="count">Minimum number of words required.</param>
        /// <returns>True if at least <paramref name="count"/> of the specified ids are in Frontier; otherwise false.</returns>
        public async Task<bool> AreInFrontier(string projectId, List<string> wordIds, int count)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking if Frontier contains words");

            return await _frontier
                .CountDocumentsAsync(GetProjectWordsFilter(projectId, wordIds), new() { Limit = count }) == count;
        }

        /// <summary> Gets number of <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <returns>The number of Frontier words in the project.</returns>
        public async Task<int> GetFrontierCount(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting count of Frontier");

            return (int)await _frontier.CountDocumentsAsync(GetAllProjectWordsFilter(projectId));
        }

        /// <summary> Finds all <see cref="Word"/>s in the Frontier for specified <see cref="Project"/> </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <returns>All Frontier words for the project with at least one sense.</returns>
        public async Task<List<Word>> GetAllFrontier(string projectId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting all Frontier words");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId)).ToListAsync();
        }

        /// <summary> Gets a specified <see cref="Word"/> from the Frontier </summary>
        /// <param name="projectId">Id of the project containing the word.</param>
        /// <param name="wordId">Id of the word to retrieve.</param>
        /// <param name="audioFileName">Optional audio filename that must exist on the word when provided.</param>
        /// <returns>The word, or null if not found.</returns>
        public async Task<Word?> GetFrontier(string projectId, string wordId, string? audioFileName = null)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting a word from Frontier");

            return string.IsNullOrEmpty(audioFileName)
                ? await _frontier.Find(GetProjectWordFilter(projectId, wordId)).FirstOrDefaultAsync()
                : await _frontier.Find(GetProjectWordWithAudioFilter(projectId, wordId, audioFileName))
                    .FirstOrDefaultAsync();
        }

        /// <summary> Finds all <see cref="Word"/>s in project Frontier with specified vernacular </summary>
        /// <param name="projectId">Id of the project to query.</param>
        /// <param name="vernacular">Vernacular value to match.</param>
        /// <returns>All Frontier words in the project that match the vernacular and have at least one sense.</returns>
        public async Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "getting all words from Frontier with vern");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId, vernacular)).ToListAsync();
        }

        /// <summary> Restores a non-Frontier word to the Frontier </summary>
        /// <param name="projectId">Id of the project containing the word.</param>
        /// <param name="wordId">Id of the word to restore.</param>
        /// <returns>True if the word was restored; false if it was not found.</returns>
        public async Task<bool> RestoreFrontier(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "restoring word to Frontier");

            return await _dbContext.ExecuteInTransaction(
                    async s => await RestoreFrontierWithSession(s, projectId, wordId));
        }

        /// <summary> Adds a list of <see cref="Word"/>s only to the Frontier </summary>
        /// <param name="words">Words to add to Frontier.</param>
        /// <returns>The words created</returns>
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
        /// <param name="projectId">The project id</param>
        /// <param name="domainId">The semantic domain id</param>
        /// <returns>The count of words containing at least one sense with the specified domain.</returns>
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

        /// <summary>
        /// Adds words to both WordsCollection and Frontier inside an existing transaction session.
        /// </summary>
        /// <remarks>Each word's Id is cleared so MongoDB generates a new id.</remarks>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="words">Words to add.</param>
        /// <returns>The inserted words.</returns>
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

        /// <summary>
        /// Replaces a Frontier <see cref="Word"/> with an updated copy in both collections.
        /// </summary>
        /// <remarks>
        /// Removes the existing Frontier word identified by <paramref name="word"/>'s Id and ProjectId, modifies the
        /// provided word based on the removed word using <paramref name="modifyNewWordFromOldWord"/>, clears the ID,
        /// and adds the modified word to WordsCollection and Frontier.
        /// </remarks>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="word">Updated word whose Id and ProjectId identify the Frontier word to replace.</param>
        /// <param name="createIfNotFound">Whether to create the word when an existing Frontier word is not found.</param>
        /// <param name="modifyNewWordFromOldWord">Action to modify the new word using the deleted old word.</param>
        /// <returns>The updated word added to both collections, or null when not found and creation is not allowed.</returns>
        private async Task<Word?> UpdateFrontierWithSession(IClientSessionHandle session,
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

        /// <summary>
        /// Replaces a Frontier word by deleting it, applying a modification, and re-creating it in both collections.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project containing the Frontier word.</param>
        /// <param name="wordId">Id of the Frontier word to update.</param>
        /// <param name="modifyWord">Action that mutates the cloned word before it is re-created.</param>
        /// <returns>The updated word, or null if no matching Frontier word was found.</returns>
        private async Task<Word?> UpdateFrontierWithSession(IClientSessionHandle session,
            string projectId, string wordId, Action<Word> modifyWord)
        {

            var deletedWord = await _frontier.FindOneAndDeleteAsync(session, GetProjectWordFilter(projectId, wordId));
            if (deletedWord is null)
            {
                return null;
            }

            var word = deletedWord.Clone();
            modifyWord(word);
            await CreateWithSession(session, [word]);
            return word;
        }

        /// <summary>
        /// Reverts a frontier replacement operation within an existing transaction session.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project containing the Frontier words.</param>
        /// <param name="idsToRestore">Ids of WordsCollection words to restore to Frontier.</param>
        /// <param name="idsToDelete">Ids of Frontier words to delete.</param>
        /// <param name="modifyDeletedWord">Action applied before deleted Frontier words are added to WordsCollection.</param>
        /// <returns>True when all requested restores succeed; otherwise false.</returns>
        /// <exception cref="ArgumentException">Thrown when the restore and delete id sets are not disjoint.</exception>
        private async Task<bool> RevertReplaceFrontierWithSession(IClientSessionHandle session, string projectId,
            IEnumerable<string> idsToRestore, IEnumerable<string> idsToDelete, Action<Word> modifyDeletedWord)
        {
            var restoreSet = idsToRestore.ToHashSet(); // Remove duplicates
            if (restoreSet.Intersect(idsToDelete).Any())
            {
                throw new ArgumentException("Ids to delete and restore must be disjoint");
            }

            await DeleteFrontierWithSession(session, projectId, idsToDelete, modifyDeletedWord);
            foreach (var id in restoreSet)
            {
                if (!await RestoreFrontierWithSession(session, projectId, id))
                {
                    return false;
                }
            }
            return true;
        }

        /// <summary>
        /// Replaces and/or deletes Frontier words within an existing transaction session.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project containing the Frontier words.</param>
        /// <param name="newWords">Words that replace existing Frontier words.</param>
        /// <param name="oldWordIds">Ids of Frontier words that will be replaced or deleted.</param>
        /// <param name="modifyUpdatedWord">Action applied when building each replacement word.</param>
        /// <param name="modifyDeletedWord">Action applied before deleted Frontier words are added to WordsCollection.</param>
        /// <returns>The replacement words, or null if a required update fails.</returns>
        /// <exception cref="ArgumentException">Thrown when a replacement word has a different project id.</exception>
        private async Task<List<Word>?> ReplaceFrontierWithSession(IClientSessionHandle session,
            string projectId, List<Word> newWords, IEnumerable<string> oldWordIds,
            Action<Word, Word?> modifyUpdatedWord, Action<Word> modifyDeletedWord)
        {
            if (newWords.Any(w => w.ProjectId != projectId))
            {
                throw new ArgumentException("All new words must have the specified projectId");
            }

            var oldIdSet = oldWordIds.ToHashSet();

            // Delete the old words from the Frontier, keeping track of the deleted words to modify and add to WordsCollection
            // Update the new words
            foreach (var word in newWords)
            {
                oldIdSet.Remove(word.Id);
                if (await UpdateFrontierWithSession(session, word, true, modifyUpdatedWord) is null)
                {
                    return null;
                }
            }

            // Delete any remaining old words that weren't updated with a new word
            await DeleteFrontierWithSession(session, projectId, oldIdSet, modifyDeletedWord);
            return newWords;
        }

        /// <summary>
        /// Deletes multiple Frontier words, modifies each deleted word, and inserts each into WordsCollection.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project containing the Frontier words.</param>
        /// <param name="wordIds">Ids of Frontier words to delete.</param>
        /// <param name="modifyWord">Action applied before each deleted word is inserted into WordsCollection.</param>
        private async Task DeleteFrontierWithSession(IClientSessionHandle session,
            string projectId, IEnumerable<string> wordIds, Action<Word> modifyWord)
        {
            foreach (var id in wordIds)
            {
                await DeleteFrontierWithSession(session, projectId, id, modifyWord);
            }
        }

        /// <summary>
        /// Deletes a Frontier word, modifies it, and inserts the modified copy into WordsCollection.
        /// </summary>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project containing the Frontier word.</param>
        /// <param name="wordId">Id of the Frontier word to delete.</param>
        /// <param name="modifyWord">Action applied before the deleted word is inserted into WordsCollection.</param>
        /// <returns>The modified word inserted into WordsCollection, or null if no Frontier word was found.</returns>
        private async Task<Word?> DeleteFrontierWithSession(IClientSessionHandle session,
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

        /// <summary> Restores non-Frontier words to the Frontier </summary>
        /// <remarks>Throws if the found word is marked as deleted or if its id is already in Frontier.</remarks>
        /// <param name="session">Mongo transaction session.</param>
        /// <param name="projectId">Id of the project containing the word.</param>
        /// <param name="wordId">Id of the word to restore.</param>
        /// <returns>A bool: true if restored, false if not found</returns>
        private async Task<bool> RestoreFrontierWithSession(IClientSessionHandle session,
            string projectId, string wordId)
        {
            var word = await _words.Find(session, GetProjectWordFilter(projectId, wordId)).FirstOrDefaultAsync();
            if (word is null)
            {
                return false;
            }
            if (word.Accessibility == Status.Deleted)
            {
                throw new ArgumentException("Cannot add a word with Deleted status to Frontier");
            }

            await _frontier.InsertOneAsync(session, word);
            return true;
        }
    }
}
