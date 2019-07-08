using System;
using System.IO;

namespace BackendFramework.Helper
{
    public class Utilities
    {
        public enum filetype
        {
            audio,
            avatar,
            lift,
            zip,
            dir
        }

        public string GenerateFilePath(filetype type, bool isDirectory, string customFileName = "", string customDirPath = "AmbigProjectName")
        {
            //generate path to home on linux
            var pathToHome = Environment.GetEnvironmentVariable("HOME");

            //generate home on windows
            if (pathToHome == null)
            {
                pathToHome = Environment.GetEnvironmentVariable("UserProfile");
            }

            //something is wrong
            if(pathToHome == null)
            {
                throw new DesktopNotFoundException();
            }

            //path to the base data folder
            string returnFilepath = Path.Combine(pathToHome, ".CombineFiles", customDirPath);

            //establish path to the typed file in the base folder

            //if its the first time here it needs to be created
            Directory.CreateDirectory(returnFilepath);

            //if the path being generated is to a dir and not a file then dont add an extension
            returnFilepath = Path.Combine(returnFilepath, customFileName + (isDirectory ? "" : FileTypeExtension(type)));

            return returnFilepath;
        }
        private string FileTypeFolder(filetype type)
        {
            switch (type)
            {
                case filetype.audio:
                    return "Audios";

                case filetype.avatar:
                    return "Avatars";

                case filetype.lift:
                    return "lifts";

                case filetype.zip:
                    return "zips";

                default:
                    return "";
            }
        }

        private string FileTypeExtension(filetype type)
        {
            switch (type)
            {
                case filetype.audio:
                    return ".mp3";

                case filetype.avatar:
                    return ".jpg";

                case filetype.lift:
                    return ".lift";

                case filetype.zip:
                    return ".zip";

                default:
                    return ""; ;
            }
        }

        public class DesktopNotFoundException : Exception
        {
            public DesktopNotFoundException() { }
        }
    }
}
