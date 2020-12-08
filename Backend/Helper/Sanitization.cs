using System.Linq;

namespace BackendFramework.Helper
{
    public static class Sanitization
    {
        /// <summary>
        /// Validate that an ID field sent from a user does not contain any illegal characters.
        ///
        /// This is especially important if, for example, user input ultimately is used in the creation of a path to
        /// disk.
        /// </summary>
        public static bool SanitizeId(string id)
        {
            return id.All(x => char.IsLetterOrDigit(x) | x == '-');
        }
    }
}
