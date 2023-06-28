using System.Collections.Generic;
using System.Linq;
using BackendFramework.Models;
using static BackendFramework.Helper.Language;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class LanguageTests
    {
        [Test]
        public void TestGetSenseAnalysisLangTagsEmpty()
        {
            Assert.That(GetSenseAnalysisLangTags(new Sense()), Is.EqualTo(new List<string>()));
        }

        [Test]
        public void TestGetSenseAnalysisLangTagsFull()
        {
            var sense = new Sense
            {
                Definitions = new List<Definition> {
                    new Definition {Language = "a"},
                    new Definition {Language = "b"},
                    new Definition {Language = "c"},
                },
                Glosses = new List<Gloss> {
                    new Gloss {Language = "b"},
                    new Gloss {Language = "d"}
                }
            };
            var tags = GetSenseAnalysisLangTags(sense).ToList();
            tags.Sort();
            Assert.That(tags, Is.EqualTo(new List<string> { "a", "b", "c", "d" }));
        }

        [Test]
        public void TestConvertLangTagToWritingSystemEn()
        {
            var tags = new List<string> { "en", "en-US", "ajsdlfj" };
            var writingSystems = new List<WritingSystem> {
                new WritingSystem {Bcp47 = "en", Name = "English"},
                new WritingSystem {Bcp47 = "en-US", Name = "English"},
                new WritingSystem {Bcp47 = "ajsdlfj", Name = ""},

            };
            Assert.That(ConvertLangTagsToWritingSystems(tags).ToList(), Is.EqualTo(writingSystems));
        }
    }
}
