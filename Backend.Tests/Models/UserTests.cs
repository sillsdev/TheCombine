using BackendFramework.Models;
using NUnit.Framework;

namespace Backend.Tests.Models
{
    public class UserTests
    {
        [Test]
        public void TestClone()
        {
            var user = new User
            {
                Id = "user-id",
                Avatar = "avatar-path",
                HasAvatar = true,
                Name = "Mr. Surname",
                Email = "a@b.c",
                Phone = "123-4556-7890",
                OtherConnectionField = "huh?",
                Agreement = true,
                Password = "encrypted-string",
                Username = "surname2000",
                AnalyticsOn = false,
                AnsweredConsent = true,
                UILang = "fr",
                GlossSuggestion = OffOnSetting.Off,
                Token = "auth-token",
                IsAdmin = true,
                WorkedProjects = new() { { "proj-id", "ue-id" } },
                ProjectRoles = new() { { "proj-id", "ur-id" } },
            };
            Util.AssertDeepClone(user, user.Clone(), true);
        }

        [Test]
        public void TestSanitize()
        {
            var user = new User { Avatar = "ava", Password = "pas", Token = "tok" };
            Util.AssertDeepClone(user, new(), false);
            user.Sanitize();
            Util.AssertDeepClone(user, new(), true);
        }
    }

    public class CredentialsTests
    {
        [Test]
        public void TestConstructor()
        {
            var credentials = new Credentials();
            Assert.That(credentials.Username, Is.EqualTo(""));
            Assert.That(credentials.Password, Is.EqualTo(""));
        }
    }
}
