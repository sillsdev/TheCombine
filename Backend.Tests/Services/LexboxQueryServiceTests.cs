using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Models;
using BackendFramework.Services;
using Microsoft.AspNetCore.Http;
using Moq;
using Moq.Protected;
using NUnit.Framework;

namespace Backend.Tests.Services
{
    internal sealed class LexboxQueryServiceTests
    {
        private Mock<HttpMessageHandler> _handlerMock = null!;
        private LexboxQueryService _lexboxQueryService = null!;
        private string _responseJson = "[]";
        private HttpStatusCode _status = HttpStatusCode.OK;
        /// <summary> Overrides <see cref="_responseJson"/> when set. </summary>
        private Func<HttpRequestMessage, string>? _respond;

        private const string Vern = "seh";
        private const string Analysis1 = "en";
        private const string Analysis2 = "pt";

        [SetUp]
        public void Setup()
        {
            _responseJson = "[]";
            _respond = null;
            _status = HttpStatusCode.OK;
            _handlerMock = new Mock<HttpMessageHandler>();
            _handlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync((HttpRequestMessage req, CancellationToken _) => new HttpResponseMessage(_status)
                {
                    Content = new StringContent(_respond?.Invoke(req) ?? _responseJson)
                });

            var httpClientFactory = new Mock<IHttpClientFactory>();
            httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
                .Returns(() => new HttpClient(_handlerMock.Object));

            _lexboxQueryService = new LexboxQueryService(httpClientFactory.Object);
        }

        private static string RichString(string text) => $$"""{ "spans": [{ "text": "{{text}}" }] }""";

        private static string EntryJson(string senses = "", string extraFields = "")
        {
            return $$"""
                {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "lexemeForm": { "{{Vern}}": "vern" },
                    "senses": [{{senses}}]
                    {{extraFields}}
                }
                """;
        }

        private static string SenseJson(string extraFields = "", string gloss = "gloss")
        {
            return $$"""
                {
                    "id": "00000000-0000-0000-0000-000000000002",
                    "gloss": { "{{Analysis1}}": "{{gloss}}" }
                    {{extraFields}}
                }
                """;
        }

        private static IEnumerable<(ReasonType, int?, string?)> Summarize(List<ProtectReason> reasons)
            => reasons.Select(r => (r.Type, r.Count, r.Value));

        private async Task<Word> GetSingleWord(string entryJson)
        {
            _responseJson = $"[{entryJson}]";
            var words = await _lexboxQueryService.GetProjectEntriesAsync(
                "token", "proj-code", Vern, [Analysis1, Analysis2]);
            Assert.That(words, Has.Count.EqualTo(1));
            return words[0];
        }

        [Test]
        public async Task TestGetMyProjectsAsyncSkipsInactiveAndAudioWritingSystems()
        {
            _responseJson = """
                {
                    "data": {
                        "meAuth": { "id": "00000000-0000-0000-0000-0000000000aa", "isAdmin": false },
                        "myProjects": [{
                            "code": "proj-code",
                            "id": "00000000-0000-0000-0000-000000000001",
                            "name": "Project",
                            "flexProjectMetadata": {
                                "projectId": "00000000-0000-0000-0000-000000000001",
                                "writingSystems": {
                                    "analysisWss": [
                                        { "tag": "ru", "isActive": true, "isDefault": false },
                                        { "tag": "en", "isActive": true, "isDefault": true }
                                    ],
                                    "vernacularWss": [
                                        { "tag": "es-419", "isActive": true, "isDefault": true },
                                        { "tag": "es-Zxxx-419-x-audio", "isActive": true, "isDefault": false },
                                        { "tag": "es-fonipa", "isActive": false, "isDefault": false }
                                    ]
                                }
                            }
                        }]
                    }
                }
                """;

            var projects = await _lexboxQueryService.GetMyProjectsAsync("token");

            Assert.That(projects, Has.Count.EqualTo(1));
            Assert.That(projects[0].AnalysisWsTags, Is.EqualTo(new List<string> { "en", "ru" }));
            Assert.That(projects[0].VernacularWsTags, Is.EqualTo(new List<string> { "es-419" }));
        }

