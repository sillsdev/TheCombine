using System;
using BackendFramework.Interfaces;

namespace BackendFramework.Helper
{
    public class LevenshteinDistance : IEditDistance
    {
        private readonly int costDeletion;
        private readonly int costInsertion;
        private readonly int costSubstitution;

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
            costDeletion = costDelete;
            costInsertion = costInsert;
            costSubstitution = costSubstitute;
        }

        public LevenshteinDistance(int costDeleteInsert, int costSubstitute) :
            this(costDeleteInsert, costDeleteInsert, costSubstitute)
        { }

        public LevenshteinDistance(int costEdit) : this(costEdit, costEdit) { }

        public LevenshteinDistance() : this(1) { }

        public int GetDistance(string stringA, string stringB)
        {
            int[,] matrix = new int[stringA.Length + 1, stringB.Length + 1];
            for (var i = 0; i <= stringA.Length; i++)
            {
                for (var j = 0; j <= stringB.Length; j++)
                {
                    // Populate first column and row.
                    if (i == 0 || j == 0)
                    {
                        matrix[i, j] = costDeletion * i + costInsertion * j;
                        continue;
                    }

                    // Calculate other entries recursively.
                    var scoreDeleteInsert = Math.Min(
                        matrix[i - 1, j] + costDeletion,
                        matrix[i, j - 1] + costInsertion
                    );
                    var localCostSub = (stringA[i - 1] == stringB[j - 1]) ? 0 : costSubstitution;
                    matrix[i, j] = Math.Min(scoreDeleteInsert, matrix[i - 1, j - 1] + localCostSub);
                }
            }
            return matrix[stringA.Length, stringB.Length];
        }
    }
}
