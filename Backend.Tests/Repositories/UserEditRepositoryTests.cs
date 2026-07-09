using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BackendFramework.Contexts;
using BackendFramework.Models;
using BackendFramework.Repositories;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using NUnit.Framework;

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
        private MongoDbContext _dbContext = null!;
        private UserEditRepository _repo = null!;
        private IMongoCollection<StoredEdit> _editsCollection = null!;
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
            _dbContext = new MongoDbContext(options);
            _repo = new UserEditRepository(_dbContext);
            _editsCollection = _dbContext.Db.GetCollection<StoredEdit>("EditsCollection");
        }

        private Task<UserEdit> CreateUserEdit(params Edit[] edits)
        {
            return _repo.Create(new UserEdit { ProjectId = _projectId, Edits = [.. edits] });
        }

        /// <summary> Generates a valid MongoDB ObjectId string that does not exist in the database. </summary>
        private static string NewObjectId() => ObjectId.GenerateNewId().ToString();

        /// <summary> Gets all EditsCollection documents for a user edit in the test project. </summary>
        private Task<List<StoredEdit>> GetStoredEdits(string userEditId)
        {
            return _editsCollection
                .Find(e => e.ProjectId == _projectId && e.UserEditId == userEditId).ToListAsync();
        }

        /// <summary> Counts EditsCollection documents (in any project) for an edit guid. </summary>
        private async Task<long> CountStoredEditsWithGuid(Guid editGuid)
        {
            return await _editsCollection.CountDocumentsAsync(e => e.Guid == editGuid);
        }

        [Test]
        public async Task TestCreateEmptyUserEditSetsId()
        {
            var userEdit = await CreateUserEdit();

            Assert.That(userEdit.Id, Is.Not.Empty);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Edits, Is.Empty);
        }

        [Test]
        public async Task TestCreateWithEditsPersistsStoredEditDocuments()
        {
            var modified = new DateTime(2024, 1, 2, 3, 4, 5, DateTimeKind.Utc);
            var editA = new Edit { GoalType = 1, StepData = ["a1", "a2"], Changes = "{\"a\":1}", Modified = modified };
            var editB = new Edit { GoalType = 2, StepData = ["b"], Changes = "{\"b\":2}" };

            var userEdit = await CreateUserEdit(editA, editB);

            // The returned wire object keeps its edits and gains an id.
            Assert.That(userEdit.Id, Is.Not.Empty);
            Assert.That(userEdit.Edits, Has.Count.EqualTo(2));

            // One StoredEdit document per edit, each with the correct projectId and userEditId.
            var storedEdits = await GetStoredEdits(userEdit.Id);
            Assert.That(storedEdits, Has.Count.EqualTo(2));
            var storedIdsByGuid = storedEdits.ToDictionary(e => e.Guid, e => e.Id);

            // The UserEdit document's edits array holds ObjectId refs to those documents, in order.
            var rawUserEdits = _dbContext.Db.GetCollection<BsonDocument>("UserEditsCollection");
            var rawDoc = await rawUserEdits.Find(new BsonDocument("_id", ObjectId.Parse(userEdit.Id))).FirstAsync();
            var refs = rawDoc["edits"].AsBsonArray;
            Assert.That(refs.Select(r => r.BsonType), Is.All.EqualTo(BsonType.ObjectId));
            Assert.That(refs.Select(r => r.AsObjectId.ToString()),
                Is.EqualTo(new[] { storedIdsByGuid[editA.Guid], storedIdsByGuid[editB.Guid] }));

            // GetUserEdit round-trips all edit fields.
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.ProjectId, Is.EqualTo(_projectId));
            Assert.That(retrieved.Edits, Is.EqualTo(new[] { editA, editB }).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestGetUserEditNonexistentReturnsNull()
        {
            var retrieved = await _repo.GetUserEdit(_projectId, NewObjectId());
            Assert.That(retrieved, Is.Null);
        }

        [Test]
        public async Task TestGetUserEditAssemblesEditsInInsertionOrder()
        {
            var userEdit = await CreateUserEdit();
            var edits = new List<Edit> { new(), new(), new() };
            foreach (var edit in edits)
            {
                Assert.That(await _repo.AddEdit(_projectId, userEdit.Id, edit), Is.True);
            }

            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Edits.Select(e => e.Guid), Is.EqualTo(edits.Select(e => e.Guid)));
        }

        [Test]
        public async Task TestGetAllUserEditsExcludesOtherProjects()
        {
            var userEditA = await CreateUserEdit(new Edit { StepData = ["a"] });
            var userEditB = await CreateUserEdit(new Edit { StepData = ["b1"] }, new Edit { StepData = ["b2"] });
            var otherUserEdit = await _repo.Create(
                new UserEdit { ProjectId = Guid.NewGuid().ToString(), Edits = [new Edit()] });

            var userEdits = await _repo.GetAllUserEdits(_projectId);

            Assert.That(userEdits, Has.Count.EqualTo(2));
            Assert.That(userEdits.Select(u => u.Id), Does.Not.Contain(otherUserEdit.Id));
            var retrievedA = userEdits.Find(u => u.Id == userEditA.Id);
            Assert.That(retrievedA, Is.Not.Null);
            Assert.That(retrievedA.Edits, Is.EqualTo(userEditA.Edits).UsingPropertiesComparer());
            var retrievedB = userEdits.Find(u => u.Id == userEditB.Id);
            Assert.That(retrievedB, Is.Not.Null);
            Assert.That(retrievedB.Edits, Is.EqualTo(userEditB.Edits).UsingPropertiesComparer());
        }

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

            // The EditsCollection gained a document with the correct projectId and userEditId.
            var storedEdits = await GetStoredEdits(userEdit.Id);
            Assert.That(storedEdits, Has.Count.EqualTo(2));
            Assert.That(storedEdits.Select(e => e.Guid), Does.Contain(newEdit.Guid));
        }

        [Test]
        public async Task TestAddEditNonexistentUserEditReturnsFalse()
        {
            var edit = new Edit();
            var result = await _repo.AddEdit(_projectId, NewObjectId(), edit);

            Assert.That(result, Is.False);
            // The transaction must abort without leaving an orphaned EditsCollection document.
            Assert.That(await CountStoredEditsWithGuid(edit.Guid), Is.Zero);
        }

        [Test]
        public async Task TestAddEditWrongProjectIdReturnsFalse()
        {
            var userEdit = await CreateUserEdit();
            var edit = new Edit();
            var result = await _repo.AddEdit(Guid.NewGuid().ToString(), userEdit.Id, edit);

            Assert.That(result, Is.False);
            // The transaction must abort without leaving an orphaned EditsCollection document.
            Assert.That(await CountStoredEditsWithGuid(edit.Guid), Is.Zero);
        }

        [Test]
        public async Task TestReplaceEditReplacesMatchingEdit()
        {
            var edit = new Edit { GoalType = 1, StepData = ["old"], Changes = "{}" };
            var userEdit = await CreateUserEdit(new Edit(), edit);
            var replacement = new Edit
            {
                Guid = edit.Guid,
                GoalType = 3,
                StepData = ["new"],
                Changes = "{\"b\":2}",
                Modified = new DateTime(2024, 5, 6, 7, 8, 9, DateTimeKind.Utc),
            };

            var result = await _repo.ReplaceEdit(_projectId, userEdit.Id, replacement);

            Assert.That(result, Is.True);
            var retrieved = await _repo.GetUserEdit(_projectId, userEdit.Id);
            Assert.That(retrieved, Is.Not.Null);
            Assert.That(retrieved.Edits, Has.Count.EqualTo(2));
            var retrievedEdit = retrieved.Edits.Find(e => e.Guid == edit.Guid);
            Assert.That(retrievedEdit, Is.EqualTo(replacement).UsingPropertiesComparer());
        }

        [Test]
        public async Task TestReplaceEditIdenticalEditReturnsTrue()
        {
            var edit = new Edit { GoalType = 1, StepData = ["step"] };
            var userEdit = await CreateUserEdit(edit);
            var result = await _repo.ReplaceEdit(_projectId, userEdit.Id, edit);
            Assert.That(result, Is.True);
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
            Assert.That(retrievedTarget.Modified, Is.Not.Null);
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
            Assert.That(retrievedEdit.Modified, Is.Not.Null);
        }

        [Test]
        public async Task TestUpdateStepInEditUnknownGuidReturnsFalse()
        {
            var userEdit = await CreateUserEdit(new Edit { StepData = ["a"] });
            var result = await _repo.UpdateStepInEdit(_projectId, userEdit.Id, Guid.NewGuid(), 0, "A");
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestDeleteRemovesUserEditAndItsEdits()
        {
            var userEdit = await CreateUserEdit(new Edit(), new Edit());
            var otherUserEdit = await CreateUserEdit(new Edit());

            var result = await _repo.Delete(_projectId, userEdit.Id);

            Assert.That(result, Is.True);
            Assert.That(await _repo.GetUserEdit(_projectId, userEdit.Id), Is.Null);
            Assert.That(await GetStoredEdits(userEdit.Id), Is.Empty);

            // Another user edit in the same project is untouched.
            Assert.That(await GetStoredEdits(otherUserEdit.Id), Has.Count.EqualTo(1));
            var retrievedOther = await _repo.GetUserEdit(_projectId, otherUserEdit.Id);
            Assert.That(retrievedOther, Is.Not.Null);
            Assert.That(retrievedOther.Edits, Has.Count.EqualTo(1));
        }

        [Test]
        public async Task TestDeleteNonexistentUserEditReturnsFalse()
        {
            var result = await _repo.Delete(_projectId, NewObjectId());
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task TestDeleteAllUserEditsRemovesProjectDocuments()
        {
            await CreateUserEdit(new Edit());
            await CreateUserEdit(new Edit(), new Edit());
            var otherProjectId = Guid.NewGuid().ToString();
            var otherUserEdit = await _repo.Create(new UserEdit { ProjectId = otherProjectId, Edits = [new Edit()] });

            var result = await _repo.DeleteAllUserEdits(_projectId);

            Assert.That(result, Is.True);
            Assert.That(await _repo.GetAllUserEdits(_projectId), Is.Empty);
            Assert.That(await _editsCollection.CountDocumentsAsync(e => e.ProjectId == _projectId), Is.Zero);

            // Another project's documents are untouched.
            var retrievedOther = await _repo.GetUserEdit(otherProjectId, otherUserEdit.Id);
            Assert.That(retrievedOther, Is.Not.Null);
            Assert.That(retrievedOther.Edits, Has.Count.EqualTo(1));
        }

        [Test]
        public async Task TestDeleteAllUserEditsEmptyProjectReturnsFalse()
        {
            var result = await _repo.DeleteAllUserEdits(_projectId);
            Assert.That(result, Is.False);
        }
    }
}
