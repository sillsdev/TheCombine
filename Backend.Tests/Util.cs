using System;
using System.IO;
using System.Text;

namespace Backend.Tests
{
    public static class Util
    {
        /// <summary> Path to Assets directory from debugging folder </summary>
        public static readonly string AssetsDir = Path.Combine(Directory.GetParent(Directory.GetParent(
            Directory.GetParent(Environment.CurrentDirectory).ToString()).ToString()).ToString(), "Assets");

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
