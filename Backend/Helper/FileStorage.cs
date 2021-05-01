using System;
using System.IO;

namespace BackendFramework.Helper
{
    /// <summary>
    /// An abstraction around where backend files are stored.
    /// All paths related to persistent files stored on disks should be processed here.
    /// </summary>
    public static class FileStorage
    {
        private const string CombineFilesDir = ".CombineFiles";
        private const string AvatarsDir = "Avatars";
        private const string ExportDir = "Export";
        private static readonly string ImportExtractedLocation = Path.Combine("Import", "ExtractedLocation");
        private static readonly string LiftImportSuffix = Path.Combine(ImportExtractedLocation, "Lift");
        private static readonly string AudioPathSuffix = Path.Combine(LiftImportSuffix, "audio");

        private enum FileType
        {
            Audio,
            Avatar
        }

        /// <summary> Indicates that an error occured locating the current user's home directory. </summary>
        [Serializable]
        public class HomeFolderNotFoundException : Exception { }

        /// <summary>
        /// Generate a path to the file name of an audio file for the Project based on the Word ID.
        /// </summary>
        public static string GenerateAudioFilePathForWord(string projectId, string wordId)
        {
            return GenerateProjectFilePath(projectId, AudioPathSuffix, wordId, FileType.Audio);
        }

        /// <summary>
        /// Generate a path to the file name of an audio file for the Project.
        /// </summary>
        public static string GenerateAudioFilePath(string projectId, string fileName)
        {
            return GenerateProjectFilePath(projectId, AudioPathSuffix, fileName);
        }

        /// <summary>
        /// Generate a path to the directory where audio files are stored for the Project.
        /// </summary>
        public static string GenerateAudioFileDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, AudioPathSuffix, createDir);
        }

        /// <summary>
        /// Generate a path to the parent directory where Lift exports are stored.
        /// </summary>
        /// <remarks> This function is not expected to be used often. </remarks>
        public static string GenerateImportExtractedLocationDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, ImportExtractedLocation, createDir);
        }

        /// <summary>
        /// Generate a path to the Lift import folder. This also stores audio files within it.
        /// </summary>
        public static string GenerateLiftImportDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, LiftImportSuffix, createDir);
        }

        /// <summary>
        /// Generate a path to the temporary Lift Export folder used during export.
        /// </summary>
        /// <remarks> This function may be removed in the future and replaced by temporary directory use. </remarks>
        public static string GenerateLiftExportDirPath(string projectId, bool createDir = true)
        {
            return GenerateProjectDirPath(projectId, ExportDir, createDir);
        }

        /// <summary>
        /// Generate the path to where Avatar images are stored.
        /// </summary>
        public static string GenerateAvatarFilePath(string userId)
        {
            return GenerateFilePath(AvatarsDir, userId, FileType.Avatar);
        }

        /// <summary>
        /// Get the top-level path to where all files are stored for the project.
        /// </summary>
        public static string GetProjectDir(string projectId)
        {
            return GenerateProjectDirPath(projectId, "", false);
        }

        /// <summary> Get the path to the home directory of the current user. </summary>
        /// <exception cref="HomeFolderNotFoundException">
        /// Throws when no home path found in local environment variables.
        /// </exception>
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
            return Path.Combine(GetHomePath(), CombineFilesDir);
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

        private static string GenerateFilePath(string suffixPath, string fileNameSuffix, FileType type)
        {
            return GenerateFilePath(suffixPath, GenerateFileName(fileNameSuffix, type));
        }

        /// <summary>
        /// Append an appropriate file extension to a file name based on the file's type.
        /// </summary>
        private static string GenerateFileName(string fileNameStem, FileType type)
        {
            return $"{fileNameStem}{FileTypeExtension(type)}";
        }

        /// <summary> Generate an appropriate file extension for a given type. </summary>
        private static string FileTypeExtension(FileType type)
        {
            return type switch
            {
                FileType.Audio => ".webm",
                FileType.Avatar => ".jpg",
                _ => throw new NotImplementedException()
            };
        }
    }
}
