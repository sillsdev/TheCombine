using System.Linq;

namespace BackendFramework.Helper
{
    public static class Sanitization
    {
        public static bool SanitizeId(string id)
        {
            return id.All(x => char.IsLetterOrDigit(x) | x == '-');
        }
    }
}
