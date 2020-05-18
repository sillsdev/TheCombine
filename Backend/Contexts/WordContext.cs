﻿using BackendFramework.Interfaces;
using BackendFramework.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using static BackendFramework.Startup;

namespace BackendFramework.Contexts
{
    public class WordContext : IWordContext
    {
        private readonly IMongoDatabase _db;

        public WordContext(IOptions<Settings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            _db = client.GetDatabase(options.Value.CombineDatabase);
        }

        public IMongoCollection<Word> Words => _db.GetCollection<Word>("WordsCollection");
        public IMongoCollection<Word> Frontier => _db.GetCollection<Word>("FrontierCollection");
    }
}