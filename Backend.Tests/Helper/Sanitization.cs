using System.Collections.Generic;
using NUnit.Framework;

using BackendFramework.Helper;

namespace Backend.Tests.Helper
{
    public class SanitizationTests
    {
        private static List<string> _validIds = new List<string>
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

        private static List<string> _invalidIds = new List<string>
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

        private static List<string> _validFileNames = new List<string>
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

        private static List<string> _invalidFileNames = new List<string>
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
    }
}
