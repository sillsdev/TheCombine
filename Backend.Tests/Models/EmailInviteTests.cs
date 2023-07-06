using System;
using BackendFramework.Models;
using Microsoft.AspNetCore.WebUtilities;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class EmailInviteTests
    {
        private const string Email1 = "user1@thecombine.app";
        private const string Email2 = "user2@thecombine.app";
        private const string Token1 = "first";
        private const string Token2 = "second";
        private const Role Role1 = Role.Harvester;
        private const Role Role2 = Role.Editor;
        private readonly DateTime _expireTime1 = new(2020, 1, 1);
        private readonly DateTime _expireTime2 = new(2020, 2, 2);

        [Test]
        public void TestCloneEquals()
        {
            var field = new EmailInvite { Email = Email1, Token = Token1, Role = Role1, ExpireTime = _expireTime1 };
            Assert.AreEqual(field, field.Clone());
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.AreNotEqual(new EmailInvite(), null);
        }

        [Test]
        public void TestNotEquals()
        {
            var invite = new EmailInvite { Email = Email1, Token = Token1, Role = Role1, ExpireTime = _expireTime1 };
            Assert.AreNotEqual(invite,
                new EmailInvite { Email = Email2, Token = Token1, Role = Role1, ExpireTime = _expireTime1 });
            Assert.AreNotEqual(invite,
                new EmailInvite { Email = Email1, Token = Token2, Role = Role1, ExpireTime = _expireTime1 });
            Assert.AreNotEqual(invite,
                new EmailInvite { Email = Email1, Token = Token1, Role = Role2, ExpireTime = _expireTime1 });
            Assert.AreNotEqual(invite,
                new EmailInvite { Email = Email1, Token = Token1, Role = Role1, ExpireTime = _expireTime2 });
        }

        [Test]
        public void TestToken()
        {
            const int daysUntilExpire = 1;
            const string email = "a@a.com";
            var invite = new EmailInvite(daysUntilExpire, email, Role1);
            Assert.That(invite.ExpireTime, Is.EqualTo(DateTime.Now).Within(TimeSpan.FromDays(daysUntilExpire)));
            Assert.That(WebEncoders.Base64UrlDecode(invite.Token), Has.Length.EqualTo(8));
        }

        [Test]
        public void TestHashCode()
        {
            Assert.AreNotEqual(
                new EmailInvite { Email = Email1 }.GetHashCode(),
                new EmailInvite { Email = Email2 }.GetHashCode()
            );
            Assert.AreNotEqual(
                new EmailInvite { Token = Token1 }.GetHashCode(),
                new EmailInvite { Token = Token2 }.GetHashCode()
            );
            Assert.AreNotEqual(
                new EmailInvite { Role = Role1 }.GetHashCode(),
                new EmailInvite { Role = Role2 }.GetHashCode()
            );
            Assert.AreNotEqual(
                new EmailInvite { ExpireTime = _expireTime1 }.GetHashCode(),
                new EmailInvite { ExpireTime = _expireTime2 }.GetHashCode()
            );
        }
    }
}
