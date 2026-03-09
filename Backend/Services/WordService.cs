using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
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

        /// <summary>
        /// Adds Created time if blank.
        /// Updates Modified time to now if blank or if updateModified is true.
        /// </summary>
        /// <param name="word">Word to mutate.</param>
        /// <param name="updateModified">
        /// If true, always update the Modified timestamp; otherwise only set it when blank.
        /// </param>
        /// <returns>The mutated word.</returns>
        private static Word UpdateTimes(Word word, bool updateModified)
        {
            if (string.IsNullOrEmpty(word.Created))
            {
                // Use Roundtrip-suitable ISO 8601 format.
                word.Created = Time.UtcNowIso8601();
            }
            if (updateModified || string.IsNullOrEmpty(word.Modified))
            {
                word.Modified = Time.UtcNowIso8601();
            }
            return word;
        }

        /// <summary>
        /// Update the given word's timestamps
        /// and add the given userId to EditedBy if it's not already last on the list.
        /// </summary>
        /// <param name="userId">Id of the user editing the word.</param>
        /// <param name="word">Word to mutate.</param>
        /// <returns>The mutated word.</returns>
        private static Word PrepEditedData(string userId, Word word)
        {
            UpdateTimes(word, updateModified: true);
            if (!string.IsNullOrEmpty(userId) && userId != word.EditedBy.LastOrDefault(""))
            {
                word.EditedBy.Add(userId);
            }
            return word;
        }

        /// <summary>
        /// Creates an action to remove a specified audio file from a word.
        /// </summary>
        /// <param name="userId">Id of the user performing the delete.</param>
        /// <param name="fileName">Name of the audio file to remove.</param>
        /// <returns>An action that updates edit metadata and removes the requested audio file.</returns>
        /// <exception cref="ArgumentException">
        /// Thrown by the returned action when <paramref name="fileName"/> is not found on the word.
        /// </exception>
        private static Action<Word> CreateDeleteAudioAction(string userId, string fileName) =>
            word =>
            {
                PrepEditedData(userId, word);
                if (word.Audio.RemoveAll(a => a.FileName == fileName) == 0)
                {
                    throw new ArgumentException("Audio file name not found on word.");
                }
            };

        /// <summary>
        /// Creates an action to modify the metadata of a deleted Frontier word for saving to the words collection.
        /// </summary>
        /// <param name="userId">Id of the user performing the delete.</param>
        /// <returns>An action that marks a word as deleted and appends its id to history.</returns>
        private static Action<Word> CreateModifyDeletedWordAction(string userId) =>
            word =>
            {
                PrepEditedData(userId, word);
                word.Accessibility = Status.Deleted;
                word.History.Add(word.Id);
            };

        /// <summary>
        /// Creates an action to modify the metadata of an update to a Frontier word.
        /// </summary>
        /// <param name="userId">Id of the user performing the update.</param>
        /// <returns>
        /// An action that updates edit metadata, preserves Created time, and records prior ids in history.
        /// </returns>
        private static Action<Word, Word?> CreateModifyUpdatedWordAction(string userId) =>
            (newWord, oldWord) =>
            {
                PrepEditedData(userId, newWord);

                // Allow use with a new word that has no predecessor.
                if (oldWord is null)
                {
                    return;
                }

                // Add Id to history.
                if (!newWord.History.Contains(newWord.Id))
                {
                    newWord.History.Add(newWord.Id);
                }

                // Preserve Created time.
                newWord.Created = oldWord.Created;

                // If an imported word was using the citation form for its Vernacular,
                // only keep UsingCitationForm true if the Vernacular hasn't changed.
                newWord.UsingCitationForm &= newWord.Vernacular == oldWord.Vernacular;
            };

        /// <summary> Adds a list of <see cref="Word"/>s to the WordsCollection and Frontier. </summary>
        /// <param name="words">Words to import.</param>
        /// <returns>The imported words with timestamps updated.</returns>
        public async Task<List<Word>> ImportWords(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating words in repo");

            return await _wordRepo.Create(words.Select(w => UpdateTimes(w, updateModified: false)).ToList());
        }

        /// <summary> Creates a new word with updated edited data. </summary>
        /// <param name="userId">Id of the user creating the word.</param>
        /// <param name="word">Word to create.</param>
        /// <returns>The created word.</returns>
        public async Task<Word> Create(string userId, Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a word");

            return await _wordRepo.Create(PrepEditedData(userId, word));
        }

        /// <summary> Removes audio with specified fileName from a Frontier word </summary>
        /// <param name="projectId">Id of the project containing the word.</param>
        /// <param name="userId">Id of the user deleting the audio.</param>
        /// <param name="wordId">Id of the Frontier word to update.</param>
        /// <param name="fileName">Name of the audio file to remove.</param>
        /// <returns>Updated word, or null if not found.</returns>
        public async Task<Word?> DeleteAudio(string projectId, string userId, string wordId, string fileName)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting an audio");

            try
            {
                return await _wordRepo.UpdateFrontier(projectId, wordId, CreateDeleteAudioAction(userId, fileName));
            }
            catch (ArgumentException)
            {
                return null;
            }
        }

        /// <summary> Removes word from Frontier and adds a Deleted copy in the words collection </summary>
        /// <param name="projectId">Id of the project containing the Frontier word.</param>
        /// <param name="userId">Id of the user deleting the word.</param>
        /// <param name="wordId">Id of the Frontier word to remove.</param>
        /// <returns>Id of deleted word, or null if not found.</returns>
        public async Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "deleting a word from Frontier");

            return (await _wordRepo.DeleteFrontier(projectId, wordId, CreateModifyDeletedWordAction(userId)))?.Id;
        }

        /// <summary> Restores words to the Frontier that aren't in the Frontier </summary>
        /// <param name="projectId">Id of the project containing the word.</param>
        /// <param name="wordId">Id of the word to restore.</param>
        /// <returns>True if the word is restored; false if it is not found.</returns>
        public async Task<bool> RestoreFrontierWord(string projectId, string wordId)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "restoring words to Frontier");

            return await _wordRepo.RestoreFrontier(projectId, wordId);
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <param name="userId">Id of the user updating the word.</param>
        /// <param name="word">Updated word whose id identifies the Frontier word to replace.</param>
        /// <returns>Updated word, or null if word-to-update not found.</returns>
        public async Task<Word?> Update(string userId, Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a word in Frontier");

            return await _wordRepo.UpdateFrontier(word, CreateModifyUpdatedWordAction(userId));
        }

        /// <summary> Checks if a word being added is a duplicate of a preexisting word. </summary>
        /// <param name="word">Word to compare against existing Frontier words.</param>
        /// <returns>The id string of the existing word, or null if none.</returns>
        public async Task<string?> FindContainingWord(Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "checking for duplicates of a word");

            var wordsWithVern = await _wordRepo.GetFrontierWithVernacular(word.ProjectId, word.Vernacular);
            var duplicatedWord = wordsWithVern.Find(w => w.Contains(word));
            return duplicatedWord?.Id;
        }

        /// <summary>
        /// Replaces merge children in the Frontier with prepared parent words where possible,
        /// creates remaining parents, and deletes remaining children from the Frontier.
        /// </summary>
        /// <param name="projectId">Id of the project containing the merge children and parents.</param>
        /// <param name="userId">Id of the user performing the merge.</param>
        /// <param name="parents">Parent words to create or use as replacements.</param>
        /// <param name="idsToDelete">Ids of merge children to delete from Frontier.</param>
        /// <returns>The updated parent words.</returns>
        public async Task<List<Word>> MergeReplaceFrontier(
            string projectId, string userId, List<Word> parents, List<string> idsToDelete)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "replacing frontier words for merge");

            return await _wordRepo.ReplaceFrontier(projectId, parents, idsToDelete,
                CreateModifyUpdatedWordAction(userId), CreateModifyDeletedWordAction(userId));
        }

        /// <summary>
        /// Reverts a merge replacement by deleting created/replaced frontier words and restoring removed children.
        /// </summary>
        /// <param name="projectId">Id of the project containing the words.</param>
        /// <param name="userId">Id of the user performing the revert.</param>
        /// <param name="idsToRestore">Ids of words to restore to Frontier.</param>
        /// <param name="idsToDelete">Ids of Frontier words to delete.</param>
        /// <returns>True when all requested restores succeed; otherwise false.</returns>
        public async Task<bool> RevertMergeReplaceFrontier(
            string projectId, string userId, List<string> idsToRestore, List<string> idsToDelete)
        {
            using var activity =
                OtelService.StartActivityWithTag(otelTagName, "reverting replaced frontier words for merge");

            return await _wordRepo.RevertReplaceFrontier(
                projectId, idsToRestore, idsToDelete, CreateModifyDeletedWordAction(userId));
        }
    }
}
