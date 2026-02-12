namespace BackendFramework.Models
{
    public class AuthStatus
    {
        public bool LoggedIn { get; set; }
        public string? LoggedInAs { get; set; }
        public string? UserId { get; set; }

        public static AuthStatus LoggedOut() => new()
        {
            LoggedIn = false,
            LoggedInAs = null,
            UserId = null,
        };

        public static AuthStatus LoggedInLexboxUser(LexboxAuthUser user)
        {
            return new AuthStatus
            {
                LoggedIn = true,
                LoggedInAs = user.DisplayName,
                UserId = user.UserId,
            };
        }
    }
}
