using System;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Contexts;
using BackendFramework.Models;
using BackendFramework.Repositories;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using NUnit.Framework;
using static System.Linq.Enumerable;

namespace Backend.Tests.Repositories
{
    /// <summary>
    /// Integration tests for <see cref="UserEditRepository"/> that spin up an actual MongoDB instance.
    /// </summary>
    [TestFixture]
    [Category("IntegrationTest")]
    public sealed class UserEditRepositoryTests
    {
        private static MongoDbTestRunner _runner = null!;
        private UserEditRepository _repo = null!;
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
                CombineDatabase = "UserEditRepositoryTests",
            });
            _repo = new UserEditRepository(new MongoDbContext(options));
        }

        private Task<UserEdit> CreateUserEdit(params Edit[] edits)
        {
            return _repo.Create(new UserEdit { ProjectId = _projectId, Edits = [.. edits] });
        }

        /// <summary> Generates a valid MongoDB ObjectId string that does not exist in the database. </summary>
        private static string NewObjectId() => ObjectId.GenerateNewId().ToString();

        [Test]
        public async Task TestAddEditAppendsToExistingUserEdit()
        {
            var userEdit = await CreateUserEdit(new Edit { StepData = ["step"] });
            var newEdit = new Edit { GoalType = 2, Changes = "{\"a\":1}" };

            var result = await _repo.AddEdit(_projectId, userEdit.Id, newEdit);

            Assert.That(result, Is.True);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Edits, Has.Count.EqualTo(2));
            Assert.That(retrieved.Edits.Last().Guid, Is.EqualTo(newEdit.Guid));
        }

        [Test]
        public async Task TestAddEditNonexistentUserEditReturnsFalse()
        {
            var result = await _repo.AddEdit(_projectId, NewObjectId(), new Edit());
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestAddEditWrongProjectIdReturnsFalse()
        {
            var userEdit = await CreateUserEdit();
            var result = await _repo.AddEdit(Guid.NewGuid().ToString(), userEdit.Id, new Edit());
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestAddEditAtMaxEditsTrimsOldest()
        {
            var edits = Range(0, UserEdit.MaxEdits).Select(_ => new Edit()).ToArray();
            var userEdit = await CreateUserEdit(edits);
            var oldestEditGuid = edits.First().Guid;
            var newEdit = new Edit();

            var result = await _repo.AddEdit(_projectId, userEdit.Id, newEdit);

            Assert.That(result, Is.True);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Edits, Has.Count.EqualTo(UserEdit.MaxEdits));
            Assert.That(retrieved.Edits.Last().Guid, Is.EqualTo(newEdit.Guid));
            Assert.That(retrieved.Edits.Select(e => e.Guid), Does.Not.Contain(oldestEditGuid));
        }

        [Test]
        public async Task TestReplaceEditReplacesMatchingElement()
        {
            var edit = new Edit { GoalType = 1, StepData = ["old"], Changes = "{}" };
            var userEdit = await CreateUserEdit(new Edit(), edit);
            var replacement = new Edit
            {
                Guid = edit.Guid,
                GoalType = 3,
                StepData = ["new"],
                Changes = "{\"b\":2}",
                Modified = DateTime.UtcNow,
            };

            var result = await _repo.ReplaceEdit(_projectId, userEdit.Id, replacement);

            Assert.That(result, Is.True);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Edits, Has.Count.EqualTo(2));
            var retrievedEdit = retrieved.Edits.Find(e => e.Guid == edit.Guid);
            Assert.That(retrievedEdit, Is.Not.Null);
            Assert.That(retrievedEdit.GoalType, Is.EqualTo(replacement.GoalType));
            Assert.That(retrievedEdit.StepData, Is.EqualTo(replacement.StepData));
            Assert.That(retrievedEdit.Changes, Is.EqualTo(replacement.Changes));
        }

        [Test]
        public async Task TestReplaceEditUnknownGuidReturnsFalse()
        {
            var userEdit = await CreateUserEdit(new Edit());
            var result = await _repo.ReplaceEdit(_projectId, userEdit.Id, new Edit());
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestAddStepToEditAppendsToRightEdit()
        {
            var targetEdit = new Edit { StepData = ["first"] };
            var otherEdit = new Edit { StepData = ["other"] };
            var userEdit = await CreateUserEdit(otherEdit, targetEdit);

            var result = await _repo.AddStepToEdit(_projectId, userEdit.Id, targetEdit.Guid, "second");

            Assert.That(result, Is.True);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            var retrievedTarget = retrieved.Edits.Find(e => e.Guid == targetEdit.Guid);
            Assert.That(retrievedTarget, Is.Not.Null);
            Assert.That(retrievedTarget.StepData, Is.EqualTo(["first", "second"]));
            var retrievedOther = retrieved.Edits.Find(e => e.Guid == otherEdit.Guid);
            Assert.That(retrievedOther, Is.Not.Null);
            Assert.That(retrievedOther.StepData, Is.EqualTo(["other"]));
        }

        [Test]
        public async Task TestAddStepToEditUnknownGuidReturnsFalse()
        {
            var userEdit = await CreateUserEdit(new Edit());
            var result = await _repo.AddStepToEdit(_projectId, userEdit.Id, Guid.NewGuid(), "step");
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestUpdateStepInEditOverwritesRightIndex()
        {
            var edit = new Edit { StepData = ["a", "b", "c"] };
            var userEdit = await CreateUserEdit(edit);

            var result = await _repo.UpdateStepInEdit(_projectId, userEdit.Id, edit.Guid, 1, "B");

            Assert.That(result, Is.True);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            var retrievedEdit = retrieved.Edits.Find(e => e.Guid == edit.Guid);
            Assert.That(retrievedEdit, Is.Not.Null);
            Assert.That(retrievedEdit.StepData, Is.EqualTo(["a", "B", "c"]));
        }

        [Test]
        public async Task TestUpdateStepInEditUnknownGuidReturnsFalse()
        {
            var userEdit = await CreateUserEdit(new Edit { StepData = ["a"] });
            var result = await _repo.UpdateStepInEdit(_projectId, userEdit.Id, Guid.NewGuid(), 0, "A");
            Assert.That(result, Is.False);
        }
    }
}
