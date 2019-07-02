using System;
using System.IO;

namespace BackendFramework.Helper
{
    public class Utilities
    {
        enum filetype
        {
            audio,
            avatar,
            lift
        }

        public string GenerateFilePath(filetype type, string Id = "")
        {
            string wanted_path = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);

            if (wanted_path == null || wanted_path == "") /*I don't know what to expect*/
            {
                throw (new DesktopNotFoundExceoption());
            }

            wanted_path = Path.Combine(wanted_path, ".CombineFiles");
            //establish path to audio file dir
            string returnFilepath = Path.Combine(wanted_path, );
            System.IO.Directory.CreateDirectory(returnFilepath);

            returnFilepath = Path.Combine(wanted_path, Id + FileTypeExtension(type));

            return returnFilepath;
        }
        private string FileTypeFolder(filetype type)
        {
            switch (type)
            {
                case audio:
                    return "Audio";
                    break;
                case avatar:
                    return ".jpg";
                    break;
                case avatar:
                    return "lift";
                    break;
                default:
                    throw new InvalidDataException();
            }
        }

        private string FileTypeExtension(filetype type)
        {
            switch (type)
            {
                case audio:
                    return ".mp3";
                    break;
                case avatar:
                    return ".jpg";
                    break;
                case avatar:
                    return "lift";
                    break;
                default:
                    throw new InvalidDataException();
            }
        }

        public class DesktopNotFoundExceoption : Exception
        {
            public DesktopNotFoundExceoption() { }
        }
    }
}
