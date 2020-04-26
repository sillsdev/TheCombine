﻿using Microsoft.AspNetCore.Http;

namespace BackendFramework.Interfaces
{
    public interface IPermissionService
    {
        bool IsProjectAuthorized(string value, HttpContext request);
        bool IsUserIdAuthorized(HttpContext request, string userId);
        bool IsViolationEdit(HttpContext request, string userEditId, string projectId);
        string GetUserId(HttpContext request);
    }
}