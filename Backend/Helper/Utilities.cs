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
            dir
        }

        public string GenerateFilePath(filetype type, bool directory, string fileExtension = "")
        {
            //generate path to desktop
            string wanted_path = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
            Directory.CreateDirectory(wanted_path);

            /*I don't know what to expect or if this will work so a very specific exception will help debugging*/
            if (wanted_path == null || wanted_path == "") 
            {
                throw (new DesktopNotFoundExceoption());
            }

            //path to the base data folder
            wanted_path = Path.Combine(wanted_path, ".CombineFiles");

            //establish path to the typed file in the base folder
            string returnFilepath = Path.Combine(wanted_path, FileTypeFolder(type));

            //if its the first time here it needs to be created
            Directory.CreateDirectory(returnFilepath);
            
            returnFilepath = Path.Combine(returnFilepath, fileExtension + (directory ? "" : FileTypeExtension(type)));
            

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

                default:
                    return ""; ;
            }
        }

        public class DesktopNotFoundExceoption : Exception
        {
            public DesktopNotFoundExceoption() { }
        }
    }
}
