using System;
using BackendFramework.Helper;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class FileStorageTests
    {
        [Test]
        public void TestInvalidFileTypeExtension()
        {
            Assert.Throws<NotImplementedException>(() => { FileStorage.FileTypeExtension((FileStorage.FileType) 99); });
        }
    }
}
