using System.Collections.Generic;
using NUnit.Framework;

using BackendFramework.Helper;

namespace Backend.Tests.Helper
{
    public class SanitizationTests
    {
        private static List<string> _validIds = new()
        {
            "a",
            "1",
            "a-5"
        };
        [TestCaseSource(nameof(_validIds))]
        public void TestValidIds(string id)
        {
            Assert.That(Sanitization.SanitizeId(id));
        }

        private static List<string> _invalidIds = new()
        {
            "_",
            "a_1",
            ".",
            "a.1",
            "/",
            "\\",
            "../a",
            "..\\a",
            "../1",
            "..\\1",
            "!",
            "@",
            "#",
            "$",
            "%",
            "^",
            "&",
            "*",
            "+",
            "<",
            ">",
            ":",
            "|",
            "?"
        };
        [TestCaseSource(nameof(_invalidIds))]
        public void TestInvalidIds(string id)
        {
            Assert.False(Sanitization.SanitizeId(id));
        }

        private static List<string> _validFileNames = new()
        {
            "a",
            "1",
            "ab555.webm",
            "a-5.webm",
            "a-5.jpg",
            "a-5.png",
            "a_5.png",
            "a-5.png",
            "a(5).png",
            "a 5.png",
            "a,5.png"
        };
        [TestCaseSource(nameof(_validFileNames))]
        public void TestValidFileNames(string fileName)
        {
            Assert.That(Sanitization.SanitizeFileName(fileName));
        }

        private static List<string> _invalidFileNames = new()
        {
            "/",
            "\\",
            "../a",
            "..\\a",
            "../1",
            "..\\1",
            "!",
            "@",
            "#",
            "$",
            "%",
            "^",
            "&",
            "*",
            "+",
            "<",
            ">",
            ":",
            "|",
            "?"
        };
        [TestCaseSource(nameof(_invalidFileNames))]
        public void TestInvalidFileNames(string fileName)
        {
            Assert.False(Sanitization.SanitizeFileName(fileName));
        }

        private static List<List<string>> _namesUnfriendlyFriendly = new()
        {
            new List<string> { "A1phaNum3ricN0Change", "A1phaNum3ricN0Change" },
            new List<string> { "RémöveOrRèpláceÄccênts", "RemoveOrReplaceAccents" },
            new List<string> { "math+and=currency$to<dash", "math-and-currency-to-dash" },
            new List<string> { "make spaces underscores", "make_spaces_underscores" },
            new List<string> { "(){}[]", "()()()" },
            new List<string> { "こんにちは", "-----" }
        };
        [TestCaseSource(nameof(_namesUnfriendlyFriendly))]
        public void TestMakeFriendlyForPath(List<string> nameName)
        {
            Assert.That(Sanitization.MakeFriendlyForPath(nameName[0]), Is.EqualTo(nameName[1]));
        }

        [Test]
        public void TestMakeFriendlyForPathFallback()
        {
            const string fallback = "Lift";
            const string nonEmpty = "qwerty";
            Assert.That(Sanitization.MakeFriendlyForPath(""), Is.EqualTo(""));
            Assert.That(Sanitization.MakeFriendlyForPath("", fallback), Is.EqualTo(fallback));
            Assert.That(Sanitization.MakeFriendlyForPath(nonEmpty, fallback), Is.EqualTo(nonEmpty));
        }
    }
}
