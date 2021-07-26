using BackendFramework.Helper;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class PasswordHashTests
    {
        private const string Password = "password123";

        [Test]
        public void HashPasswordValidRoundtrip()
        {
            var hash = PasswordHash.HashPassword(Password);
            Assert.AreNotEqual(Password, hash);
            Assert.That(PasswordHash.ValidatePassword(hash, Password));
        }

        [Test]
        public void HashPasswordInvalidHashByteRoundtrip()
        {
            var hash = PasswordHash.HashPassword(Password);
            // Change a single byte of the hash and validate that the hash fails.
            hash[0] ^= 0xff;
            Assert.IsFalse(PasswordHash.ValidatePassword(hash, Password));
        }

        [Test]
        public void HashPasswordInvalidPasswordCharacterRoundtrip()
        {
            var hash = PasswordHash.HashPassword(Password);
            var mutatedPassword = $"Z{Password}";
            Assert.IsFalse(PasswordHash.ValidatePassword(hash, mutatedPassword));
        }
    }
}
