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
    public class StatisticsServiceTests
    {
        private ISemanticDomainRepository _domainRepo = null!;
        private IUserRepository _userRepo = null!;
        private IWordRepository _wordRepo = null!;
        private IStatisticsService _statsService = null!;

        private const string ProjId = "StatsServiceTestProjId";
        private const string SemDomId = "StatsServiceTestSemDomId";
        private readonly List<SemanticDomainTreeNode> TreeNodes = new List<SemanticDomainTreeNode>
        {
            new SemanticDomainTreeNode( new SemanticDomain { Id = SemDomId })
        };

        private static Sense getSenseWithDomain(string semDomId = SemDomId)
        {
            var semDom = new SemanticDomain { Id = semDomId };
            return new Sense { SemanticDomains = new List<SemanticDomain> { semDom } };
        }
        private static User getUserWithProjId(string projId = ProjId)
        {
            var user = new User { Id = Util.RandString(10), Username = Util.RandString(10) };
            user.ProjectRoles[projId] = Util.RandString(10);
            return user;
        }
        private static Word getWordWithDomain(string semDomId = SemDomId)
        {
            var senses = new List<Sense> { getSenseWithDomain(semDomId) };
            return new Word
            {
                Id = Util.RandString(10),
                ProjectId = ProjId,
                Senses = senses,
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
            _wordRepo.AddFrontier(getWordWithDomain());

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Is.Empty);
        }

        [Test]
        public void GetSemanticDomainCountsTestEmptyDomainList()
        {
            // Add to the database a word and an empty list of semantic domains
            ((SemanticDomainRepositoryMock)_domainRepo).SetNextResponse(new List<SemanticDomainTreeNode>());
            _wordRepo.AddFrontier(getWordWithDomain());

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
            _wordRepo.AddFrontier(getWordWithDomain("different-id"));

            var result = _statsService.GetSemanticDomainCounts(ProjId, "").Result;
            Assert.That(result, Has.Count.EqualTo(1));
            Assert.That(result.First(), Has.Count.EqualTo(0));
        }

        [Test]
        public void GetSemanticDomainCountsTestIdMatch()
        {
            // Add to the database a semantic domain and a word with the same semantic domain
            ((SemanticDomainRepositoryMock)_domainRepo).SetNextResponse(TreeNodes);
            _wordRepo.AddFrontier(getWordWithDomain());

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
            var nonEmptySchedule = new List<DateTime> { DateTime.Now };

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, nonEmptySchedule).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestEmptySchedule()
        {
            _wordRepo.AddFrontier(getWordWithDomain());

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, new List<DateTime>()).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestNoSemanticDomainDates()
        {
            _wordRepo.AddFrontier(getWordWithDomain());
            var nonEmptySchedule = new List<DateTime> { DateTime.Now };

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, nonEmptySchedule).Result;
            Assert.That(result.Dates, Is.Empty);
            Assert.That(result.Datasets, Is.Empty);
        }

        [Test]
        public void GetProgressEstimationLineChartRootTestSchedule()
        {
            var word = getWordWithDomain();
            word.Senses[0].SemanticDomains[0].Created = DateTime.Now.ToString();
            _wordRepo.AddFrontier(word);
            var nonEmptySchedule = new List<DateTime> { DateTime.Now };

            var result = _statsService.GetProgressEstimationLineChartRoot(ProjId, nonEmptySchedule).Result;
            Assert.That(result.Dates, Has.Count.EqualTo(nonEmptySchedule.Count));
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
            foreach (var i in System.Linq.Enumerable.Range(0, userCount))
            {
                _userRepo.Create(getUserWithProjId());
            }

            var result = _statsService.GetSemanticDomainUserCounts(ProjId).Result;
            // Count is + 1 for the default "unknownUser"
            Assert.That(result, Has.Count.EqualTo(userCount + 1));
        }

        [Test]
        public void GetSemanticDomainUserCountsTestDomMatchesUser()
        {
            var user = _userRepo.Create(getUserWithProjId()).Result!;
            var wordCount = 4;
            foreach (var i in System.Linq.Enumerable.Range(0, wordCount))
            {
                var word = getWordWithDomain();
                word.Senses[0].SemanticDomains[0].UserId = user.Id;
                _wordRepo.AddFrontier(word);
            }

            var result = _statsService.GetSemanticDomainUserCounts(ProjId).Result;
            Assert.That(result.Find(uc => uc.Id == user.Id)!.WordCount, Is.EqualTo(wordCount));
        }
    }
}
