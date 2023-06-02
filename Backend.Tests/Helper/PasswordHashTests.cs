using static BackendFramework.Helper.PasswordHash;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class PasswordHashTests
    {
        private const string Password = "password123";

        [Test]
        public void HashPasswordValidRoundtrip()
        {
            var hash = HashPassword(Password);
            Assert.AreNotEqual(Password, hash);
            Assert.That(ValidatePassword(hash, Password));
        }

        [Test]
        public void HashPasswordInvalidHashByteRoundtrip()
        {
            var hash = HashPassword(Password);
            // Change a single byte of the hash and validate that the hash fails.
            hash[0] ^= 0xff;
            Assert.IsFalse(ValidatePassword(hash, Password));
        }

        [Test]
        public void HashPasswordInvalidPasswordCharacterRoundtrip()
        {
            var hash = HashPassword(Password);
            var mutatedPassword = $"Z{Password}";
            Assert.IsFalse(ValidatePassword(hash, mutatedPassword));
        }
    }
}
