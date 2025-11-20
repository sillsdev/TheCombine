using System;
using System.Collections.Generic;
using System.Linq;
using Backend.Tests.Mocks;
using BackendFramework.Interfaces;
using BackendFramework.Models;
using BackendFramework.Services;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class StatisticsServiceTests
    {
        private ISemanticDomainRepository _domainRepo = null!;
        private IUserRepository _userRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IStatisticsService _statsService = null!;

        private const string ProjId = "StatsServiceTestProjId";
        private const string SemDomId = "StatsServiceTestSemDomId";
        private readonly List<DateTime> NonEmptySchedule = new() { DateTime.Now };
        private readonly List<SemanticDomainTreeNode> TreeNodes = new() { new(new SemanticDomain { Id = SemDomId }) };

        private static Sense GetSenseWithDomain(string semDomId = SemDomId)
        {
            return new() { SemanticDomains = new() { new() { Id = semDomId } } };
        }
        private static User GetUserWithProjId(string projId = ProjId)
        {
            var user = new User { Id = Util.RandString(10), Username = Util.RandString(10) };
            user.ProjectRoles[projId] = Util.RandString(10);
            return user;
        }
        private static Word GetWordWithDomain(string semDomId = SemDomId)
        {
            return new()
            {
                Id = Util.RandString(10),
                ProjectId = ProjId,
                Senses = new() { GetSenseWithDomain(semDomId) },
                Vernacular = Util.RandString(10)
            };
        }

        [SetUp]
        public void Setup()
        {
            _domainRepo = new SemanticDomainRepositoryMock();
            _userRepo = new UserRepositoryMock();
            _wordRepo = new WordRepositoryMock();
            _statsService = new StatisticsService(_wordRepo, _domainRepo, _userRepo);
        }

        [Test]
        public void GetSemanticDomainCountsTestNullDomainList()
        {
            // Add a word to the database and leave the semantic domain list null
            _wordRepo.AddFrontier(GetWordWithDomain());

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetSemanticDomainCountsTestEmptyDomainList()
        {
            // Add to the database a word and an empty list of semantic domains
            ((SemanticDomainRepositoryMock)_domainRepo).SetNextResponse(new List<SemanticDomainTreeNode>());
            _wordRepo.AddFrontier(GetWordWithDomain());

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetSemanticDomainCountsTestEmptyFrontier()
        {
            // Add to the database a semantic domain but no word
            ((SemanticDomainRepositoryMock)_domainRepo).SetNextResponse(TreeNodes);

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetSemanticDomainCountsTestIdMismatch()
        {
            // Add to the database a semantic domain and a word with a different semantic domain
            ((SemanticDomainRepositoryMock)_domainRepo).SetNextResponse(TreeNodes);
            _wordRepo.AddFrontier(GetWordWithDomain("different-id"));

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First(), Is.Empty);
        }

        [Test]
        public void GetSemanticDomainCountsTestIdMatch()
        {
            // Add to the database a semantic domain and a word with the same semantic domain
            ((SemanticDomainRepositoryMock)_domainRepo).SetNextResponse(TreeNodes);
            _wordRepo.AddFrontier(GetWordWithDomain());

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First().Count, Is.EqualTo(1));
        }

        [Test]
        public void GetWordsPerDayPerUserCountsTestEmptyFrontier()
        {
            var result = _statsService.GetWordsPerDayPerUserCounts(ProjId).Result;
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestEmptyFrontier()
        {
            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, NonEmptySchedule).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestEmptySchedule()
        {
            _wordRepo.AddFrontier(GetWordWithDomain());

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, new()).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestNoSemanticDomainDates()
        {
            _wordRepo.AddFrontier(GetWordWithDomain());

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, NonEmptySchedule).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestSchedule()
        {
            var word = GetWordWithDomain();
            word.Senses[0].SemanticDomains[0].Created = DateTime.Now.ToString();
            _wordRepo.AddFrontier(word);

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, NonEmptySchedule).Result;
            Assert.That(result.Dates, Has.Count.EqualTo(NonEmptySchedule.Count));
        }

        [Test]
        public void GetLineChartRootDataTestNoData()
        {
            var result = _statsService.GetLineChartRootData(ProjId).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetSemanticDomainUserCountsTestUsers()
        {
            var userCount = 4;
            foreach (var i in Enumerable.Range(0, userCount))
            {
                _userRepo.Create(GetUserWithProjId());
            }

            var result = _statsService.GetSemanticDomainUserCounts(ProjId).Result;
            // Count is + 1 for the default "unknownUser"
            Assert.That(result, Has.Count.EqualTo(userCount + 1));
        }

        [Test]
        public void GetSemanticDomainUserCountsTestDomMatchesUser()
        {
            var user = _userRepo.Create(GetUserWithProjId()).Result!;
            var wordCount = 4;
            foreach (var i in Enumerable.Range(0, wordCount))
            {
                var word = GetWordWithDomain();
                word.Senses[0].SemanticDomains[0].UserId = user.Id;
                _wordRepo.AddFrontier(word);
            }

            var result = _statsService.GetSemanticDomainUserCounts(ProjId).Result;
            Assert.That(result.Find(uc => uc.Id == user.Id)!.WordCount, Is.EqualTo(wordCount));
        }

        [Test]
        public void GetSemanticDomainUserCountsTestRecentDomain()
        {
            var user = _userRepo.Create(GetUserWithProjId()).Result!;

            var olderDomain = new SemanticDomain
            {
                Id = "1.1.1",
                Name = "Older Domain",
                Created = "2023-01-01T10:00:00Z",
                UserId = user.Id
            };
            var newerDomain = new SemanticDomain
            {
                Id = "2.2.2",
                Name = "Newer Domain",
                Created = "2023-12-31T10:00:00Z",
                UserId = user.Id
            };
            var anonDomain = new SemanticDomain
            {
                Id = "3.3.3",
                Name = "Unknown Domain"
            };

            var word1 = GetWordWithDomain();
            word1.Senses[0].SemanticDomains = [anonDomain, newerDomain];
            _wordRepo.AddFrontier(word1);

            var word2 = GetWordWithDomain();
            word2.Senses[0].SemanticDomains = [olderDomain];
            _wordRepo.AddFrontier(word2);

            var result = _statsService.GetSemanticDomainUserCounts(ProjId).Result;
            var userCount = result.Find(uc => uc.Id == user.Id);
            Assert.That(userCount?.RecentDomain, Is.EqualTo(newerDomain).UsingPropertiesComparer());
        }
    }
}
