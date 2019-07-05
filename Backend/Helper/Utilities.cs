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

        public string GenerateFilePath(filetype type, bool directory, string customFileName = "")
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

            //string wanted_path = Path.Combine(pathToHome, "Desktop") ;
            
            //path to the base data folder
            string wanted_path = Path.Combine(pathToHome, ".CombineFiles", "ProjectName");

            //establish path to the typed file in the base folder
            string returnFilepath = Path.Combine(wanted_path, FileTypeFolder(type));

            //if its the first time here it needs to be created
            Directory.CreateDirectory(returnFilepath);
            
            //if the path being generated is to a dir not a file then dont add an extension
            returnFilepath = Path.Combine(returnFilepath, customFileName + (directory ? "" : FileTypeExtension(type)));
            

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