        private const string MeId = "00000000-0000-0000-0000-0000000000aa";
        private const string OtherUserId = "00000000-0000-0000-0000-0000000000bb";

        private const string OrgId = "00000000-0000-0000-0000-0000000000cc";

        private async Task<LexboxProject> GetSingleProject(bool isLanguageForge, string usersJson,
            bool isAdmin = false, string vernacularTag = "es", string myOrgsJson = "", string projectOrgsJson = "")
        {
            _responseJson = $$"""
                {
                    "data": {
                        "meAuth": {
                            "id": "{{MeId}}",
                            "isAdmin": {{(isAdmin ? "true" : "false")}},
                            "orgs": [{{myOrgsJson}}]
                        },
                        "myProjects": [{
                            "code": "proj-code",
                            "id": "00000000-0000-0000-0000-000000000001",
                            "isLanguageForgeProject": {{(isLanguageForge ? "true" : "false")}},
                            "name": "Project",
                            "flexProjectMetadata": {
                                "projectId": "00000000-0000-0000-0000-000000000001",
                                "writingSystems": {
                                    "analysisWss": [],
                                    "vernacularWss": [{ "tag": "{{vernacularTag}}", "isActive": true, "isDefault": true }]
                                }
                            },
                            "organizations": [{{projectOrgsJson}}],
                            "users": [{{usersJson}}]
                        }]
                    }
                }
                """;
            var projects = await _lexboxQueryService.GetMyProjectsAsync("token");
            Assert.That(projects, Has.Count.EqualTo(1));
            return projects[0];
        }

        private static string UserJson(string userId, string role) => $$"""{ "userId": "{{userId}}", "role": "{{role}}" }""";

        [TestCase("MANAGER")]
        [TestCase("EDITOR")]
        public async Task TestGetMyProjectsAsyncImportableForEditorOrManager(string role)
        {
            var project = await GetSingleProject(true, UserJson(MeId, role));

            Assert.That(project.ImportBlocker, Is.Null);
        }

        [TestCase("OBSERVER")]
        [TestCase("COMMENTER")]
        [TestCase("EDITOR_LITE")]
        public async Task TestGetMyProjectsAsyncBlocksOtherRoles(string role)
        {
            // Another member's role must not count as the user's.
            var users = $"{UserJson(OtherUserId, "MANAGER")}, {UserJson(MeId, role)}";

            var project = await GetSingleProject(true, users);

            Assert.That(project.ImportBlocker, Is.EqualTo(LexboxImportBlocker.InsufficientRole));
        }

        [Test]
        public async Task TestGetMyProjectsAsyncImportableForAdminWithoutRole()
        {
            var project = await GetSingleProject(true, UserJson(MeId, "OBSERVER"), isAdmin: true);

            Assert.That(project.ImportBlocker, Is.Null);
        }

        [TestCase("ADMIN", true)]
        [TestCase("USER", false)]
        public async Task TestGetMyProjectsAsyncChecksOwningOrgRole(string orgRole, bool importable)
        {
            var myOrgs = $$"""{ "orgId": "{{OrgId}}", "role": "{{orgRole}}" }""";
            var projectOrgs = $$"""{ "id": "{{OrgId}}" }""";

            var project = await GetSingleProject(true, UserJson(MeId, "OBSERVER"),
                myOrgsJson: myOrgs, projectOrgsJson: projectOrgs);

            Assert.That(project.ImportBlocker, importable
                ? Is.Null : Is.EqualTo(LexboxImportBlocker.InsufficientRole));
        }

        [Test]
        public async Task TestGetMyProjectsAsyncIgnoresAdminOfOtherOrg()
        {
            var myOrgs = $$"""{ "orgId": "{{OrgId}}", "role": "ADMIN" }""";
            var projectOrgs = """{ "id": "00000000-0000-0000-0000-0000000000dd" }""";

            var project = await GetSingleProject(true, UserJson(MeId, "OBSERVER"),
                myOrgsJson: myOrgs, projectOrgsJson: projectOrgs);

            Assert.That(project.ImportBlocker, Is.EqualTo(LexboxImportBlocker.InsufficientRole));
        }

