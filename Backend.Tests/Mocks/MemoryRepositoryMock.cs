using Microsoft.Extensions.Caching.Memory;

namespace Backend.Tests.Mocks
{
    internal class MemoryRepositoryMock
    {
        private readonly IMemoryCache _cache;

        public MemoryRepositoryMock(IMemoryCache cache)
        {
            _cache = cache;
        }

        public string? Store(string key, string value)
        {
            using (var entry = _cache.CreateEntry(key))
            {
                entry.Value = value;
            }
            return _cache.Get<string>(key);
        }
    }
}
