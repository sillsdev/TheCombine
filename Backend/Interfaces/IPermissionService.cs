using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace BackendFramework.Interfaces
{
    public interface IPermissionService
    {
        bool IsAuthenticated(string value, HttpContext request);
        string GetUserId(HttpContext request);
        bool IsViolationEditAsync(HttpContext request, string userEditId, string ProjectId);
    }
}