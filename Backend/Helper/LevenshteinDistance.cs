using System;
using BackendFramework.Interfaces;
using static System.Linq.Enumerable;

namespace BackendFramework.Helper
{
    public class LevenshteinDistance : IEditDistance
    {
        private readonly int _costDeletion;
        private readonly int _costInsertion;
        private readonly int _costSubstitution;

        /// <exception cref="ArgumentException">
        /// Throws for any non-positive cost or when costDelete + costInsert is less than costSubstitute.
        /// </exception>
        public LevenshteinDistance(int costDelete, int costInsert, int costSubstitute)
        {
            if (costDelete <= 0 || costInsert <= 0 || costSubstitute <= 0)
            {
                throw new ArgumentException("Edit costs must be positive.");
            }
            if (costDelete + costInsert < costSubstitute)
            {
                throw new ArgumentException("Substitution cost must be <= the sum of deletion and insertion costs.");
            }
            _costDeletion = costDelete;
            _costInsertion = costInsert;
            _costSubstitution = costSubstitute;
        }

        public LevenshteinDistance(int costDeleteInsert, int costSubstitute) :
            this(costDeleteInsert, costDeleteInsert, costSubstitute)
        { }

        public LevenshteinDistance(int costEdit) : this(costEdit, costEdit) { }

        public LevenshteinDistance() : this(1) { }

        public int GetDistance(string stringA, string stringB)
        {
            int[,] matrix = new int[stringA.Length + 1, stringB.Length + 1];
            foreach (var i in Range(0, stringA.Length + 1))
            {
                foreach (var j in Range(0, stringB.Length + 1))
                {
                    // Populate first column and row.
                    if (i == 0 || j == 0)
                    {
                        matrix[i, j] = _costDeletion * i + _costInsertion * j;
                        continue;
                    }

                    // Calculate other entries recursively.
                    var scoreDeleteInsert = Math.Min(
                        matrix[i - 1, j] + _costDeletion,
                        matrix[i, j - 1] + _costInsertion
                    );
                    var localCostSub = (stringA[i - 1] == stringB[j - 1]) ? 0 : _costSubstitution;
                    matrix[i, j] = Math.Min(scoreDeleteInsert, matrix[i - 1, j - 1] + localCostSub);
                }
            }
            return matrix[stringA.Length, stringB.Length];
        }
    }
}
