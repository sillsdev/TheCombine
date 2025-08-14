using System;
using BackendFramework.Helper;
using static BackendFramework.Helper.FileStorage;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    internal sealed class FileStorageTests
    {
        [Test]
        public void TestFileTypeExtension()
        {
            Assert.That(FileTypeExtension(FileType.Audio), Is.EqualTo(".webm"));
            Assert.That(FileTypeExtension(FileType.Avatar), Is.EqualTo(".jpg"));
            Assert.That(() => FileTypeExtension((FileType)99), Throws.TypeOf<NotImplementedException>());
        }

        [Test]
        public void TestFilePathIdSanitization()
        {
            const string invalidId = "@";
            const string validId = "a";
            Assert.That(() => GenerateAudioFilePathForWord(invalidId, validId), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GenerateAudioFilePathForWord(validId, invalidId), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GenerateAudioFilePath(invalidId, "file.mp3"), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GenerateAudioFileDirPath(invalidId), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GenerateImportExtractedLocationDirPath(invalidId), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GenerateLiftImportDirPath(invalidId), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GenerateAvatarFilePath(invalidId), Throws.TypeOf<InvalidIdException>());
            Assert.That(() => GetProjectDir(invalidId), Throws.TypeOf<InvalidIdException>());
        }
    }
}
