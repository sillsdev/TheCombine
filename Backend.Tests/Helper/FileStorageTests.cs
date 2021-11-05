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

        [Test]
        public void TestFilePathIdSanitization()
        {
            const string invalidId = "@";
            const string validId = "a";
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateAudioFilePathForWord(invalidId, validId));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateAudioFilePathForWord(validId, invalidId));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateAudioFilePath(invalidId, "file.mp3"));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateAudioFileDirPath(invalidId));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateImportExtractedLocationDirPath(invalidId));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateLiftImportDirPath(invalidId));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GenerateAvatarFilePath(invalidId));
            Assert.Throws<FileStorage.InvalidIdException>(
                () => FileStorage.GetProjectDir(invalidId));
        }
    }
}
