using static BackendFramework.Helper.PasswordHash;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    internal sealed class PasswordHashTests
    {
        private const string Password = "password123";

        [Test]
        public void HashPasswordValidRoundtrip()
        {
            var hash = HashPassword(Password);
            Assert.That(hash, Is.Not.EqualTo(Password));
            Assert.That(ValidatePassword(hash, Password), Is.True);
        }

        [Test]
        public void HashPasswordInvalidHashByteRoundtrip()
        {
            var hash = HashPassword(Password);
            // Change a single byte of the hash and validate that the hash fails.
            hash[0] ^= 0xff;
            Assert.That(ValidatePassword(hash, Password), Is.False);
        }

        [Test]
        public void HashPasswordInvalidPasswordCharacterRoundtrip()
        {
            var hash = HashPassword(Password);
            var mutatedPassword = $"Z{Password}";
            Assert.That(ValidatePassword(hash, mutatedPassword), Is.False);
        }
    }
}
