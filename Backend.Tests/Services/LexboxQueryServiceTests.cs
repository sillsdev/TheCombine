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

        private static readonly Guid ProjId = new("00000000-0000-0000-0000-0000000000ee");
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

        private const string Deleted = """, "deletedAt": "2026-01-01T00:00:00Z" """;

        private static string RichString(string text) => $$"""{ "spans": [{ "text": "{{text}}" }] }""";

        private static string EntryJson(string? senses = null, string extraFields = "", string vern = "vern")
        {
            return $$"""
                {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "lexemeForm": { "{{Vern}}": "{{vern}}" },
                    "senses": [{{senses ?? SenseJson()}}]
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
                "token", ProjId, Vern, [Analysis1, Analysis2]);
            Assert.That(words, Has.Count.EqualTo(1));
            return words[0];
        }

        private static string WritingSystemJson(string wsId, string extraFields = "")
            => $$"""{ "wsId": "{{wsId}}", "name": "", "abbreviation": "", "font": "", "type": 0 {{extraFields}} }""";

        private const string IsAudio = """, "isAudio": true""";

        private void RespondWithProject(string analysisWss, string vernacularWss)
        {
            _respond = req => req.RequestUri!.AbsolutePath.EndsWith("/writing-systems", StringComparison.Ordinal)
                ? $$"""{ "analysis": [{{analysisWss}}], "vernacular": [{{vernacularWss}}] }"""
                : $$"""[{ "id": "{{ProjId}}", "code": "proj-code", "name": "Project", "role": "Manager" }]""";
        }

        [Test]
        public async Task TestGetMyProjectsAsyncGetsWritingSystems()
        {
            const string deleted = """, "deletedAt": "2026-01-01T00:00:00Z" """;
            RespondWithProject($"{WritingSystemJson("en")}, {WritingSystemJson("ru")}",
                $"{WritingSystemJson("es-419")}, {WritingSystemJson("es-Zxxx-419-x-audio", IsAudio)}, "
                + WritingSystemJson("es-fonipa", deleted));

            var projects = await _lexboxQueryService.GetMyProjectsAsync("token");

            Assert.That(projects, Has.Count.EqualTo(1));
            var project = projects[0];
            Assert.That(project.Id, Is.EqualTo(ProjId));
            Assert.That(project.Code, Is.EqualTo("proj-code"));
            Assert.That(project.Name, Is.EqualTo("Project"));
            Assert.That(project.AnalysisWsTags, Is.EqualTo(new List<string> { "en", "ru" }));
            Assert.That(project.VernacularWsTags, Is.EqualTo(new List<string> { "es-419" }));
            Assert.That(project.ImportBlocker, Is.Null);
            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(
                    req => req.RequestUri!.AbsoluteUri == $"{LexboxQuery.LexiconUrl}/project/{ProjId}/writing-systems"),
                ItExpr.IsAny<CancellationToken>());
        }

        [Test]
        public async Task TestGetMyProjectsAsyncBlocksNoVernacularLanguage()
        {
            RespondWithProject(WritingSystemJson("en"), WritingSystemJson("es-Zxxx-x-audio", IsAudio));

            var projects = await _lexboxQueryService.GetMyProjectsAsync("token");

            Assert.That(projects, Has.Count.EqualTo(1));
            Assert.That(projects[0].ImportBlocker, Is.EqualTo(LexboxImportBlocker.NoVernacularLanguage));
        }

        [Test]
        public async Task TestGetMyProjectsAsyncWithNoProjects()
        {
            var projects = await _lexboxQueryService.GetMyProjectsAsync("token");

            Assert.That(projects, Is.Empty);
        }

        [Test]
        public async Task TestGetMyProjectsAsyncRejectedTokenIsNotLoggedIn()
        {
            _status = HttpStatusCode.Unauthorized;

            var ex = await Assert.ThrowsAsync<LexboxQueryException>(() => _lexboxQueryService.GetMyProjectsAsync("token"));

            Assert.That(ex.StatusCode, Is.EqualTo(StatusCodes.Status403Forbidden));
            Assert.That(ex.IsNotLoggedIn, Is.True);
        }

        [TestCase(HttpStatusCode.Unauthorized, StatusCodes.Status403Forbidden, "Not logged in to Lexbox")]
        [TestCase(HttpStatusCode.Forbidden, StatusCodes.Status403Forbidden, "Lexbox access denied")]
        [TestCase(HttpStatusCode.NotFound, StatusCodes.Status404NotFound, "Lexbox project not found")]
        [TestCase(HttpStatusCode.Conflict, StatusCodes.Status409Conflict, "Lexbox project not ready")]
        [TestCase(HttpStatusCode.InternalServerError, StatusCodes.Status502BadGateway, "Project entries request failed")]
        public async Task TestGetProjectEntriesAsyncMapsLexboxErrors(HttpStatusCode lexboxStatus, int status, string title)
        {
            _status = lexboxStatus;

            var ex = await Assert.ThrowsAsync<LexboxQueryException>(
                () => _lexboxQueryService.GetProjectEntriesAsync("token", ProjId, Vern, []));

            Assert.That(ex.StatusCode, Is.EqualTo(status));
            Assert.That(ex.Title, Is.EqualTo(title));
        }

        [Test]
        public async Task TestCheckProjectEntriesAsyncRequestsOneEntry()
        {
            await _lexboxQueryService.CheckProjectEntriesAsync("token", ProjId);

            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(
                    req => req.RequestUri!.AbsoluteUri == $"{LexboxQuery.LexiconUrl}/project/{ProjId}/entries?Count=1"),
                ItExpr.IsAny<CancellationToken>());
        }

        [TestCase(HttpStatusCode.Forbidden, StatusCodes.Status403Forbidden)]
        [TestCase(HttpStatusCode.Conflict, StatusCodes.Status409Conflict)]
        [TestCase(HttpStatusCode.InternalServerError, StatusCodes.Status502BadGateway)]
        public async Task TestCheckProjectEntriesAsyncMapsLexboxErrors(HttpStatusCode lexboxStatus, int status)
        {
            _status = lexboxStatus;

            var ex = await Assert.ThrowsAsync<LexboxQueryException>(
                () => _lexboxQueryService.CheckProjectEntriesAsync("token", ProjId));

            Assert.That(ex.StatusCode, Is.EqualTo(status));
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncRequestsAllEntries()
        {
            _responseJson = $"[{EntryJson(vern: "one")}, {EntryJson(vern: "two")}]";

            var words = await _lexboxQueryService.GetProjectEntriesAsync("token", ProjId, Vern, []);

            Assert.That(words.Select(w => w.Vernacular), Is.EqualTo(new List<string> { "one", "two" }));
            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(
                    req => req.RequestUri!.AbsoluteUri == $"{LexboxQuery.LexiconUrl}/project/{ProjId}/entries?Count=-1"),
                ItExpr.IsAny<CancellationToken>());
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncSkipsDeletedEntries()
        {
            _responseJson = $"[{EntryJson(extraFields: Deleted)}]";

            var words = await _lexboxQueryService.GetProjectEntriesAsync("token", ProjId, Vern, []);

            Assert.That(words, Is.Empty);
        }

        [TestCase(false)]
        [TestCase(true)]
        public async Task TestGetProjectEntriesAsyncSkipsEntriesWithoutUndeletedSenses(bool hasDeletedSense)
        {
            var senses = hasDeletedSense ? SenseJson(Deleted) : "";
            _responseJson = $"[{EntryJson(senses)}]";

            var words = await _lexboxQueryService.GetProjectEntriesAsync("token", ProjId, Vern, []);

            Assert.That(words, Is.Empty);
        }

        [Test]
        public async Task TestGetProjectEntriesAsyncTrimsAndComposesText()
        {
            // "cafe" followed by U+0301 COMBINING ACUTE ACCENT, which NFC composes into "café".
            const string decomposed = "cafe\u0301";
            const string composed = "caf\u00e9";
            var definition = $$""", "definition": { "{{Analysis1}}": {{RichString($" {decomposed} ")}} }""";
            var note = $$""", "note": { "{{Analysis1}}": {{RichString($" {decomposed} ")}} }""";

            var word = await GetSingleWord(
                EntryJson(SenseJson(definition, $" {decomposed} "), note, $" {decomposed} "));

            Assert.That(word.Vernacular, Is.EqualTo(composed));
            Assert.That(word.Note.Text, Is.EqualTo(composed));
            Assert.That(word.Senses[0].Glosses[0].Def, Is.EqualTo(composed));
            Assert.That(word.Senses[0].Definitions[0].Text, Is.EqualTo(composed));
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
