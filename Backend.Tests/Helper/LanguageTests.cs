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
                Definitions = [new() { Language = "a" }, new() { Language = "b" }, new() { Language = "c" }],
                Glosses = [new() { Language = "b" }, new() { Language = "d" }]
            };
            var tags = GetSenseAnalysisLangTags(sense).ToList();
            tags.Sort();
            Assert.That(tags, Is.EqualTo(new List<string> { "a", "b", "c", "d" }));
        }

        [Test]
        public void TestConvertLangTagToWritingSystemEn()
        {
            var tags = new List<string> { "en", "en-US", "ajsdlfj" };
            var converted = ConvertLangTagsToWritingSystems(tags).ToList();
            var expected = new List<WritingSystem> { new("en", "English"), new("en-US", "English"), new("ajsdlfj") };
            Assert.That(converted, Is.EqualTo(expected).UsingPropertiesComparer());
        }

        [Test]
        public void TestCompareWritingSystems()
        {
            // 3-letter codes first.
            //      Named before unnamed, alphabetical primarily by name.
            var ws1 = new WritingSystem("pis", "Pijin");
            var ws2 = new WritingSystem("pis", "Solomons Pijin");
            //      Unnamed after named, alphabetical by code.
            var ws3 = new WritingSystem("pis-x-PIJ");
            var ws4 = new WritingSystem("qaa-pis");
            // 2-letter codes last.
            //      Named before unnamed, alphabetical secondarily by code.
            var ws5 = new WritingSystem("en", "English");
            var ws6 = new WritingSystem("en-US", "English");
            //      Unnamed after named.
            var ws7 = new WritingSystem("en");

            var toSort = new List<WritingSystem> { ws6, ws7, ws4, ws5, ws2, ws3, ws1 };
            var expected = new List<WritingSystem> { ws1, ws2, ws3, ws4, ws5, ws6, ws7 };
            toSort.Sort(CompareWritingSystems);
            Assert.That(toSort, Is.EqualTo(expected).UsingPropertiesComparer());
        }
    }
}
