using System;
using BackendFramework.Models;
using Microsoft.AspNetCore.WebUtilities;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class EmailInviteTests
    {
        private const string Email = "user@combine.org";
        private const string Token = "Token";
        private readonly DateTime _expireTime = new(2020, 1, 1);

        [Test]
        public void TestEquals()
        {
            var field = new EmailInvite { Email = Email, Token = Token, ExpireTime = _expireTime };
            Assert.That(field.Equals(new EmailInvite { Email = Email, Token = Token, ExpireTime = _expireTime }));
        }

        [Test]
        public void TestEqualsNull()
        {
            var invite = new EmailInvite();
            Assert.IsFalse(invite.Equals(null));
        }

        [Test]
        public void TestNotEquals()
        {
            var invite = new EmailInvite { Email = Email, Token = Token };
            Assert.IsFalse(invite.Equals(new EmailInvite { Email = Email, Token = "Other Token" }));
            Assert.IsFalse(invite.Equals(new EmailInvite { Email = "Other Email", Token = Token }));
        }

        [Test]
        public void TestClone()
        {
            const int daysUntilExpire = 1;
            const string email = "a@a.com";
            var orig = new EmailInvite(daysUntilExpire, email);
            var clone = orig.Clone();

            var invites = new[] { orig, clone };
            foreach (var invite in invites)
            {
                Assert.That(invite.Email, Is.EqualTo(email));
                Assert.That(invite.ExpireTime, Is.EqualTo(DateTime.Now).Within(TimeSpan.FromDays(daysUntilExpire)));
                Assert.That(WebEncoders.Base64UrlDecode(invite.Token).Length, Is.EqualTo(8));
            }
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new EmailInvite { Email = Email }.GetHashCode(),
                new EmailInvite { Email = "Different Name" }.GetHashCode()
            );
        }
    }
}
