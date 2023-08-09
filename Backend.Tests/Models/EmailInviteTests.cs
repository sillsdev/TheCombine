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
            Assert.That(field, Is.EqualTo(field.Clone()));
        }

        [Test]
        public void TestEqualsNull()
        {
            Assert.That(new EmailInvite(), Is.Not.EqualTo(null));
        }

        [Test]
        public void TestNotEquals()
        {
            var invite = new EmailInvite { Email = Email1, Token = Token1, Role = Role1, ExpireTime = _expireTime1 };
            Assert.That(invite,
                Is.Not.EqualTo(new EmailInvite { Email = Email2, Token = Token1, Role = Role1, ExpireTime = _expireTime1 }));
            Assert.That(invite,
                Is.Not.EqualTo(new EmailInvite { Email = Email1, Token = Token2, Role = Role1, ExpireTime = _expireTime1 }));
            Assert.That(invite,
                Is.Not.EqualTo(new EmailInvite { Email = Email1, Token = Token1, Role = Role2, ExpireTime = _expireTime1 }));
            Assert.That(invite,
                Is.Not.EqualTo(new EmailInvite { Email = Email1, Token = Token1, Role = Role1, ExpireTime = _expireTime2 }));
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
            Assert.That(
                new EmailInvite { Email = Email1 }.GetHashCode(),
                Is.Not.EqualTo(new EmailInvite { Email = Email2 }.GetHashCode())
            );
            Assert.That(
                new EmailInvite { Token = Token1 }.GetHashCode(),
                Is.Not.EqualTo(new EmailInvite { Token = Token2 }.GetHashCode())
            );
            Assert.That(
                new EmailInvite { Role = Role1 }.GetHashCode(),
                Is.Not.EqualTo(new EmailInvite { Role = Role2 }.GetHashCode())
            );
            Assert.That(
                new EmailInvite { ExpireTime = _expireTime1 }.GetHashCode(),
                Is.Not.EqualTo(new EmailInvite { ExpireTime = _expireTime2 }.GetHashCode())
            );
        }
    }
}
