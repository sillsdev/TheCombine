using Microsoft.AspNetCore.SignalR;
//using System.Threading.Tasks;

namespace BackendFramework.Helper
{
    public class CombineHub : Hub
    {
        /*public async Task SendMessage(string user, string message)
        {
            //await Clients.User(user).SendAsync("ReceiveMessage", message);
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }*/
    }
}
