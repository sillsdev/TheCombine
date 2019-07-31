import { Word, hasSenses } from "../../../types/word";
import * as backend from "../../../backend";
import { quicksort } from "../../../utilities";

export interface FinderParams {
  searchLim: number;
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
  searchLim: 500,
  maxScore: 3,
  maxCount: 8,
  subCost: 1,
  insCost: 2,
  delCost: 2,
  qualVal: 0,
  bitfilterAt: 3,
  lengthFilter: 2
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

//[wordlist, list score]
type ScoredWordlist = [Word[], number];

// THIS DOES NOT YET WORK WITH MULTIPLE GLOSSES

export default class DupFinder {
  constructor(params: FinderParams = DefaultParams) {
    this.searchLimit = params.searchLim;

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

  //prevent infinite loops in getNextDups()
  searchLimit: number;

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

  //filter output, total output - Used for testing duplicate finder. (See docs/bitmap_testing.md)
  //filterTest: [number, number] = [0, 0];

  /** get n lists of suspected duplicates from DB O(n^(4+ε)).
   * Returns [] if no duplicates have been found.
   */
  async getNextDups(n: number = 1): Promise<Word[][]> {
    let wordCollections: Promise<Word[][]> = this.fetchWordsFromDB().then(
      gotWordsFromDB => {
        //return no words if DB empty
        if (!gotWordsFromDB) return this.empty2dArray;

        //[wordlist, list score]
        let currentWordlists: ScoredWordlist[] = [];

        //use each word as a parent and compare the resulting lists against each other
        let remainingWords = this.maskedWords;
        for (let i = 0; i < this.maskedWords.length; i++) {
          //word list to compare against current words
          let newWordList: ScoredWordlist = this.getDuplicatesOfWord(
            this.maskedWords[i],
            remainingWords
          );
          remainingWords.shift();

          //ignore wordlists with less than 2 words
          if (newWordList[0].length <= 1) {
            continue;
          }

          //add wordlist if currentWords is not full yet
          currentWordlists.push(newWordList);
          continue;
        }
        currentWordlists.sort(function(a, b): number {
          return a[1] - b[1];
        });

        //Used for testing duplicate finder. (See docs/bitmap_testing.md)
        // console.log(
        //   "Start: " + this.maskedWords.length,
        //   "Filtered: " + this.filterTest[0] / this.maskedWords.length,
        //   "Result: " + this.filterTest[1] / this.maskedWords.length
        // );

        //return empty 2d array if no possible duplicates found
        if (currentWordlists.length <= 0) return this.empty2dArray;

        //return the wordlist from the scored list
        return currentWordlists.map(function(scoredList) {
          return scoredList[0];
        });
      }
    );
    return wordCollections;
  }

  /** returns a scored collection of duplicates of the parent */
  getDuplicatesOfWord(
    parent: Word | MaskedWord,
    wordCollection?: MaskedWord[]
  ): ScoredWordlist {
    if (!("mask" in parent)) parent = this.maskWord(parent);

    if (!wordCollection) wordCollection = this.maskedWords;

    if (wordCollection.length <= 0) {
      return [[], Number.MAX_SAFE_INTEGER];
    }

    //narrow down very different words
    let words = this.filter(parent, wordCollection);

    //Used for testing duplicate finder. (See docs/bitmap_testing.md)
    //this.filterTest[0] += words.length;

    //thorough scoring
    let scoredWords: ScoredWord[] = this.scoreWords(parent.word, words);

    //apply thresholds
    let scoredList: ScoredWordlist = this.getAcceptedWords(scoredWords);

    //Used for testing duplicate finder. (See docs/bitmap_testing.md)
    //this.filterTest[1] += scoredList[0].length;

    return scoredList;
  }

  /** controls the scoring of a particular child by calculating the Levenshtein distance in O(n^(1 + ε) */
  getLevenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    let alength = a.length + 1;
    let blength = b.length + 1;

    if (a.length <= 0 || b.length <= 0) return 0;

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
    return backend.getFrontierWords().then(wordsFromDB => {
      if (wordsFromDB.length <= 0) {
        return false;
      }

      //empty bitmaps
      this.vernmap.clear();
      this.glossmap.clear();

      //define bitmaps
      wordsFromDB.forEach(word => {
        word.vernacular.split("").forEach(char => {
          this.vernmap.add(char);
        });

        if (hasSenses(word)) {
          word.senses[0].glosses[0].def.split("").forEach(char => {
            this.glossmap.add(char);
          });
        }
      });

      //clear current words
      this.maskedWords = [];

      //map and store current words
      wordsFromDB.forEach(word => {
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
      sense.glosses.forEach(gloss =>
        glossMasks.concat(this.mapString(gloss.def, this.glossmap))
      );
    });

    return {
      word,
      mask: {
        vernMask,
        glossMasks
      } as Bitmask
    } as MaskedWord;
  }

  /** return the input string masked to the map as a number */
  private mapString(input: string, map: Set<string>): number {
    var output = 0b0;
    var splitInput = input.split("");

    let i: number = 0;
    map.forEach(character => {
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

    a.glossMasks.forEach(agloss => {
      b.glossMasks.forEach(bgloss => {
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
    words.forEach(mappedWord => {
      if (this.masksAreSimilar(parent.mask, mappedWord.mask))
        bitFilteredWords.push(mappedWord.word);
    });

    let filteredWords: Word[] = [];

    //filter based on word length - may not be worth the computation time
    bitFilteredWords.forEach(word => {
      if (
        Math.abs(parent.word.vernacular.length - word.vernacular.length) <
        this.lengthFilter
      )
        filteredWords.push(word);
    });

    return filteredWords;
  }

  /** removes words which do not fit the quality thresholds and returns a reordered collection of the accepted words */
  private getAcceptedWords(words: ScoredWord[]): ScoredWordlist {
    let outputCollection: ScoredWordlist = [[], 0];

    let getScore = (word: ScoredWord) => {
      return word.score;
    };

    words = quicksort<ScoredWord>(words, getScore);

    //apply thresholds (score is redundant)
    words.forEach(scoredword => {
      if (
        scoredword.score <= this.maxScore &&
        outputCollection[0].length <= this.maxCount
      ) {
        outputCollection[0].push(scoredword.word);
        outputCollection[1] += scoredword.score;
      }
    });

    return outputCollection;
  }

  /** takes in an array of words, scores each word and returns the result */
  private scoreWords(parent: Word, words: Word[]): ScoredWord[] {
    let scoredWords: ScoredWord[] = [];

    //step through each word and compare it to the parent
    words.forEach(word => {
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
