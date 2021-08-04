using System;
using BackendFramework.Models;
using Microsoft.AspNetCore.WebUtilities;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class EmailInviteTests
    {
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
    }
}
