import * as backend from "../../../backend";
import { hasSenses, Word } from "../../../types/word";
import { quicksort } from "../../../utilities";

export interface FinderParams {
  maxScore: number;
  maxCount: number;
  subCost: number;
  insCost: number;
  delCost: number;
  qualVal: number;
  bitfilterAt: number;
  lengthFilter: number;
}

//use spread operator on default params to assign to parameters
export const DefaultParams: FinderParams = {
  maxScore: 3,
  maxCount: 8,
  subCost: 1,
  insCost: 2,
  delCost: 2,
  qualVal: 0,
  bitfilterAt: 3,
  lengthFilter: 2,
};

export interface ScoredWord {
  word: Word;
  score: number;
}

interface MaskedWord {
  word: Word;
  mask: Bitmask;
}

interface Bitmask {
  vernMask: number;
  glossMasks: number[];
}

// THIS DOES NOT YET WORK WITH MULTIPLE GLOSSES

export default class DupFinder {
  constructor(params: FinderParams = DefaultParams) {
    this.searchCount = 0;

    this.qualifiedValue = params.qualVal;

    this.maxScore = params.maxScore;
    this.maxCount = params.maxCount;

    this.insertionCost = params.insCost;
    this.deletionCost = params.delCost;
    this.subsitutionCost = params.subCost;

    this.lengthFilter = params.lengthFilter;

    this.bitfilterAt = params.bitfilterAt;
    this.vernmap = new Set();
    this.glossmap = new Set();
    this.maskedWords = [];
  }

  searchCount: number; // Can be referenced from outside to calculate progress

  //score assigned to automatically qualified words
  qualifiedValue: number;

  //output content thresholds
  maxScore: number;
  maxCount: number;
  lengthFilter: number;

  //Levenshtein settings
  insertionCost: number;
  deletionCost: number;
  subsitutionCost: number;

  //bitmap filtering
  bitfilterAt: number;
  vernmap: Set<string>;
  glossmap: Set<string>;
  maskedWords: MaskedWord[];

  //error handling
  empty2dArray = [[]];

  /** Get lists of suspected duplicates. Returns [] if none found. */
  async getNextDups(): Promise<Word[][]> {
    const wordsLoaded = await this.fetchWordsFromDB();
    if (!wordsLoaded) {
      return [];
    }

    const currentWordLists: Word[][] = [];
    const remainingWords = this.maskedWords;
    let newWordList: Word[];

    // Use each word as a parent and compare the resulting lists against each other.
    for (let i = 0; i < this.maskedWords.length; i++) {
      // Word list to compare against current words.
      newWordList = this.getDuplicatesOfWord(
        this.maskedWords[i],
        remainingWords
      );
      remainingWords.shift();

      // Add lists with multiple words.
      if (newWordList.length > 1) {
        currentWordLists.push(newWordList);
        this.searchCount += 1;
      }
    }

    // Sort alphabetically.
    currentWordLists.sort((a, b) =>
      a[0].vernacular.localeCompare(b[0].vernacular)
    );

    return currentWordLists;
  }

  /** Returns a collection of duplicates of the parent. */
  getDuplicatesOfWord(
    parent: Word | MaskedWord,
    wordCollection?: MaskedWord[]
  ): Word[] {
    if (!("mask" in parent)) {
      parent = this.maskWord(parent);
    }

    if (!wordCollection) {
      wordCollection = this.maskedWords;
    }

    if (wordCollection.length <= 0) {
      return [];
    }

    // Narrow down very different words.
    const words = this.filter(parent, wordCollection);

    // Thorough scoring.
    const scoredWords = this.scoreWords(parent.word, words);

    // Apply thresholds.
    const wordList = this.getAcceptedWords(scoredWords);

    // Sort alphabetically.
    wordList.sort((a, b) => a.vernacular.localeCompare(b.vernacular));

    return wordList;
  }

  /** controls the scoring of a particular child by calculating the Levenshtein distance in O(n^(1 + ε) */
  getLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    let alength = a.length + 1;
    let blength = b.length + 1;

    if (a.length <= 0 || b.length <= 0) return this.maxScore;

