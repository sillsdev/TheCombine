using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
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
        public async Task<List<Word>> GetWords(string projectId, List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "getting words");

            return await _words.Find(GetProjectWordsFilter(projectId, wordIds)).ToListAsync();
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

        /// <summary>
        /// Clears Id to be generated by the database.
        /// Adds Created time if blank.
        /// Updates Modified time to now if blank or if clearModified is true.
        /// </summary>
        private static void ClearIdAndUpdateTimes(Word word, bool clearModified)
        {
            word.Id = "";
            if (string.IsNullOrEmpty(word.Created))
            {
                // Use Roundtrip-suitable ISO 8601 format.
                word.Created = Time.UtcNowIso8601();
            }
            if (clearModified || string.IsNullOrEmpty(word.Modified))
            {
                word.Modified = Time.UtcNowIso8601();
            }
        }

        /// <summary> Adds a <see cref="Word"/> to the WordsCollection and Frontier </summary>
        /// <remarks>
        /// Generates a new Id for the word.
        /// If the Created or Modified time fields are blank, they will automatically calculated using the current
        /// time. This allows services to set or clear the values before creation to control these fields.
        /// </remarks>
        /// <returns> The word created </returns>
        public async Task<Word> Create(Word word, bool clearModified = true)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating a word in WordsCollection and Frontier");

            ClearIdAndUpdateTimes(word, clearModified);
            using var transaction = await _dbContext.BeginTransaction();
            try
            {
                await _words.InsertOneAsync(transaction.Session, word);
                await _frontier.InsertOneAsync(transaction.Session, word);
                await transaction.CommitTransactionAsync();
            }
            catch
            {
                await transaction.AbortTransactionAsync();
                throw;
            }
            return word;
        }

        /// <summary> Adds a list of <see cref="Word"/>s to the WordsCollection and Frontier </summary>
        /// <remarks>
        /// Generates new Ids for the words.
        /// If the Created or Modified time fields are blank, they will automatically calculated using the current
        /// time. This allows services to set or clear the values before creation to control these fields.
        /// </remarks>
        /// <returns> The words created </returns>
        public async Task<List<Word>> Create(List<Word> words, bool clearModified = true)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "creating words in WordsCollection and Frontier");

            if (words.Count == 0)
            {
                return words;
            }
            foreach (var w in words)
            {
                ClearIdAndUpdateTimes(w, clearModified);
            }
            using var transaction = await _dbContext.BeginTransaction();
            try
            {
                await _words.InsertManyAsync(transaction.Session, words);
                await _frontier.InsertManyAsync(transaction.Session, words);
                await transaction.CommitTransactionAsync();
            }
            catch
            {
                await transaction.AbortTransactionAsync();
                throw;
            }
            return words;
        }

        /// <summary>
        /// Replaces a Frontier <see cref="Word"/> with an updated copy in both collections.
        /// </summary>
        /// <remarks>
        /// Removes the existing Frontier word identified by <paramref name="word"/>'s Id and ProjectId, appends that
        /// removed Id to History if needed, preserves the original Created time, generates a new Id, and updates
        /// Modified to the current time.
        /// If an imported word used citation-form Vernacular, UsingCitationForm is kept true only when Vernacular is
        /// unchanged.
        /// </remarks>
        /// <param name="word"> Updated word. Its Id and ProjectId identify the existing Frontier word to replace. </param>
        /// <returns> The updated word added to both collections, or null if no matching Frontier word was found. </returns>
        public async Task<Word?> Update(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "creating word in WordsCollection and Frontier, deleting old word from Frontier");

            using var transaction = await _dbContext.BeginTransaction();
            try
            {
                // Make sure old word exists in the Frontier.
                var deletedWord = await _frontier.FindOneAndDeleteAsync(
                    transaction.Session, GetProjectWordFilter(word.ProjectId, word.Id));
                if (deletedWord is null)
                {
                    await transaction.AbortTransactionAsync();
                    return null;
                }

                // Move id to history and update times.
                if (!word.History.Contains(word.Id))
                {
                    word.History.Add(word.Id);
                }
                word.Created = deletedWord.Created;
                ClearIdAndUpdateTimes(word, clearModified: true);

                // If an imported word was using the citation form for its Vernacular,
                // only keep UsingCitationForm true if the Vernacular hasn't changed.
                word.UsingCitationForm &= word.Vernacular == deletedWord.Vernacular;

                // Add word to both collections.
                await _words.InsertOneAsync(transaction.Session, word);
                await _frontier.InsertOneAsync(transaction.Session, word);

                await transaction.CommitTransactionAsync();
            }
            catch
            {
                await transaction.AbortTransactionAsync();
                throw;
            }
            return word;
        }

        /// <summary>
        /// Removes a <see cref="Word"/> from the Frontier, modifies it, and adds it to the WordsCollection.
        /// </summary>
        /// <remarks>
        /// The removed Frontier word is passed to <paramref name="modifyWord"/>.
        /// The resulting word has <paramref name="wordId"/> appended to History, receives a new Id, and has its
        /// Created and Modified times normalized (Created is set when blank; Modified is set to current time).
        /// </remarks>
        /// <param name="projectId"> Id of the project containing the Frontier word. </param>
        /// <param name="wordId"> Id of the Frontier word to remove. </param>
        /// <param name="modifyWord">
        /// Function that takes the removed Frontier word and returns the word to add to WordsCollection.
        /// </param>
        /// <returns>
        /// The modified word added to WordsCollection, or null if no matching Frontier word was found to remove.
        /// </returns>
        public async Task<Word?> ModifyAndDeleteFrontier(string projectId, string wordId, Func<Word, Word> modifyWord)
        {
            using var activity = OtelService.StartActivityWithTag(
                otelTagName, "adding word to WordsCollection, deleting word from Frontier");

            using var transaction = await _dbContext.BeginTransaction();
            try
            {
                var deletedWord = await _frontier.FindOneAndDeleteAsync(
                    transaction.Session, GetProjectWordFilter(projectId, wordId));
                if (deletedWord is null)
                {
                    await transaction.AbortTransactionAsync();
                    return null;
                }

                var modifiedWord = modifyWord(deletedWord.Clone());
                modifiedWord.History.Add(wordId);
                ClearIdAndUpdateTimes(modifiedWord, clearModified: true);
                await _words.InsertOneAsync(transaction.Session, modifiedWord);
                await transaction.CommitTransactionAsync();

                return modifiedWord;
            }
            catch
            {
                await transaction.AbortTransactionAsync();
                throw;
            }
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

        /// <summary> Finds all <see cref="Word"/>s in Frontier of specified project with specified vern </summary>
        public async Task<List<Word>> GetFrontierWithVernacular(string projectId, string vernacular)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "getting all words from Frontier with vern");

            return await _frontier.Find(GetAllProjectWordsFilter(projectId, vernacular)).ToListAsync();
        }

        /// <summary> Adds a <see cref="Word"/> only to the Frontier </summary>
        /// <param name="word"></param>
        /// <returns> The word created </returns>
        public async Task<Word> AddFrontier(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding a word to Frontier");

            await _frontier.InsertOneAsync(word);
            return word;
        }

        /// <summary> Adds a list of <see cref="Word"/>s only to the Frontier </summary>
        /// <param name="words"></param>
        /// <returns> The words created </returns>
        public async Task<List<Word>> AddFrontier(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "adding words to Frontier");

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
    }
}
