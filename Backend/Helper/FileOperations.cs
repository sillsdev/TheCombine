using System.IO;
using System.IO.Compression;

namespace BackendFramework.Helper
{
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
    }
}
