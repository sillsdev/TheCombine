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

        private const int _DelCost = 3;
        private const int _InsCost = 4;
        private const int _SubCost = 5;
        private const string _BaseWord = "EditDistanceTest";

        [OneTimeSetUp]
        public void Setup()
        {
            _levDist = new LevenshteinDistance(_DelCost, _InsCost, _SubCost);
        }

        [Test]
        public void GetDistanceEmptyWordTest()
        {
            Assert.That(_levDist.GetDistance("", ""), Is.EqualTo(0));
            Assert.That(_levDist.GetDistance(_BaseWord, ""), Is.EqualTo(_DelCost * _BaseWord.Length));
            Assert.That(_levDist.GetDistance("", _BaseWord), Is.EqualTo(_InsCost * _BaseWord.Length));
        }

        private static readonly List<Tuple<string, int>> _wordScorePairs = new List<Tuple<string, int>> {
            Tuple.Create(_BaseWord, 0),
            Tuple.Create("EdiDistanceTest", _DelCost),
            Tuple.Create("EditDistancQeTest", _InsCost),
            Tuple.Create("EditDist@nceTest", _SubCost),
            Tuple.Create("itDistanceTest", 2*_DelCost),
            Tuple.Create("$EditDistanceTTest", 2*_InsCost),
            Tuple.Create("EditDistanceTe&&", 2*_SubCost),
            Tuple.Create("EditistanceTest4", _DelCost + _InsCost),
            Tuple.Create("EditDi6stanceT3st", _InsCost + _SubCost),
            Tuple.Create("7ditDistanceTes", _SubCost + _DelCost)
        };
        [TestCaseSource(nameof(_wordScorePairs))]
        public void GetDistanceSimilarWordTest(Tuple<string, int> pair)
        {
            var (simWord, score) = pair;
            Assert.That(_levDist.GetDistance(_BaseWord, simWord), Is.EqualTo(score));
        }

        [Test]
        public void GetDistanceDifferentWordTest()
        {
            const string diffWord = "ZZZZ";
            Assert.That(_levDist.GetDistance(_BaseWord, diffWord),
                Is.EqualTo(_SubCost * diffWord.Length + _DelCost * (_BaseWord.Length - diffWord.Length)));
            Assert.That(_levDist.GetDistance(diffWord, _BaseWord),
                Is.EqualTo(_SubCost * diffWord.Length + _InsCost * (_BaseWord.Length - diffWord.Length)));
        }
    }
}
