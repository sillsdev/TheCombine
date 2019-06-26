using System;
using System.Text;

namespace Backend.Tests
{
    public class Util
    {
        public static string randString(int length)
        {
            Random rnd = new Random();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < length; i++)
            {
                sb.Append((char)rnd.Next('a', 'z'));
            }
            return sb.ToString();
        }
        public static string randString()
        {
            Random rnd = new Random();
            return randString(rnd.Next(4, 10));
        }

    }
}