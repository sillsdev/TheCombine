using BackendFramework.Interfaces;
using Microsoft.AspNetCore.Http;

using System.Threading.Tasks;



namespace Backend.Tests
{
    class PermissionServiceMock : IPermissionService
    {
        public string GetUserId(HttpContext request)
        {
            var userId = request.Request.Headers["UserId"].ToString();
            return userId;
        }

        public bool IsAuthenticated(string value, HttpContext request)
        {
            return true;
        }

        public bool IsViolationEditAsync(HttpContext request, string userEditId, string ProjectId)
        {
            return false;
        }
    }
}
