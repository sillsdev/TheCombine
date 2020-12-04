using System;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace BackendFramework.Helper
{
    public static class FileUtilities
    {
        private static readonly string AudioPathSuffix = Path.Combine("Import", "ExtractedLocation", "Lift", "audio");

        public enum FileType
        {
            Audio,
            Avatar,
            Lift,
            Zip,
            Dir
        }

        public static bool SanitizeId(string id)
        {
            return id.All(x => char.IsLetterOrDigit(x) | x == '-');
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
        public static string GetBackendFileStoragePath()
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

        public static string GenerateAvatarFilePath(string userId)
        {
            return GenerateFilePath("Avatars", userId, FileType.Avatar);
        }

        // TODO: Refactor into more directory-specific function.
        public static string GenerateDirPath(FileType type, bool isDirectory, string customFileName = "",
            string customDirPath = "")
        {
            // Path to the base data folder
            var returnFilepath = Path.Combine(GetBackendFileStoragePath(), customDirPath);

            // Establish path to the typed file in the base folder

            // Creates the directory if it doesn't exist
            Directory.CreateDirectory(returnFilepath);

            // If the path being generated is to a dir and not a file then don't add an extension
            returnFilepath = Path.Combine(
                returnFilepath, customFileName + (isDirectory ? "" : FileTypeExtension(type)));

            return returnFilepath;
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
            var returnFilepath = Path.Combine(GetBackendFileStoragePath(), suffixPath);
            // Creates the directory if it doesn't exist
            Directory.CreateDirectory(returnFilepath);
            return Path.Combine(returnFilepath, fileName);
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
                FileType.Lift => ".lift",
                FileType.Zip => ".zip",
                _ => ""
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
