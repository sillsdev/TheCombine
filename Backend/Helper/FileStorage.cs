using System;
using System.Diagnostics.CodeAnalysis;
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
        private static readonly string ImportExtractedLocation = Path.Combine("Import", "ExtractedLocation");
        private static readonly string LiftImportSuffix = Path.Combine(ImportExtractedLocation, "Lift");
        private static readonly string AudioPathSuffix = Path.Combine(LiftImportSuffix, "audio");

        public enum FileType
        {
            Audio,
            Avatar
        }

        /// <summary> Indicates that an error occurred locating the current user's home directory. </summary>
        [Serializable]
        public class HomeFolderNotFoundException : Exception { }

        /// <summary> Indicates an invalid input id. </summary>
        [Serializable]
        public class InvalidIdException : Exception { }

        /// <summary>
        /// Generate a path to the file name of an audio file for the Project based on the Word ID.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        public static string GenerateAudioFilePathForWord(string projectId, string wordId)
        {
            if (!Sanitization.SanitizeId(projectId) || !Sanitization.SanitizeId(wordId))
            {
                throw new InvalidIdException();
            }
            return GenerateProjectFilePath(projectId, AudioPathSuffix, wordId, FileType.Audio);
        }

        /// <summary>
        /// Generate a path to the file name of an audio file for the Project.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        public static string GenerateAudioFilePath(string projectId, string fileName)
        {
            if (!Sanitization.SanitizeId(projectId))
            {
                throw new InvalidIdException();
            }
            return GenerateProjectFilePath(projectId, AudioPathSuffix, fileName);
        }

        /// <summary>
        /// Generate a path to the directory where audio files are stored for the Project.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        public static string GenerateAudioFileDirPath(string projectId, bool createDir = true)
        {
            if (!Sanitization.SanitizeId(projectId))
            {
                throw new InvalidIdException();
            }
            return GenerateProjectDirPath(projectId, AudioPathSuffix, createDir);
        }

        /// <summary>
        /// Generate a path to the parent directory where Lift exports are stored.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        /// <remarks> This function is not expected to be used often. </remarks>
        public static string GenerateImportExtractedLocationDirPath(string projectId, bool createDir = true)
        {
            if (!Sanitization.SanitizeId(projectId))
            {
                throw new InvalidIdException();
            }
            return GenerateProjectDirPath(projectId, ImportExtractedLocation, createDir);
        }

        /// <summary>
        /// Generate a path to the Lift import folder. This also stores audio files within it.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        public static string GenerateLiftImportDirPath(string projectId, bool createDir = true)
        {
            if (!Sanitization.SanitizeId(projectId))
            {
                throw new InvalidIdException();
            }
            return GenerateProjectDirPath(projectId, LiftImportSuffix, createDir);
        }

        /// <summary>
        /// Generate the path to where Avatar images are stored.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        public static string GenerateAvatarFilePath(string userId)
        {
            if (!Sanitization.SanitizeId(userId))
            {
                throw new InvalidIdException();
            }
            return GenerateFilePath(AvatarsDir, userId, FileType.Avatar);
        }

        /// <summary>
        /// Get the top-level path to where all files are stored for the project.
        /// </summary>
        /// <exception cref="InvalidIdException"> Throws when id invalid. </exception>
        public static string GetProjectDir(string projectId)
        {
            if (!Sanitization.SanitizeId(projectId))
            {
                throw new InvalidIdException();
            }
            return GenerateProjectDirPath(projectId, "", false);
        }

        /// <summary> Get the path to the home directory of the current user. </summary>
        /// <exception cref="HomeFolderNotFoundException">
        /// Throws when no home path found in local environment variables.
        /// </exception>
        /// <remarks>
        /// Exclude this function from coverage because it interacts with environment variables that are onerous
        /// to mock.
        /// </remarks>
        [ExcludeFromCodeCoverage]
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
        public static string FileTypeExtension(FileType type)
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
