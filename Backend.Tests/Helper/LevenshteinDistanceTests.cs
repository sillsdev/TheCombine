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
        private const int _SubCost = 5; // Must be <= _DelCost + _InsCost;
        private const string _BaseWord = "EditDistanceTest";

        [OneTimeSetUp]
        public void Setup()
        {
            _levDist = new LevenshteinDistance(_DelCost, _InsCost, _SubCost);
        }

        [Test]
        public void GetDistanceEmptyWordTest()
        {
            Assert.AreEqual(0, _levDist.GetDistance("", ""));
            Assert.AreEqual(_DelCost * _BaseWord.Length, _levDist.GetDistance(_BaseWord, ""));
            Assert.AreEqual(_InsCost * _BaseWord.Length, _levDist.GetDistance("", _BaseWord));
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
            Assert.AreEqual(score, _levDist.GetDistance(_BaseWord, simWord));
        }

        [Test]
        public void GetDistanceDifferentWordTest()
        {
            const string diffWord = "ZZZZ";
            Assert.AreEqual(_SubCost * diffWord.Length + _DelCost * (_BaseWord.Length - diffWord.Length),
                _levDist.GetDistance(_BaseWord, diffWord));
            Assert.AreEqual(_SubCost * diffWord.Length + _InsCost * (_BaseWord.Length - diffWord.Length),
                _levDist.GetDistance(diffWord, _BaseWord));
        }
    }
}