using System;
using System.IO;

namespace BackendFramework.Helper
{
    public class Utilities
    {
        public enum Filetype
        {
            audio,
            avatar,
            lift,
            zip,
            dir
        }


        //TODO: split this function in two that generate directories or files
        public string GenerateFilePath(Filetype type, bool isDirectory, string customFileName = "", string customDirPath = "")
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

            //creates the dierectory if it doesn't exist
            Directory.CreateDirectory(returnFilepath);

            //if the path being generated is to a dir and not a file then don't add an extension
            returnFilepath = Path.Combine(returnFilepath, customFileName + (isDirectory ? "" : FileTypeExtension(type)));

            return returnFilepath;
        }

        private string FileTypeFolder(Filetype type)
        {
            switch (type)
            {
                case Filetype.audio:
                    return "Audios";

                case Filetype.avatar:
                    return "Avatars";

                case Filetype.lift:
                    return "lifts";

                case Filetype.zip:
                    return "zips";

                default:
                    return "";
            }
        }

        private string FileTypeExtension(Filetype type)
        {
            switch (type)
            {
                case Filetype.audio:
                    return ".mp3";

                case Filetype.avatar:
                    return ".jpg";

                case Filetype.lift:
                    return ".lift";

                case Filetype.zip:
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
