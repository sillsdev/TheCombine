using System;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace BackendFramework.Helper
{
    public static class FileUtilities
    {
        private static readonly string ImportExtractedLocation = Path.Combine("Import", "ExtractedLocation");
        private static readonly string LiftImportSuffix = Path.Combine(ImportExtractedLocation, "Lift");
        private static readonly string AudioPathSuffix = Path.Combine(LiftImportSuffix, "audio");

        private enum FileType
        {
            Audio,
            Avatar
        }

        /// <summary> Get the path to the home directory of the current user. </summary>
        private static string GetHomePath()
        {
            // Generate path to home on Linux or Windows.
            var homePath =
                Environment.GetEnvironmentVariable("HOME") ?? Environment.GetEnvironmentVariable("UserProfile");

            // Ensure home directory is found correctly.
            if (homePath is null)
            {
                throw new HomeFolderNotFoundException();
            }

            return homePath;
        }

        /// <summary> Returns the path where project files are stored on disk. </summary>
        private static string GetBackendFileStoragePath()
        {
            return Path.Combine(GetHomePath(), ".CombineFiles");
        }

        public static string GenerateAudioFilePathForWord(string projectId, string wordId)
        {
            return GenerateProjectFilePath(projectId, AudioPathSuffix, wordId, FileType.Audio);
        }

        public static string GenerateAudioFilePath(string projectId, string fileName)
        {
            return GenerateProjectFilePath(projectId, AudioPathSuffix, fileName);
        }

        public static string GenerateAudioFileDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, AudioPathSuffix, createDir);
        }

        public static string GenerateImportExtractedLocationDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, ImportExtractedLocation, createDir);
        }

        public static string GenerateLiftImportDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, LiftImportSuffix, createDir);
        }

        public static string GenerateLiftExportDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, "Export", createDir);
        }

        public static string GenerateAvatarFilePath(string userId)
        {
            return GenerateFilePath("Avatars", userId, FileType.Avatar);
        }

        private static string GenerateDirPath(string suffixPath, bool createDir)
        {
            var dirPath = Path.Combine(GetBackendFileStoragePath(), suffixPath);
            // Creates the directory if it doesn't already exist.
            if (createDir)
            {
                Directory.CreateDirectory(dirPath);
            }

            return dirPath;
        }

        private static string GenerateProjectDirPath(string projectId, string suffixPath, bool createDir)
        {
            return GenerateDirPath(Path.Combine(projectId, suffixPath), createDir);
        }

        private static string GenerateProjectFilePath(string projectId, string suffixPath, string fileName)
        {
            return GenerateFilePath(Path.Combine(projectId, suffixPath), fileName);
        }

        private static string GenerateProjectFilePath(
            string projectId, string suffixPath, string fileName, FileType type)
        {
            return GenerateProjectFilePath(projectId, suffixPath, GenerateFileName(fileName, type));
        }

        private static string GenerateFilePath(string suffixPath, string fileName)
        {
            var dirPath = GenerateDirPath(suffixPath, true);
            return Path.Combine(dirPath, fileName);
        }

        private static string GenerateFilePath(string suffixPath, string fileName, FileType type)
        {
            return GenerateFilePath(suffixPath, GenerateFileName(fileName, type));
        }

        private static string GenerateFileName(string fileNameStem, FileType type)
        {
            return $"{fileNameStem}{FileTypeExtension(type)}";
        }

        private static string FileTypeExtension(FileType type)
        {
            return type switch
            {
                FileType.Audio => ".webm",
                FileType.Avatar => ".jpg",
                _ => throw new NotImplementedException()
            };
        }

        /// <summary>
        /// Create a randomly named directory in the system's temp folder, and get its name.
        /// </summary>
        /// <param name="create"> Whether to create the directory. </param>
        /// <returns> Path to random temporary directory. </returns>
        public static string GetRandomTempDir(bool create = true)
        {
            var tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            if (create)
            {
                Directory.CreateDirectory(tempDir);
            }
            return tempDir;
        }

        /// <summary>
        /// Extract a zip file to a new path, creating a unique temporary directory if requested.
        /// </summary>
        /// <param name="zipFilePath"> Path to zip file to extract. </param>
        /// <param name="extractionDir">
        /// Directory path to create and extract zip file contents too. If null, a temporary directory is created.
        /// </param>
        /// <param name="deleteZipFile"> Whether to delete the zip file after extracting it. </param>
        /// <returns> The path to the extracted contents. </returns>
        public static string ExtractZipFile(string zipFilePath, string? extractionDir, bool deleteZipFile = false)
        {
            if (extractionDir is null)
            {
                extractionDir = GetRandomTempDir(false);
            }

            Directory.CreateDirectory(extractionDir);
            ZipFile.ExtractToDirectory(zipFilePath, extractionDir);
            if (deleteZipFile)
            {
                File.Delete(zipFilePath);
            }
            return extractionDir;
        }

        /// <summary>
        /// Recursively copies one directory into another.
        /// </summary>
        public static void CopyDirectory(string sourceDir, string targetDir)
        {
            Directory.CreateDirectory(targetDir);

            foreach (var file in Directory.GetFiles(sourceDir))
            {
                File.Copy(file, Path.Combine(targetDir, Path.GetFileName(file)));
            }

            foreach (var directory in Directory.GetDirectories(sourceDir))
            {
                CopyDirectory(directory, Path.Combine(targetDir, Path.GetFileName(directory)));
            }
        }

        public class HomeFolderNotFoundException : Exception
        {
        }
    }
}
