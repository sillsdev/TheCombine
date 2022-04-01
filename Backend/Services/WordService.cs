using System.Collections.Generic;
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

        /// <summary> Makes a new word in Frontier that has deleted tag on each sense </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string wordId)
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

            wordToDelete.Id = "";
            wordToDelete.Modified = "";
            wordToDelete.History = new List<string> { wordId };
            wordToDelete.Accessibility = State.Deleted;

            foreach (var senseAcc in wordToDelete.Senses)
            {
                senseAcc.Accessibility = State.Deleted;
            }

            await _wordRepo.Create(wordToDelete);

            return wordIsInFrontier;
        }

        /// <summary> Removes audio with specified Id from a word </summary>
        /// <returns> New word </returns>
        public async Task<Word?> Delete(string projectId, string wordId, string fileName)
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
            wordWithAudioToDelete.Id = "";
            wordWithAudioToDelete.Modified = "";
            wordWithAudioToDelete.ProjectId = projectId;

            // Keep track of the old word, adding it to the history.
            wordWithAudioToDelete.History.Add(wordId);

            wordWithAudioToDelete = await _wordRepo.Create(wordWithAudioToDelete);

            return wordWithAudioToDelete;
        }

        /// <summary> Deletes word in frontier collection and adds word with deleted tag in word collection </summary>
        /// <returns> A string: id of new word </returns>
        public async Task<string?> DeleteFrontierWord(string projectId, string wordId)
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

            word.Id = "";
            word.Modified = "";
            word.ProjectId = projectId;
            word.Accessibility = State.Deleted;

            // Keep track of the old word, adding it to the history.
            word.History.Add(wordId);

            var deletedWord = await _wordRepo.Add(word);
            return deletedWord.Id;
        }

        /// <summary> Makes a new word in the Frontier with changes made </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Update(string projectId, string wordId, Word word)
        {
            var wordIsInFrontier = await _wordRepo.DeleteFrontier(projectId, wordId);

            // We only want to update words that are in the frontier
            if (!wordIsInFrontier)
            {
                return wordIsInFrontier;
            }

            word.Id = "";
            word.ProjectId = projectId;
            word.Modified = "";

            // Keep track of the old word, adding it to the history.
            word.History.Add(wordId);

            await _wordRepo.Create(word);

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
