namespace BackendFramework.Models
{
    public class LexboxAuthStatus
    {
        public bool IsLoggedIn { get; set; }
        public string? LoggedInAs { get; set; }
        public string? UserId { get; set; }

        public static LexboxAuthStatus LoggedOut() => new()
        {
            IsLoggedIn = false
        };

        public static LexboxAuthStatus LoggedIn(LexboxAuthUser user) => new()
        {
            IsLoggedIn = true,
            LoggedInAs = user.DisplayName,
            UserId = user.UserId
        };
    }

    public class LexboxAuthUser
    {
        public required string UserId { get; init; }
        public required string DisplayName { get; init; }
    }
}