        [Test]
        public async Task TestGetMyProjectsAsyncBlocksNonLanguageForge()
        {
            var project = await GetSingleProject(false, UserJson(MeId, "MANAGER"));

            Assert.That(project.ImportBlocker, Is.EqualTo(LexboxImportBlocker.NotLanguageForge));
        }

        [Test]
        public async Task TestGetMyProjectsAsyncBlocksNoVernacularLanguage()
        {
            var project = await GetSingleProject(true, UserJson(MeId, "MANAGER"), vernacularTag: "es-Zxxx-x-audio");

            Assert.That(project.ImportBlocker, Is.EqualTo(LexboxImportBlocker.NoVernacularLanguage));
        }

        [TestCase("kjj-Zxxx-x-audio", ExpectedResult = true)]
        [TestCase("es-Zxxx-419-x-audio", ExpectedResult = true)]
        [TestCase("es-Zxxx-419-X-AUDIO", ExpectedResult = true)]
        [TestCase("kjj-AZ-x-unif", ExpectedResult = false)]
        [TestCase("kjj-fonipa", ExpectedResult = false)]
        [TestCase("audio", ExpectedResult = false)]
        public bool TestIsAudioTag(string tag) => WsIdDto.IsAudioTag(tag);

        [TestCase(HttpStatusCode.Unauthorized, StatusCodes.Status403Forbidden, "Not logged in to Lexbox")]
        [TestCase(HttpStatusCode.Forbidden, StatusCodes.Status403Forbidden, "Lexbox access denied")]
        [TestCase(HttpStatusCode.NotFound, StatusCodes.Status404NotFound, "Language Forge project not found")]
        [TestCase(HttpStatusCode.InternalServerError, StatusCodes.Status502BadGateway, "Project entries request failed")]
        public async Task TestGetProjectEntriesAsyncMapsLexboxErrors(HttpStatusCode lexboxStatus, int status, string title)
        {
            _status = lexboxStatus;

            var ex = await Assert.ThrowsAsync<LexboxQueryException>(
                () => _lexboxQueryService.GetProjectEntriesAsync("token", "proj-code", Vern, []));

            Assert.That(ex.StatusCode, Is.EqualTo(status));
            Assert.That(ex.Title, Is.EqualTo(title));
        }

        [Test]
        public async Task TestCheckProjectEntriesAsyncRequestsOneEntry()
        {
            await _lexboxQueryService.CheckProjectEntriesAsync("token", "proj-code");

            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(req => req.RequestUri!.Query == "?Count=1&Offset=0"),
                ItExpr.IsAny<CancellationToken>());
        }

        [TestCase(HttpStatusCode.Forbidden, StatusCodes.Status403Forbidden)]
        [TestCase(HttpStatusCode.InternalServerError, StatusCodes.Status502BadGateway)]
        public async Task TestCheckProjectEntriesAsyncMapsLexboxErrors(HttpStatusCode lexboxStatus, int status)
        {
            _status = lexboxStatus;

            var ex = await Assert.ThrowsAsync<LexboxQueryException>(
                () => _lexboxQueryService.CheckProjectEntriesAsync("token", "proj-code"));

            Assert.That(ex.StatusCode, Is.EqualTo(status));
        }

