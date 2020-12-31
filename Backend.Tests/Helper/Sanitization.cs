using System.Collections.Generic;
using NUnit.Framework;

using BackendFramework.Helper;

namespace Backend.Tests.Helper
{
    public class SanitizationTests
    {
        private static List<string> _validFileNames = new List<string>
        {
            "a",
            "1",
            "ab555.webm",
            "a-5.webm",
            "a-5.jpg",
            "a-5.png",
            "a_5.png"
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
            "(",
            ")",
            "+"
        };
        [TestCaseSource(nameof(_invalidFileNames))]
        public void TestInvalidFileNames(string fileName)
        {
            Assert.False(Sanitization.SanitizeFileName(fileName));
        }
    }
}
