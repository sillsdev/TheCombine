using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BackendFramework.Helper
{
    [AttributeUsage(AttributeTargets.All, Inherited = false, AllowMultiple = true)]
    public class PermissionsAttribute: Attribute
    {

        public PermissionsAttribute(int permissionEnum)
        {
            if()
        }
    }
}
