using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using BackendFramework.Contexts;
using BackendFramework.Models;
using BackendFramework.Repositories;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using NUnit.Framework;

namespace Backend.Tests.Repositories
{
    /// <summary>
    /// Integration tests for <see cref="SemanticDomainCountRepository"/> that spin up an actual MongoDB instance.
    /// A single-node replica set is required because the write methods run inside transactions.
    /// </summary>
    [TestFixture]
    [Category("IntegrationTest")]
    public sealed class SemanticDomainCountRepositoryTests
    {
        private static MongoDbTestRunner _runner = null!;
        private MongoDbContext _dbContext = null!;
        private SemanticDomainCountRepository _repo = null!;
        private string _projectId = null!;

        [OneTimeSetUp]
        public static void StartMongo()
        {
            _runner?.Dispose();
            _runner = MongoDbTestRunner.Start();
        }

        [OneTimeTearDown]
        public static void StopMongo()
        {
            _runner?.Dispose();
        }

        [SetUp]
        public void SetUp()
        {
            _projectId = Guid.NewGuid().ToString();
            var options = Options.Create(new BackendFramework.Startup.Settings
            {
                ConnectionString = _runner.ConnectionString,
                CombineDatabase = "SemanticDomainCountRepositoryTests",
            });
            _dbContext = new MongoDbContext(options);
            _repo = new SemanticDomainCountRepository(_dbContext);
        }

        private Task ApplyDeltas(IReadOnlyDictionary<string, int> deltas)
        {
            return _dbContext.ExecuteInTransaction(async session =>
            {
                await _repo.ApplyDeltas(session, _projectId, deltas);
                return true;
            });
        }

        [Test]
        public async Task ApplyDeltasUpsertsThenIncrements()
        {
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 2, ["1.1"] = 1 });
            Assert.That(await _repo.GetCount(_projectId, "1"), Is.EqualTo(2));
            Assert.That(await _repo.GetCount(_projectId, "1.1"), Is.EqualTo(1));

            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 3 });
            Assert.That(await _repo.GetCount(_projectId, "1"), Is.EqualTo(5));
        }

        [Test]
        public async Task ApplyDeltasDecrements()
        {
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 5 });
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = -2 });
            Assert.That(await _repo.GetCount(_projectId, "1"), Is.EqualTo(3));
        }

        [Test]
        public async Task ApplyDeltasSkipsZeroDeltas()
        {
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 0 });
            Assert.That(await _repo.GetAllCounts(_projectId), Is.Empty);
        }

        [Test]
        public async Task GetCountReturnsZeroWhenAbsent()
        {
            Assert.That(await _repo.GetCount(_projectId, "9.9"), Is.EqualTo(0));
        }

        [Test]
        public async Task GetAllCountsReturnsProjectCounts()
        {
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 1, ["2"] = 4 });
            var all = await _repo.GetAllCounts(_projectId);
            Assert.That(all, Has.Count.EqualTo(2));
            Assert.That(all.Find(c => c.DomainId == "2")!.Count, Is.EqualTo(4));
        }

        [Test]
        public async Task GetAllCountsIsolatesByProject()
        {
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 1 });
            Assert.That(await _repo.GetAllCounts(Guid.NewGuid().ToString()), Is.Empty);
        }

        [Test]
        public async Task DeleteAllCountsRemovesProjectCounts()
        {
            await ApplyDeltas(new Dictionary<string, int> { ["1"] = 1, ["2"] = 2 });
            await _dbContext.ExecuteInTransaction(async session =>
            {
                await _repo.DeleteAllCounts(session, _projectId);
                return true;
            });
            Assert.That(await _repo.GetAllCounts(_projectId), Is.Empty);
        }

        [Test]
        public void UniqueIndexPreventsDuplicatePairs()
        {
            var collection =
                _dbContext.Db.GetCollection<ProjectSemanticDomainCount>("SemanticDomainCountCollection");
            collection.InsertOne(new ProjectSemanticDomainCount(_projectId, "1", 1));
            Assert.That(
                async () => await collection.InsertOneAsync(new ProjectSemanticDomainCount(_projectId, "1", 1)),
                Throws.InstanceOf<MongoWriteException>());
        }

        [Test]
        public void CountDomainsTalliesEachSenseOccurrence()
        {
            var word = new Word
            {
                Senses =
                [
                    new Sense { SemanticDomains = [new SemanticDomain { Id = "1" }, new SemanticDomain { Id = "2" }] },
                    new Sense { SemanticDomains = [new SemanticDomain { Id = "1" }] },
                ],
            };

            var counts = SemanticDomainCountRepository.CountDomains(word);
            Assert.That(counts["1"], Is.EqualTo(2));
            Assert.That(counts["2"], Is.EqualTo(1));
        }
    }
}
