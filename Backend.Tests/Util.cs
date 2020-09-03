using System;
using System.Text;

namespace Backend.Tests
{
    public static class Util
    {
        public static string RandString(int length)
        {
            var rnd = new Random();
            var sb = new StringBuilder();
            for (var i = 0; i < length; i++)
            {
                if (i % 4 == 0)
                    sb.Append((char)rnd.Next('A', 'Z'));
                else
                    sb.Append((char)rnd.Next('a', 'z'));
            }
            return sb.ToString();
        }
        public static string RandString()
        {
            var rnd = new Random();
            return RandString(rnd.Next(4, 10));
        }
    }
}