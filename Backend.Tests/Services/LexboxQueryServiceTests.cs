using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Models;
using BackendFramework.Services;
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

        private const string Vern = "seh";
        private const string Analysis1 = "en";
        private const string Analysis2 = "pt";

        [SetUp]
        public void Setup()
        {
            _responseJson = "[]";
            _handlerMock = new Mock<HttpMessageHandler>();
            _handlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync", ItExpr.IsAny<HttpRequestMessage>(), ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(() => new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(_responseJson)
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
        public async Task TestGetProjectEntriesAsyncRequestsAllEntries()
        {
            await _lexboxQueryService.GetProjectEntriesAsync("token", "proj-code", Vern, []);

            _handlerMock.Protected().Verify(
                "SendAsync",
                Times.Once(),
                ItExpr.Is<HttpRequestMessage>(req => req.RequestUri!.Query == "?Count=-1"),
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
