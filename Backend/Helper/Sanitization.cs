using System.Linq;

namespace BackendFramework.Helper
{
    public static class Sanitization
    {
        /// <summary>
        /// Validate that an ID field sent from a user does not contain any illegal characters.
        /// </summary>
        public static bool SanitizeId(string id)
        {
            return id.All(x => char.IsLetterOrDigit(x) | x == '-');
        }
    }
}
