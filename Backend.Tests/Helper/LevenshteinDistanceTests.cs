using System;
using System.Collections.Generic;
using BackendFramework.Helper;
using BackendFramework.Interfaces;
using NUnit.Framework;

namespace Backend.Tests.Helper
{
    public class LevenshteinDistanceTests
    {
        private IEditDistance _levDist = null!;

        private const int DelCost = 3;
        private const int InsCost = 4;
        private const int SubCost = 5;
        private const string BaseWord = "EditDistanceTest";

        [OneTimeSetUp]
        public void OneTimeSetup()
        {
            _levDist = new LevenshteinDistance(DelCost, InsCost, SubCost);
        }

        [Test]
        public void GetDistanceEmptyWordTest()
        {
            Assert.That(_levDist.GetDistance("", ""), Is.EqualTo(0));
            Assert.That(_levDist.GetDistance(BaseWord, ""), Is.EqualTo(DelCost * BaseWord.Length));
            Assert.That(_levDist.GetDistance("", BaseWord), Is.EqualTo(InsCost * BaseWord.Length));
        }

        private static readonly List<Tuple<string, int>> WordScorePairs = new()
        {
            Tuple.Create(BaseWord, 0),
            Tuple.Create("EdiDistanceTest", DelCost),
            Tuple.Create("EditDistancQeTest", InsCost),
            Tuple.Create("EditDist@nceTest", SubCost),
            Tuple.Create("itDistanceTest", 2 * DelCost),
            Tuple.Create("$EditDistanceTTest", 2 * InsCost),
            Tuple.Create("EditDistanceTe&&", 2 * SubCost),
            Tuple.Create("EditistanceTest4", DelCost + InsCost),
            Tuple.Create("EditDi6stanceT3st", InsCost + SubCost),
            Tuple.Create("7ditDistanceTes", SubCost + DelCost)
        };
        [TestCaseSource(nameof(WordScorePairs))]
        public void GetDistanceSimilarWordTest(Tuple<string, int> pair)
        {
            var (simWord, score) = pair;
            Assert.That(_levDist.GetDistance(BaseWord, simWord), Is.EqualTo(score));
        }

        [Test]
        public void GetDistanceDifferentWordTest()
        {
            const string diffWord = "ZZZZ";
            Assert.That(_levDist.GetDistance(BaseWord, diffWord),
                Is.EqualTo(SubCost * diffWord.Length + DelCost * (BaseWord.Length - diffWord.Length)));
            Assert.That(_levDist.GetDistance(diffWord, BaseWord),
                Is.EqualTo(SubCost * diffWord.Length + InsCost * (BaseWord.Length - diffWord.Length)));
        }
    }
}
