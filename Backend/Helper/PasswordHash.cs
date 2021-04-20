using System;
using System.Security.Cryptography;

namespace BackendFramework.Helper
{
    /// <summary> Password hashing and validation. </summary>
    public static class PasswordHash
    {
        private const int SaltLength = 16;

        /// <summary> Use SHA256 length. </summary>
        private const int HashLength = 256 / 8;

        /// <summary> Hash iterations to slow down brute force password cracking. </summary>
        /// It's important that this value is not too low, or password cracking is made easier.
        /// Value selected from default Django 3.1 iteration count (appropriate as of August 2020).
        /// https://docs.djangoproject.com/en/dev/releases/3.1/#django-contrib-auth
        private const int HashIterations = 216000;

        /// <summary>
        /// Hash a password with a generated salt and return the combined bytes suitable for storage.
        /// </summary>
        public static byte[] HashPassword(string password)
        {
            var salt = CreateSalt();

            // Hash the password along with the salt
            var hash = HashPassword(password, salt);

            // Combine salt and hashed password for storage
            var hashBytes = new byte[SaltLength + HashLength];
            Array.Copy(salt, 0, hashBytes, 0, SaltLength);
            Array.Copy(hash, 0, hashBytes, SaltLength, HashLength);

            return hashBytes;
        }

        /// <summary>
        /// Validate that a user-supplied password matches a previously hashed password.
        /// </summary>
        /// <param name="storedHash"> Stored password hash for a user. </param>
        /// <param name="password"> The password that a user supplied to be validated. </param>
        public static bool ValidatePassword(byte[] storedHash, string password)
        {
            // Get the salt from the first part of stored value.
            var salt = new byte[SaltLength];
            Array.Copy(storedHash, 0, salt, 0, SaltLength);

            // Compute the hash on the password the user entered.
            var computedHash = HashPassword(password, salt);

            // Check if the password given to us matches the hash we have stored (after the salt).
            for (var i = 0; i < computedHash.Length; i++)
            {
                if (computedHash[i] != storedHash[i + SaltLength])
                {
                    return false;
                }
            }
            return true;
        }

        /// <summary> Hash a password and salt using PBKDF2. </summary>
        private static byte[] HashPassword(string password, byte[] salt)
        {
            // SHA256 is the recommended PBKDF2 hash algorithm.
            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, HashIterations, HashAlgorithmName.SHA256);
            return pbkdf2.GetBytes(HashLength);
        }

        /// <summary> Create cryptographically-secure randomized salt. </summary>
        private static byte[] CreateSalt()
        {
            byte[] salt;
            using var crypto = new RNGCryptoServiceProvider();
            crypto.GetBytes(salt = new byte[SaltLength]);
            return salt;
        }
    }
}
