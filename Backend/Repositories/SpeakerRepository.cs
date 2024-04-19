using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using MongoDB.Driver;

namespace BackendFramework.Repositories
{
    /// <summary> Atomic database functions for <see cref="Speaker"/>s. </summary>
    [ExcludeFromCodeCoverage]
    public class SpeakerRepository : ISpeakerRepository
    {
        private readonly ISpeakerContext _speakerDatabase;

        public SpeakerRepository(ISpeakerContext collectionSettings)
        {
            _speakerDatabase = collectionSettings;
        }

        /// <summary> Finds all <see cref="Speaker"/>s in specified <see cref="Project"/> </summary>
        public async Task<List<Speaker>> GetAllSpeakers(string projectId)
        {
            return await _speakerDatabase.Speakers.Find(u => u.ProjectId == projectId).ToListAsync();
        }

        /// <summary> Removes all <see cref="Speaker"/>s for specified <see cref="Project"/> </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> DeleteAllSpeakers(string projectId)
        {
            return (await _speakerDatabase.Speakers.DeleteManyAsync(u => u.ProjectId == projectId)).DeletedCount > 0;
        }

        /// <summary> Finds <see cref="Speaker"/> with specified projectId and speakerId </summary>
        public async Task<Speaker?> GetSpeaker(string projectId, string speakerId)
        {
            var filterDef = new FilterDefinitionBuilder<Speaker>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, speakerId));

            var speakerList = await _speakerDatabase.Speakers.FindAsync(filter);
            try
            {
                return await speakerList.FirstAsync();
            }
            catch (InvalidOperationException)
            {
                return null;
            }
        }

        /// <summary> Adds a <see cref="Speaker"/> </summary>
        /// <returns> The Speaker created </returns>
        public async Task<Speaker> Create(Speaker speaker)
        {
            await _speakerDatabase.Speakers.InsertOneAsync(speaker);
            return speaker;
        }

        /// <summary> Removes <see cref="Speaker"/> with specified projectId and speakerId </summary>
        /// <returns> A bool: success of operation </returns>
        public async Task<bool> Delete(string projectId, string speakerId)
        {
            var filterDef = new FilterDefinitionBuilder<Speaker>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Id, speakerId));

            return (await _speakerDatabase.Speakers.DeleteOneAsync(filter)).DeletedCount > 0;
        }

        /// <summary> Updates <see cref="Speaker"/> with specified speakerId </summary>
        /// <returns> A <see cref="ResultOfUpdate"/> enum: success of operation </returns>
        public async Task<ResultOfUpdate> Update(string speakerId, Speaker speaker)
        {
            var filter = Builders<Speaker>.Filter.Eq(x => x.Id, speakerId);
            var updateDef = Builders<Speaker>.Update
                .Set(x => x.ProjectId, speaker.ProjectId)
                .Set(x => x.Name, speaker.Name)
                .Set(x => x.Consent, speaker.Consent);
            var updateResult = await _speakerDatabase.Speakers.UpdateOneAsync(filter, updateDef);

            return !updateResult.IsAcknowledged
                ? ResultOfUpdate.NotFound
                : updateResult.ModifiedCount > 0
                    ? ResultOfUpdate.Updated
                    : ResultOfUpdate.NoChange;
        }

        /// <summary> Check if <see cref="Speaker"/> with specified name is already in project </summary>
        public async Task<bool> IsSpeakerNameInProject(string projectId, string name)
        {
            var filterDef = new FilterDefinitionBuilder<Speaker>();
            var filter = filterDef.And(filterDef.Eq(x => x.ProjectId, projectId), filterDef.Eq(x => x.Name, name));
            return await _speakerDatabase.Speakers.CountDocumentsAsync(filter) > 0;
        }
    }
}
