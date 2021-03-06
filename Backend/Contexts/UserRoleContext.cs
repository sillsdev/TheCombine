﻿using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;

namespace BackendFramework.Contexts
{
    public class UserRoleContext : IUserRoleContext
    {
        private readonly IMongoDatabase _db;

        public UserRoleContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<UserRole> UserRoles => _db.GetCollection<UserRole>("UserRolesCollection");
    }
}