using System;
using BackendFramework.Models;
using Microsoft.AspNetCore.WebUtilities;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class EmailInviteTests
    {
        private const string Email = "user1@thecombine.app";
        private const string Token = "first";
        private readonly DateTime _expireTime = new(2020, 1, 1);

        [Test]
        public void TestClone()
        {
            var invite = new EmailInvite { Email = Email, Token = Token, Role = Role.Owner, ExpireTime = _expireTime };
            Assert.That(invite.Clone(), Is.EqualTo(invite).UsingPropertiesComparer());
        }

        [Test]
        public void TestToken()
        {
            const int daysUntilExpire = 1;
            const string email = "a@a.com";
            var invite = new EmailInvite(daysUntilExpire, email, Role.Harvester);
            Assert.That(invite.ExpireTime, Is.EqualTo(DateTime.Now).Within(TimeSpan.FromDays(daysUntilExpire)));
            Assert.That(WebEncoders.Base64UrlDecode(invite.Token), Has.Length.EqualTo(8));
        }
    }
}
