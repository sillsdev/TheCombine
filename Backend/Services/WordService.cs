using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace BackendFramework.Services
{
    /// <summary> More complex functions and application logic for <see cref="Word"/>s </summary>
    public class WordService : IWordService
    {
        private readonly IWordRepository _wordRepo;

        public WordService(IWordRepository wordRepo)
        {
            _wordRepo = wordRepo;
        }

        private static Word PrepEditedData(string userId, Word word)
        {
            word.Id = "";
            word.Modified = "";
            if (!string.IsNullOrWhiteSpace(userId) && userId != word.EditedBy.LastOrDefault(""))
            {
                word.EditedBy.Add(userId);
            }
            return word;
        }

        /// <summary> Creates a new word with updated metadata. </summary>
        /// <returns> The created word </returns>
        public async Task<Word> Create(string userId, Word word)
        {
            return await _wordRepo.Create(PrepEditedData(userId, word));
        }

        /// <summary> Creates a new word with updated metadata. </summary>
        /// <returns> The created word </returns>
        public async Task<List<Word>> Create(string userId, List<Word> words)
        {
            return await _wordRepo.Create(words.Select(w => PrepEditedData(userId, w)).ToList());
        }

        /// <summary> Adds a new word with updated metadata. </summary>
        /// <returns> The added word </returns>
        private async Task<Word> Add(string userId, Word word)
        {
            return await _wordRepo.Add(PrepEditedData(userId, word));
        }

        /// <summary> Makes a new word in Frontier that has deleted tag on each sense </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string userId, string wordId)
        {
            var wordIsInFrontier = await _wordRepo.DeleteFrontier(projectId, wordId);

            // We only want to add the deleted word if the word started in the frontier.
            if (!wordIsInFrontier)
            {
                return wordIsInFrontier;
            }

            var wordToDelete = await _wordRepo.GetWord(projectId, wordId);
            if (wordToDelete is null)
            {
                return false;
            }

            wordToDelete.EditedBy = new List<string>();
            wordToDelete.History = new List<string> { wordId };
            wordToDelete.Accessibility = Status.Deleted;

            foreach (var senseAcc in wordToDelete.Senses)
            {
                senseAcc.Accessibility = Status.Deleted;
            }

            await Create(userId, wordToDelete);

            return wordIsInFrontier;
        }

        /// <summary> Removes audio with specified fileName from a word </summary>
        /// <returns> New word </returns>
        public async Task<Word?> Delete(string projectId, string userId, string wordId, string fileName)
        {
            var wordWithAudioToDelete = await _wordRepo.GetWord(projectId, wordId);
            if (wordWithAudioToDelete is null)
            {
                return null;
            }

            var wordIsInFrontier = await _wordRepo.DeleteFrontier(projectId, wordId);

            // We only want to update words that are in the frontier
            if (!wordIsInFrontier)
            {
                return wordWithAudioToDelete;
            }

            wordWithAudioToDelete.Audio.Remove(fileName);
            wordWithAudioToDelete.History.Add(wordId);

            return await Create(userId, wordWithAudioToDelete);
        }

        /// <summary> Deletes word in frontier collection and adds word with deleted tag in word collection </summary>
        /// <returns> A string: id of new word </returns>
        public async Task<string?> DeleteFrontierWord(string projectId, string userId, string wordId)
        {
            var wordIsInFrontier = await _wordRepo.DeleteFrontier(projectId, wordId);
            if (!wordIsInFrontier)
            {
                return null;
            }

            var word = await _wordRepo.GetWord(projectId, wordId);
            if (word is null)
            {
                return null;
            }

            word.History.Add(wordId);
            word.Accessibility = Status.Deleted;

            return (await Add(userId, word)).Id;
        }

        /// <summary> Restores words to the Frontier </summary>
        /// <returns> A bool: true if successful, false if any don't exist or are already in the Frontier. </returns>
        public async Task<bool> RestoreFrontierWords(string projectId, List<string> wordIds)
        {
            var words = new List<Word>();
            foreach (var id in wordIds)
            {
                var word = await _wordRepo.GetWord(projectId, id);
                if (word is null || !await _wordRepo.IsInFrontier(projectId, id))
                {
                    return false;
                }
                words.Add(word);
            }
            await _wordRepo.AddFrontier(words);
            return true;
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Update(string projectId, string userId, string wordId, Word word)
        {
            var wordIsInFrontier = await _wordRepo.DeleteFrontier(projectId, wordId);

            // We only want to update words that are in the frontier
            if (!wordIsInFrontier)
            {
                return wordIsInFrontier;
            }

            word.ProjectId = projectId;
            word.History.Add(wordId);

            await Create(userId, word);

            return wordIsInFrontier;
        }

        /// <summary> Checks if a word being added is a duplicate of a preexisting word. </summary>
        /// <returns> The id string of the existing word, or null if none. </returns>
        public async Task<string?> FindContainingWord(Word word)
        {
            var frontier = await _wordRepo.GetFrontier(word.ProjectId);
            var duplicatedWord = frontier.Find(w => w.Contains(word));
            return duplicatedWord?.Id;
        }
    }
}