    for (let i = 0; i < alength; i++) {
      matrix[i] = [];
      for (let j = 0; j < blength; j++) {
        //populate first column
        if (i === 0) {
          matrix[i][j] = j;
          continue;
        }

        //populate first row
        if (j === 0) {
          matrix[i][j] = i;
          continue;
        }

        let thisSubCost = 0;
        if (a[i - 1] !== b[j - 1]) {
          thisSubCost = this.subsitutionCost;
        }

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + this.deletionCost, //deletion
          matrix[i][j - 1] + this.insertionCost, //insertion
          matrix[i - 1][j - 1] + thisSubCost //substitution
        );
      }
    }
    return matrix[a.length - 1][b.length - 1];
  }

  /** gets words from the frontier, creates maps and stores the masked words in this.maskedWords
   * returns whether any words existed in the database
   */
  async fetchWordsFromDB(): Promise<boolean> {
    return backend.getFrontierWords().then((wordsFromDB) => {
      if (wordsFromDB.length <= 0) {
        return false;
      }

      //empty bitmaps
      this.vernmap.clear();
      this.glossmap.clear();

      //define bitmaps
      wordsFromDB.forEach((word) => {
        word.vernacular.split("").forEach((char) => {
          this.vernmap.add(char);
        });

        if (hasSenses(word)) {
          word.senses[0].glosses[0].def.split("").forEach((char) => {
            this.glossmap.add(char);
          });
        }
      });

      //clear current words
      this.maskedWords = [];

      //map and store current words
      wordsFromDB.forEach((word) => {
        this.maskedWords.push(this.maskWord(word));
      });

      return true;
    });
  }

  //---------------------------------- PRIVATE METHODS ----------------------------------\\

  /** map a word and return as type MaskedWord */
  private maskWord(word: Word): MaskedWord {
    //mask vernacular
    let vernMask: number = this.mapString(word.vernacular, this.vernmap);

    //mask glosses
    let glossMasks: number[] = [];
    word.senses.forEach((sense, i) => {
      sense.glosses.forEach((gloss) =>
        glossMasks.concat(this.mapString(gloss.def, this.glossmap))
      );
    });

    return {
      word,
      mask: {
        vernMask,
        glossMasks,
      } as Bitmask,
    } as MaskedWord;
  }

  /** return the input string masked to the map as a number */
  private mapString(input: string, map: Set<string>): number {
    var output = 0b0;
    var splitInput = input.split("");

    let i: number = 0;
    map.forEach((character) => {
      if (splitInput.includes(character)) output = output | (1 << i);
      i++;
    });
    return output;
  }

  /** compare two masks and return whether their result falls below a threshold */
  private masksAreSimilar(a: Bitmask, b: Bitmask): boolean {
    //compare masks against threshold
    if (
      this.calculateMaskScore(a.vernMask & ~b.vernMask) +
        this.calculateMaskScore(b.vernMask & ~a.vernMask) <
      this.bitfilterAt * 2
    )
      return true;

    a.glossMasks.forEach((agloss) => {
      b.glossMasks.forEach((bgloss) => {
        if (
          this.calculateMaskScore(agloss & ~bgloss) +
            this.calculateMaskScore(bgloss & ~agloss) <
          this.bitfilterAt * 2
        )
          return true;
      });
    });
    return false;
  }

  /** read bitmask and return number of characters represented in data */
  private calculateMaskScore(mask: number): number {
    let score = 0;
    while (mask > 0) {
      if (mask % 2 === 1) score++;
      mask = mask >> 1;
    }
    return score;
  }

  /** remove words that are more than one longer or shorter than parent */
  private filter(parent: MaskedWord, words: MaskedWord[]): Word[] {
    let bitFilteredWords: Word[] = [];

    //filter words with bitmap
    words.forEach((mappedWord) => {
      if (this.masksAreSimilar(parent.mask, mappedWord.mask))
        bitFilteredWords.push(mappedWord.word);
    });

    let filteredWords: Word[] = [];

    //filter based on word length - may not be worth the computation time
    bitFilteredWords.forEach((word) => {
      if (
        Math.abs(parent.word.vernacular.length - word.vernacular.length) <
        this.lengthFilter
      )
        filteredWords.push(word);
    });

    return filteredWords;
  }

  /** Returns collection of highest scoring words above the quality threshold. */
  private getAcceptedWords(words: ScoredWord[]): Word[] {
    const outputCollection: Word[] = [];

    const getScore = (word: ScoredWord) => word.score;

    words = quicksort<ScoredWord>(words, getScore);

    // Apply thresholds.
    words.forEach((scoredWord) => {
      if (
        scoredWord.score <= this.maxScore &&
        outputCollection.length <= this.maxCount
      ) {
        outputCollection.push(scoredWord.word);
      }
    });

    return outputCollection;
  }

  /** takes in an array of words, scores each word and returns the result */
  private scoreWords(parent: Word, words: Word[]): ScoredWord[] {
    let scoredWords: ScoredWord[] = [];

    //step through each word and compare it to the parent
    words.forEach((word) => {
      //check for automatic qualifiers
      if (
        word.vernacular === parent.vernacular ||
        (hasSenses(word) &&
          hasSenses(parent) &&
          word.senses[0] === parent.senses[0])
      ) {
        scoredWords.push({ word, score: 0 });
      } else {
        //initial score
        let score = this.wordLevenshteinDistance(parent, word);

        //adjust for bias
        score *= 5 / word.vernacular.length; // this.sizeAdjust(parent, word);

        //apply score threshold
        if (score < this.maxScore) scoredWords.push({ word, score });
      }
    });
    return scoredWords;
  }

  /** compares vernacular form and glosses of a word using the Levenshtein algorithm*/
  private wordLevenshteinDistance(a: Word, b: Word): number {
    //get current word score
    let vernScore = this.getLevenshteinDistance(a.vernacular, b.vernacular);
    if (vernScore <= 1) return vernScore;

    let glossScore = 0;
    if (hasSenses(a) && hasSenses(b)) {
      glossScore = this.getLevenshteinDistance(
        a.senses[0].glosses[0].def,
        b.senses[0].glosses[0].def
      );
      if (glossScore === 0) return 1;
    }

    return vernScore + glossScore * 3;
  }
}
