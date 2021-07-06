using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using BackendFramework.Helper;
using Microsoft.AspNetCore.SignalR;

namespace Backend.Tests.Mocks
{
    /// <summary>
    /// A *very* sparse, mostly unimplemented Mock of SignalR HubContext.
    /// </summary>
    public class HubContextMock : IHubContext<CombineHub>
    {
        public IHubClients Clients => new HubClientsMock();

        public IGroupManager Groups => throw new System.NotImplementedException();
    }

    public class HubClientsMock : IHubClients
    {
        public IClientProxy AllExcept(IReadOnlyList<string> excludedConnectionIds)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy Client(string connectionId)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy Clients(IReadOnlyList<string> connectionIds)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy Group(string groupName)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy GroupExcept(string groupName, IReadOnlyList<string> excludedConnectionIds)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy Groups(IReadOnlyList<string> groupNames)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy User(string userId)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy Users(IReadOnlyList<string> userIds)
        {
            throw new System.NotImplementedException();
        }

        public IClientProxy All => new ClientProxyMock();
    }

    public class ClientProxyMock : IClientProxy
    {
        // Disable this warning as this mock simply needs to return an empty Task, not await anything.
#pragma warning disable 1998
        public async Task SendCoreAsync(
#pragma warning restore 1998
            string method, object?[]? args, CancellationToken cancellationToken = new())
        {
        }
    }
}