        [Test]
        public async Task TestGetMyProjectsAsyncRejectedTokenIsNotLoggedIn()
        {
            _status = HttpStatusCode.Unauthorized;

            var ex = await Assert.ThrowsAsync<LexboxQueryException>(() => _lexboxQueryService.GetMyProjectsAsync("token"));

            Assert.That(ex.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncStopsAfterShortPage()
        {
            await _lexboxQueryService.GetProjectEntriesAsync("token", "proj-code", Vern, []);

            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(
                    req => req.RequestUri!.Query == $"?Count={LexboxQueryService.EntriesPageSize}&Offset=0"),
                ItExpr.IsAny<CancellationToken>());
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncPagesThroughAllEntries()
        {
            const int pageSize = LexboxQueryService.EntriesPageSize;
            static string Page(int start, int count) => "[" + string.Join(",", Enumerable.Range(start, count).Select(
                i => $$"""{ "id": "{{new Guid(i, 0, 0, new byte[8])}}", "lexemeForm": { "{{Vern}}": "w{{i}}" } }"""))
                + "]";
            _respond = req => req.RequestUri!.Query.EndsWith("&Offset=0", StringComparison.Ordinal)
                ? Page(0, pageSize)
                : Page(pageSize, 5);

            var words = await _lexboxQueryService.GetProjectEntriesAsync("token", "proj-code", Vern, []);

            Assert.That(words, Has.Count.EqualTo(pageSize + 5));
            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(req => req.RequestUri!.Query == $"?Count={pageSize}&Offset={pageSize}"),
                ItExpr.IsAny<CancellationToken>());
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncKeepsOnlyUndeletedSenses()
        {
            var deletedSense = SenseJson(""", "deletedAt": "2026-01-01T00:00:00Z" """, "deleted");
            var word = await GetSingleWord(EntryJson($"{SenseJson()}, {deletedSense}"));

            Assert.That(word.Senses, Has.Count.EqualTo(1));
            Assert.That(word.Senses[0].Glosses[0].Def, Is.EqualTo("gloss"));
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncPrefersAnalysisLangs()
        {
            var partOfSpeech = """
                , "partOfSpeech": { "id": "00000000-0000-0000-0000-000000000003", "name": { "fr": "nom", "pt": "nome" } }
                """;
            var note = $$""", "note": { "fr": {{RichString("fr note")}}, "pt": {{RichString("pt note")}} }""";
            var word = await GetSingleWord(EntryJson(SenseJson(partOfSpeech), note));

            Assert.That(word.Note.Language, Is.EqualTo(Analysis2));
            Assert.That(word.Note.Text, Is.EqualTo("pt note"));
            Assert.That(word.Senses[0].GrammaticalInfo.GrammaticalCategory, Is.EqualTo("nome"));
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncUnprotected()
        {
            var word = await GetSingleWord(EntryJson(SenseJson(), """, "morphType": "Stem" """));

            Assert.That(word.Accessibility, Is.EqualTo(Status.Active));
            Assert.That(word.ProtectReasons, Is.Empty);
            Assert.That(word.Senses[0].Accessibility, Is.EqualTo(Status.Active));
            Assert.That(word.Senses[0].ProtectReasons, Is.Empty);
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncProtectsEntry()
        {
            var extraFields = $$"""
                ,
                "components": [{ "id": "00000000-0000-0000-0000-000000000004" }],
                "complexForms": [{ "id": "00000000-0000-0000-0000-000000000005", "deletedAt": "2026-01-01T00:00:00Z" }],
                "literalMeaning": { "{{Analysis1}}": {{RichString("literal")}} },
                "morphType": "Suffix",
                "note": { "{{Analysis1}}": {{RichString("note 1")}}, "{{Analysis2}}": {{RichString("note 2")}} }
                """;
            var word = await GetSingleWord(EntryJson(extraFields: extraFields));

            Assert.That(word.Accessibility, Is.EqualTo(Status.Protected));
            Assert.That(Summarize(word.ProtectReasons), Is.EquivalentTo(new[]
            {
                (ReasonType.Field, (int?)null, "literal-meaning"),
                (ReasonType.Notes, 2, null),
                (ReasonType.Relations, 1, null),
                (ReasonType.TraitMorphType, null, "Suffix"),
            }));
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncProtectsSense()
        {
            var extraFields = """
                ,
                "exampleSentences": [{ "id": "00000000-0000-0000-0000-000000000006" }],
                "pictures": [{ "id": "00000000-0000-0000-0000-000000000007" }]
                """;
            var word = await GetSingleWord(EntryJson(SenseJson(extraFields)));

            Assert.That(word.Accessibility, Is.EqualTo(Status.Active));
            var sense = word.Senses[0];
            Assert.That(sense.Accessibility, Is.EqualTo(Status.Protected));
            Assert.That(Summarize(sense.ProtectReasons), Is.EquivalentTo(new[]
            {
                (ReasonType.Examples, (int?)1, (string?)null),
                (ReasonType.Illustrations, 1, null),
            }));
        }
    }
}
