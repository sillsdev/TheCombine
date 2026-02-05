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

        public static AuthStatus LoggedInUser(User user)
        {
            var displayName = string.IsNullOrWhiteSpace(user.Name) ? user.Username : user.Name;
            return new AuthStatus
            {
                LoggedIn = true,
                LoggedInAs = displayName,
                UserId = user.Id,
            };
        }
    }
}
