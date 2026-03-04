using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Otel;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Word"/>s </summary>
    public class WordService(IWordRepository wordRepo) : IWordService
    {
        private readonly IWordRepository _wordRepo = wordRepo;

        private const string otelTagName = "otel.WordService";

        /// <summary> Ensure given userId is most recent in EditedBy list. </summary>
        private static Word PrepEditedData(string userId, Word word)
        {
            if (!string.IsNullOrEmpty(userId) && userId != word.EditedBy.LastOrDefault(""))
            {
                word.EditedBy.Add(userId);
            }
            return word;
        }

        /// <summary> Creates a new word with updated edited data. </summary>
        /// <returns> The created word </returns>
        public async Task<Word> Create(string userId, Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a word");

            return await _wordRepo.Create(PrepEditedData(userId, word));
        }

        /// <summary> Creates new words with updated edited data. </summary>
        /// <returns> The created words </returns>
        public async Task<List<Word>> Create(string userId, List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating words");

            return await _wordRepo.Create(words.Select(w => PrepEditedData(userId, w)).ToList());
        }

        /// <summary> Removes audio with specified fileName from a Frontier word </summary>
        /// <returns> Updated word, or null if not found </returns>
        public async Task<Word?> DeleteAudio(string projectId, string userId, string wordId, string fileName)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting an audio");

            var wordWithAudioToDelete = (await _wordRepo.GetFrontier(projectId, wordId, fileName))?.Clone();
            if (wordWithAudioToDelete is null)
            {
                return null;
            }

            wordWithAudioToDelete.Audio.RemoveAll(a => a.FileName == fileName);
            return await Update(userId, wordWithAudioToDelete);
        }

        /// <summary> Removes word from Frontier and adds a Deleted copy in the words collection </summary>
        /// <returns> A string: id of deleted word, or null if not found </returns>
        public async Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a word from Frontier");

            var deletedWord = await _wordRepo.ModifyAndDeleteFrontier(projectId, wordId, word =>
            {
                word.Accessibility = Status.Deleted;
                return PrepEditedData(userId, word);
            });

            return deletedWord?.Id;
        }

        /// <summary> Restores words to the Frontier that aren't in the Frontier </summary>
        /// <remarks>
        /// Aborts if any word can't be restored for any of the following reasons:
        /// doesn't exist; has Status.Deleted; or is already in the Frontier
        /// </remarks>
        /// <returns> A bool: true if all successfully restored; false if none restored. </returns>
        public async Task<bool> RestoreFrontierWords(string projectId, List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "restoring words to Frontier");

            // Allow calls that don't specify any wordIds, but don't do any work.
            if (wordIds.Count == 0)
            {
                return true;
            }

            wordIds = wordIds.Distinct().ToList();

            // Make sure none of the words are in the Frontier.
            if (await _wordRepo.AreInFrontier(projectId, wordIds, 1))
            {
                return false;
            }

            // Make sure all the words exist and are valid.
            var wordsToRestore = await _wordRepo.GetWords(projectId, wordIds);
            if (wordsToRestore.Count != wordIds.Count)
            {
                return false;
            }
            if (wordsToRestore.Any(w => w.Accessibility == Status.Deleted))
            {
                // We should be restoring words that were removed from the Frontier,
                // and not their "Deleted" copies in the words collection.
                return false;
            }

            await _wordRepo.AddFrontier(wordsToRestore);
            return true;
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <returns> Updated word, or null if word-to-update not found </returns>
        public async Task<Word?> Update(string userId, Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a word in Frontier");

            var oldWordId = word.Id; // Capture the id to update the correct word.
            PrepEditedData(userId, word);
            word.Id = oldWordId;
            return await _wordRepo.Update(word);
        }

        /// <summary> Checks if a word being added is a duplicate of a preexisting word. </summary>
        /// <returns> The id string of the existing word, or null if none. </returns>
        public async Task<string?> FindContainingWord(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking for duplicates of a word");

            var wordsWithVern = await _wordRepo.GetFrontierWithVernacular(word.ProjectId, word.Vernacular);
            var duplicatedWord = wordsWithVern.Find(w => w.Contains(word));
            return duplicatedWord?.Id;
        }
    }
}
