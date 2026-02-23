namespace BackendFramework.Models
{
    public class AuthStatus
    {
        public bool IsLoggedIn { get; set; }
        public string? LoggedInAs { get; set; }
        public string? UserId { get; set; }

        public static AuthStatus LoggedOut() => new()
        {
            IsLoggedIn = false
        };

        public static AuthStatus LoggedIn(LexboxAuthUser user) => new()
        {
            IsLoggedIn = true,
            LoggedInAs = user.DisplayName,
            UserId = user.UserId
        };
    }
}
