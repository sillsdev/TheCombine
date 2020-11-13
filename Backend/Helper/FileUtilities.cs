using System;
using System.IO;
using System.IO.Compression;
using System.Linq;

namespace BackendFramework.Helper
{
    public static class FileUtilities
    {
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
            if (id.All(x => char.IsLetterOrDigit(x) | x == '-'))
            {
                return true;
            }
            return false;
        }

        public static string GeneratePathToHome()
        {
            // Generate path to home on linux
            var pathToHome = Environment.GetEnvironmentVariable("HOME");

            // Generate home on windows
            if (pathToHome is null)
            {
                pathToHome = Environment.GetEnvironmentVariable("UserProfile");
            }

            // Something is wrong
            if (pathToHome is null)
            {
                throw new DesktopNotFoundException();
            }

            return pathToHome;
        }

        // TODO: split this function in two that generate directories or files
        public static string GenerateFilePath(FileType type, bool isDirectory, string customFileName = "",
            string customDirPath = "")
        {
            // Generate path to home on Linux or Windows
            var pathToHome = GeneratePathToHome();

            // Path to the base data folder
            var returnFilepath = Path.Combine(pathToHome, ".CombineFiles", customDirPath);

            // Establish path to the typed file in the base folder

            // Creates the directory if it doesn't exist
            Directory.CreateDirectory(returnFilepath);

            // If the path being generated is to a dir and not a file then don't add an extension
            returnFilepath = Path.Combine(
                returnFilepath, customFileName + (isDirectory ? "" : FileTypeExtension(type)));

            return returnFilepath;
        }

        private static string FileTypeFolder(FileType type)
        {
            switch (type)
            {
                case FileType.Audio:
                    return "Audios";

                case FileType.Avatar:
                    return "Avatars";

                case FileType.Lift:
                    return "lifts";

                case FileType.Zip:
                    return "zips";

                default:
                    return "";
            }
        }

        private static string FileTypeExtension(FileType type)
        {
            switch (type)
            {
                case FileType.Audio:
                    return ".webm";

                case FileType.Avatar:
                    return ".jpg";

                case FileType.Lift:
                    return ".lift";

                case FileType.Zip:
                    return ".zip";

                default:
                    return "";
            }
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
                extractionDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
            }

            Directory.CreateDirectory(extractionDir);
            ZipFile.ExtractToDirectory(zipFilePath, extractionDir);
            if (deleteZipFile)
            {
                File.Delete(zipFilePath);
            }
            return extractionDir;
        }

        public class DesktopNotFoundException : Exception
        {
        }
    }
}
