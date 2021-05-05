export interface FinderParams {
  delCost: number;
  insCost: number;
  subCost: number; // Must be <= delCost + insCost.
}

export const DefaultParams: FinderParams = {
  delCost: 1,
  insCost: 1,
  subCost: 1,
};

export default class DupFinder {
  readonly deletionCost: number;
  readonly insertionCost: number;
  readonly subsitutionCost: number;

  constructor(params: FinderParams = DefaultParams) {
    this.deletionCost = params.delCost;
    this.insertionCost = params.insCost;
    this.subsitutionCost = params.subCost;
  }

  /** Calculate the Levenshtein distance in O(n^(1 + ε). */
  getLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [];
      for (let j = 0; j <= b.length; j++) {
        // Populate first row & column.
        if (i === 0 || j === 0) {
          matrix[i][j] = i * this.deletionCost + j * this.insertionCost;
          continue;
        }

        // Recursively compute other entries.
        const thisSubCost = a[i - 1] === b[j - 1] ? 0 : this.subsitutionCost;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + this.deletionCost, //deletion
          matrix[i][j - 1] + this.insertionCost, //insertion
          matrix[i - 1][j - 1] + thisSubCost //substitution
        );
      }
    }
    return matrix[a.length][b.length];
  }
}
