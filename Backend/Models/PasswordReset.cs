using System.ComponentModel.DataAnnotations;

namespace BackendFramework.Models
{
    /// <remarks>
    /// This is used in a [FromBody] serializer, so its attributes cannot be set to readonly.
    /// </remarks>
    public class PasswordResetData
    {
        [Required]
        public string NewPassword { get; set; } = "";

        [Required]
        public string Token { get; set; } = "";
    }
}
