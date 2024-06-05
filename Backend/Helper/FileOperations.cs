using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace BackendFramework.Helper
{
    [Serializable]
    public class InvalidFileException : Exception
    {
        public InvalidFileException(string message) : base(message) { }

        protected InvalidFileException(SerializationInfo info, StreamingContext context)
            : base(info, context) { }

    }

    /// <summary>
    /// A collection of general purpose file system operations.
    /// </summary>
    public static class FileOperations
    {
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
            extractionDir ??= GetRandomTempDir(false);

            Directory.CreateDirectory(extractionDir);
            ZipFile.ExtractToDirectory(zipFilePath, extractionDir);
            if (deleteZipFile)
            {
                File.Delete(zipFilePath);
            }
            return extractionDir;
        }

        /// <summary> Extract a zip file to a unique temporary directory. </summary>
        /// <param name="file"> An IFormFile zip file. </param>
        /// <returns> The path to the extracted contents. </returns>
        public static async Task<string> ExtractZipFile(IFormFile? file)
        {
            if (file is null)
            {
                throw new InvalidFileException("Null file");
            }
            if (file.Length == 0)
            {
                throw new InvalidFileException("Empty file");
            }

            // Copy zip file data to a new temporary file
            var filePath = Path.GetTempFileName();
            await using (var fs = new FileStream(filePath, FileMode.OpenOrCreate))
            {
                await file.CopyToAsync(fs);
            }

            // Extract the zip to new created directory.
            return ExtractZipFile(filePath, null, true);
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

        /// <summary> Find any files of specified extension within a directory. </summary>
        public static List<string> FindFilesWithExtension(string dir, string ext, bool recursive = false)
        {
            if (dir.Length == 0 || ext.Length == 0)
            {
                return new List<string>();
            }
            if (ext[0] != '.')
            {
                ext = $".{ext}";
            }

            var files = Directory.GetFiles(dir, $"*{ext}").ToList();
            if (recursive)
            {
                Directory.GetDirectories(dir).ToList()
                    .ForEach(subDir => files.AddRange(FindFilesWithExtension(subDir, ext, true)));
            }
            return files;
        }

        /// <summary> Like Path.ChangeExtension, but doesn't add a . for empty-string extension. </summary>
        public static string ChangeExtension(string path, string? extension)
        {
            if (extension == "")
            {
                extension = null;
            }
            return Path.ChangeExtension(path, extension);
        }
    }
}
