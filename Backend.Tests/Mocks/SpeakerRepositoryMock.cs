﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using BackendFramework.Models;

namespace Backend.Tests.Mocks
{
    sealed internal class SpeakerRepositoryMock : ISpeakerRepository
    {
        private readonly List<Speaker> _speakers;

        public SpeakerRepositoryMock()
        {
            _speakers = new List<Speaker>();
        }

        public Task<List<Speaker>> GetAllSpeakers(string projectId)
        {
            var cloneList = _speakers.Select(speaker => speaker.Clone()).ToList();
            return Task.FromResult(cloneList.Where(speaker => speaker.ProjectId == projectId).ToList());
        }

        public Task<Speaker?> GetSpeaker(string projectId, string speakerId)
        {
            try
            {
                var foundSpeaker = _speakers.Single(speaker => speaker.Id == speakerId);
                return Task.FromResult<Speaker?>(foundSpeaker.Clone());
            }
            catch (InvalidOperationException)
            {
                return Task.FromResult<Speaker?>(null);
            }
        }

        public Task<Speaker> Create(Speaker speaker)
        {
            speaker.Id = Guid.NewGuid().ToString();
            _speakers.Add(speaker.Clone());
            return Task.FromResult(speaker.Clone());
        }

        public Task<bool> DeleteAllSpeakers(string projectId)
        {
            _speakers.Clear();
            return Task.FromResult(true);
        }

        public Task<bool> Delete(string projectId, string speakerId)
        {
            var foundSpeaker = _speakers.Single(speaker => speaker.Id == speakerId);
            return Task.FromResult(_speakers.Remove(foundSpeaker));
        }

        public Task<ResultOfUpdate> Update(string speakerId, Speaker speaker)
        {
            var foundSpeaker = _speakers.Single(ur => ur.Id == speakerId);
            if (foundSpeaker is null)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            if (foundSpeaker.ContentEquals(speaker))
            {
                return Task.FromResult(ResultOfUpdate.NoChange);
            }

            var success = _speakers.Remove(foundSpeaker);
            if (!success)
            {
                return Task.FromResult(ResultOfUpdate.NotFound);
            }

            _speakers.Add(speaker.Clone());
            return Task.FromResult(ResultOfUpdate.Updated);
        }

        public Task<bool> IsSpeakerNameInProject(string projectId, string name)
        {
            return Task.FromResult(_speakers.Any(s => s.ProjectId == projectId && s.Name == name));
        }
    }
}
