using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Backend.Tests.Repositories
{
    /// <summary>
    /// Starts and manages an ephemeral MongoDB process for integration testing.
    /// Uses the mongod binary from the EphemeralMongo7 NuGet package.
    /// Supports single-node replica sets to enable multi-document transactions.
    /// </summary>
    internal sealed class MongoDbTestRunner : IDisposable
    {
        private const string Host = "127.0.0.1";
        private const string ReplicaSetName = "rs0";

        private readonly Process _process;
        private readonly string _dataDirectory;

        public string ConnectionString { get; }

        private MongoDbTestRunner(Process process, string dataDirectory, string connectionString)
        {
            _process = process;
            _dataDirectory = dataDirectory;
            ConnectionString = connectionString;
        }

        /// <summary>
        /// Starts a MongoDB instance as a single-node replica set.
        /// </summary>
        public static MongoDbTestRunner Start()
        {
            var binaryPath = FindMongodBinary();
            var port = FindFreePort();
            var dataDirectory = Path.Combine(Path.GetTempPath(), $"mongo-test-{Guid.NewGuid():N}");
            Directory.CreateDirectory(dataDirectory);

            var process = StartMongodProcess(binaryPath, port, dataDirectory);
            try
            {
                WaitForMongoReady(port);
                InitializeReplicaSet(port);
                WaitForReplicaSetReady(port);
            }
            catch
            {
                process.Kill(entireProcessTree: true);
                process.Dispose();
                Directory.Delete(dataDirectory, recursive: true);
                throw;
            }

            var connectionString = $"mongodb://{Host}:{port}/?directConnection=true&replicaSet={ReplicaSetName}";
            return new MongoDbTestRunner(process, dataDirectory, connectionString);
        }

        private static string FindMongodBinary()
        {
            var rid = GetRuntimeId();
            var baseDir = AppContext.BaseDirectory;
            var binaryName = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "mongod.exe" : "mongod";
            var binaryPath = Path.Combine(baseDir, "runtimes", rid, "native", "mongodb", "bin", binaryName);

            if (!File.Exists(binaryPath))
            {
                throw new FileNotFoundException(
                    $"mongod binary not found at '{binaryPath}'. Ensure one of the EphemeralMongo7.runtime.* packages is installed.",
                    binaryPath);
            }

            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                // Ensure the binary is executable on Unix
                var chmod = Process.Start(new ProcessStartInfo("chmod")
                {
                    ArgumentList = { "+x", binaryPath },
                    UseShellExecute = false,
                });
                chmod?.WaitForExit();
            }

            return binaryPath;
        }

        private static string GetRuntimeId()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) return "win-x64";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux)) return "linux-x64";
            // EphemeralMongo7 only provides an arm64 binary for macOS
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) return "osx-arm64";
            throw new PlatformNotSupportedException("Unsupported operating system.");
        }

        private static int FindFreePort()
        {
            using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            socket.Bind(new System.Net.IPEndPoint(System.Net.IPAddress.Loopback, 0));
            return ((System.Net.IPEndPoint)socket.LocalEndPoint!).Port;
        }

        private static Process StartMongodProcess(string binaryPath, int port, string dataDirectory)
        {
            var args = string.Join(" ",
                $"--replSet {ReplicaSetName}",
                $"--bind_ip {Host}",
                $"--port {port}",
                $"--dbpath \"{dataDirectory}\"",
                "--noauth",
                "--quiet");

            var process = new Process
            {
                StartInfo = new ProcessStartInfo(binaryPath, args)
                {
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                }
            };
            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            return process;
        }

        private static void WaitForMongoReady(int port, int timeoutSeconds = 30)
        {
            var deadline = DateTime.UtcNow.AddSeconds(timeoutSeconds);
            while (DateTime.UtcNow < deadline)
            {
                try
                {
                    using var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                    socket.Connect(Host, port);
                    return;
                }
                catch (SocketException)
                {
                    Thread.Sleep(200);
                }
            }

            throw new TimeoutException($"MongoDB did not start within {timeoutSeconds} seconds on port {port}.");
        }

        private static void InitializeReplicaSet(int port)
        {
            var client = new MongoClient($"mongodb://{Host}:{port}/?directConnection=true");
            var admin = client.GetDatabase("admin");
            var config = new BsonDocument
            {
                { "_id", ReplicaSetName },
                { "members", new BsonArray { new BsonDocument { { "_id", 0 }, { "host", $"{Host}:{port}" } } } }
            };
            admin.RunCommand<BsonDocument>(new BsonDocument("replSetInitiate", config));
        }

        private static void WaitForReplicaSetReady(int port, int timeoutSeconds = 30)
        {
            var client = new MongoClient(
                $"mongodb://{Host}:{port}/?directConnection=true&replicaSet={ReplicaSetName}");
            var deadline = DateTime.UtcNow.AddSeconds(timeoutSeconds);
            Exception? lastException = null;
            while (DateTime.UtcNow < deadline)
            {
                try
                {
                    var admin = client.GetDatabase("admin");
                    var status = admin.RunCommand<BsonDocument>(new BsonDocument("replSetGetStatus", 1));
                    if (status["ok"].ToInt32() == 1 && status["myState"].ToInt32() == 1)
                    {
                        return;
                    }
                }
                catch (Exception ex)
                {
                    lastException = ex;
                }

                Thread.Sleep(500);
            }

            throw new TimeoutException(
                $"Replica set did not become ready within {timeoutSeconds} seconds.", lastException);
        }

        public void Dispose()
        {
            try
            {
                if (!_process.HasExited)
                {
                    _process.Kill(entireProcessTree: true);
                }
            }
            catch (InvalidOperationException) { }

            _process.Dispose();

            try
            {
                Directory.Delete(_dataDirectory, recursive: true);
            }
            catch (IOException) { }
        }
    }
}
