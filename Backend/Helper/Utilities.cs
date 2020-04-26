using System;
using System.IO;

namespace BackendFramework.Helper
{
    public class Utilities
    {
        public enum FileType
        {
            Audio,
            Avatar,
            Lift,
            Zip,
            Dir
        }

        // TODO: split this function in two that generate directories or files
        public string GenerateFilePath(FileType type, bool isDirectory, string customFileName = "",
            string customDirPath = "")
        {
            // Generate path to home on linux
            string pathToHome = Environment.GetEnvironmentVariable("HOME");

            // Generate home on windows
            if (pathToHome == null)
            {
                pathToHome = Environment.GetEnvironmentVariable("UserProfile");
            }

            // Something is wrong
            if (pathToHome == null)
            {
                throw new DesktopNotFoundException();
            }

            // Path to the base data folder
            string returnFilepath = Path.Combine(pathToHome, ".CombineFiles", customDirPath);

            // Establish path to the typed file in the base folder

            // Creates the directory if it doesn't exist
            Directory.CreateDirectory(returnFilepath);

            // If the path being generated is to a dir and not a file then don't add an extension
            returnFilepath = Path.Combine(returnFilepath, customFileName + (isDirectory ? "" : FileTypeExtension(type)));

            return returnFilepath;
        }

        private string FileTypeFolder(FileType type)
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
                    return ""; ;
            }
        }

        public class DesktopNotFoundException : Exception
        {
        }
    }
}
