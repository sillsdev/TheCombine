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

        private static Word PrepEditedByAndTimes(string userId, Word word)
        {
            UpdateTimes(word, clearModified: true);
            if (!string.IsNullOrEmpty(userId) && userId != word.EditedBy.LastOrDefault(""))
            {
                word.EditedBy.Add(userId);
            }
            return word;
        }

        /// <summary>
        /// Adds Created time if blank.
        /// Updates Modified time to now if blank or if clearModified is true.
        /// </summary>
        private static void UpdateTimes(Word word, bool clearModified)
        {
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

        /// <summary> Adds a list of <see cref="Word"/>s to the WordsCollection and Frontier. </summary>
        public async Task<List<Word>> ImportWords(List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating words in repo");

            words.ForEach(w => UpdateTimes(w, false));
            return await _wordRepo.RepoCreate(words);
        }

        /// <summary> Creates a new word with updated edited data. </summary>
        /// <returns> The created word </returns>
        public async Task<Word> Create(string userId, Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating a word");

            return await _wordRepo.RepoCreate(PrepEditedByAndTimes(userId, word));
        }

        /// <summary> Creates new words with updated edited data. </summary>
        /// <returns> The created words </returns>
        public async Task<List<Word>> Create(string userId, List<Word> words)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "creating words");

            return await _wordRepo.RepoCreate(words.Select(w => PrepEditedByAndTimes(userId, w)).ToList());
        }

        /// <summary>
        /// Replaces merge children in the Frontier with prepared parent words where possible,
        /// creates remaining parents, and deletes remaining children from the Frontier.
        /// </summary>
        /// <remarks>
        /// Mirrors the current merge-side effects of combining Update, Create, and DeleteFrontierWord:
        /// updated parents preserve old Created and add old Id to History; created parents get edited/times;
        /// deleted children are written back as Deleted words with edited/times/history updates.
        /// </remarks>
        public async Task<List<Word>?> MergeReplaceFrontier(
            string projectId, string userId, List<Word> parents, List<string> idsToDelete)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "replacing frontier words for merge");

            return await _wordRepo.RepoReplaceFrontier(projectId, parents.Select(p => PrepEditedByAndTimes(userId, p)).ToList(),
                idsToDelete, (newWord, oldWord) =>
                {
                    if (oldWord is null)
                    {
                        return;
                    }
                    // Move id to history and update times.
                    if (!newWord.History.Contains(newWord.Id))
                    {
                        newWord.History.Add(newWord.Id);
                    }
                    newWord.Created = oldWord.Created;

                    // If an imported word was using the citation form for its Vernacular,
                    // only keep UsingCitationForm true if the Vernacular hasn't changed.
                    newWord.UsingCitationForm &= newWord.Vernacular == oldWord.Vernacular;
                },
                deletedWord =>
                {
                    deletedWord.Accessibility = Status.Deleted;
                    deletedWord.History.Add(deletedWord.Id);
                    PrepEditedByAndTimes(userId, deletedWord);
                });
        }

        public async Task<List<Word>?> RevertMergeReplaceFrontier(string projectId, string userId, List<string> idsToRestore, List<string> idsToDelete)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "reverting replaced frontier words for merge");

            return await _wordRepo.RepoRevertReplaceFrontier(projectId, idsToRestore, idsToDelete, deletedWord =>
            {
                deletedWord.Accessibility = Status.Deleted;
                deletedWord.History.Add(deletedWord.Id);
                PrepEditedByAndTimes(userId, deletedWord);
            });
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

            var deletedWord = await _wordRepo.RepoDeleteFrontier(projectId, wordId, word =>
            {
                word.Accessibility = Status.Deleted;
                word.History.Add(wordId);
                PrepEditedByAndTimes(userId, word);
            });

            return deletedWord?.Id;
        }

        /// <summary> Restores words to the Frontier that aren't in the Frontier </summary>
        /// <remarks>
        /// Deduplicates ids and delegates validation/transaction handling to RepoRestoreFrontier.
        /// </remarks>
        public async Task<bool> RestoreFrontierWords(string projectId, List<string> wordIds)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "restoring words to Frontier");

            wordIds = wordIds.Distinct().ToList();

            if (wordIds.Count == 0)
            {
                return true;
            }

            var restoredWords = await _wordRepo.RepoRestoreFrontier(projectId, wordIds);
            return restoredWords.Count == wordIds.Count;
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <returns> Updated word, or null if word-to-update not found </returns>
        public async Task<Word?> Update(string userId, Word word)
        {
            using var activity = OtelService.StartActivityWithTag(otelTagName, "updating a word in Frontier");

            var oldWordId = word.Id; // Capture the id to update the correct word.
            PrepEditedByAndTimes(userId, word);
            word.Id = oldWordId;
            return await _wordRepo.RepoUpdateFrontier(word, (newWord, oldWord) =>
            {
                if (oldWord is null)
                {
                    return;
                }
                // Move id to history and update times.
                if (!newWord.History.Contains(oldWord.Id))
                {
                    newWord.History.Add(oldWord.Id);
                }
                newWord.Created = oldWord.Created;

                // If an imported word was using the citation form for its Vernacular,
                // only keep UsingCitationForm true if the Vernacular hasn't changed.
                newWord.UsingCitationForm &= newWord.Vernacular == oldWord.Vernacular;
            });
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
