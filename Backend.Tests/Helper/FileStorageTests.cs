using System;
using BackendFramework.Helper;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class FileStorageTests
    {
        [Test]
        public void TestFileTypeExtension()
        {
            Assert.AreEqual(FileStorage.FileTypeExtension(FileStorage.FileType.Audio), ".webm");
            Assert.AreEqual(FileStorage.FileTypeExtension(FileStorage.FileType.Avatar), ".jpg");
            Assert.Throws<NotImplementedException>(() => { FileStorage.FileTypeExtension((FileStorage.FileType)99); });
        }
    }
}
