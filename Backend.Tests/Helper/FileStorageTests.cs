using System;
using BackendFramework.Helper;
using static BackendFramework.Helper.FileStorage;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class FileStorageTests
    {
        [Test]
        public void TestFileTypeExtension()
        {
            Assert.That(FileTypeExtension(FileType.Audio), Is.EqualTo(".webm"));
            Assert.That(FileTypeExtension(FileType.Avatar), Is.EqualTo(".jpg"));
            Assert.Throws<NotImplementedException>(() => { FileTypeExtension((FileType)99); });
        }

        [Test]
        public void TestFilePathIdSanitization()
        {
            const string invalidId = "@";
            const string validId = "a";
            Assert.Throws<InvalidIdException>(
                () => GenerateAudioFilePathForWord(invalidId, validId));
            Assert.Throws<InvalidIdException>(
                () => GenerateAudioFilePathForWord(validId, invalidId));
            Assert.Throws<InvalidIdException>(
                () => GenerateAudioFilePath(invalidId, "file.mp3"));
            Assert.Throws<InvalidIdException>(
                () => GenerateAudioFileDirPath(invalidId));
            Assert.Throws<InvalidIdException>(
                () => GenerateImportExtractedLocationDirPath(invalidId));
            Assert.Throws<InvalidIdException>(
                () => GenerateLiftImportDirPath(invalidId));
            Assert.Throws<InvalidIdException>(
                () => GenerateAvatarFilePath(invalidId));
            Assert.Throws<InvalidIdException>(
                () => GetProjectDir(invalidId));
        }
    }
}
