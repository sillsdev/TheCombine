import { Word, hasSenses } from "../../../types/word";
import * as backend from "../../../backend";

export interface FinderParams {
  searchLim: number;
  maxScore: number;
  maxCount: number;
  subCost: number;
  insCost: number;
  delCost: number;
  qualVal: number;
}

//use spread operator on default params to assign to parameters
export const DefaultParams: FinderParams = {
  searchLim: 500,
  maxScore: 3,
  maxCount: 8,
  subCost: 1,
  insCost: 2,
  delCost: 2,
  qualVal: 0
};

export interface ScoredWord {
  word: Word;
  score: number;
}

interface MaskedWord {
  word: Word;
  map: Bitmask;
}

interface Bitmask {
  vernMask: number;
  glossMasks: number[];
}

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

  //Levenshtein settings
  insertionCost: number;
  deletionCost: number;
  subsitutionCost: number;

  vernmap: Set<string>;
  glossmap: Set<string>;
  maskedWords: MaskedWord[];

  empty2dArray = [[]];

  //filter output, total output - Used for testing duplicate finder. (See docs/bitmap_testing.md)
  //filterTest: [number, number] = [0, 0];

  // get n lists of suspected duplicates from DB O(n^(4+ε)). Returns [] if no duplicates have been found.
  async getNextDups(n: number = 1): Promise<Word[][]> {
    let wordsFromDB: Promise<Word[][]> = this.getWordsFromDB().then(
      wordCollections => {
        //return no words if DB empty
        if (wordCollections.length <= 0) {
          return this.empty2dArray;
        }

        this.setMapsAndMaskWords(wordCollections);

        //[wordlist, list score]
        let currentWords: [Word[], number][] = [];

        //use each word as a parent and compare the resulting lists against each other
        for (let i = 0; i < wordCollections.length; i++) {
          //word list to compare against current words
          let newWordList: [Word[], number] = this.getDuplicatesOfWord(
            wordCollections[i]
          );

          //ignore wordlists with less than 2 words
          if (newWordList[0].length <= 1) {
            continue;
          }

          //add wordlist if currentWords is not full yet
          if (currentWords.length < n) {
            currentWords.push(newWordList);
            continue;
          }

          //add wordlist if it scores lower than the last element in currentWords
          // and resort currentWords
          if (
            currentWords[currentWords.length - 1].length < newWordList.length
          ) {
            currentWords.push(newWordList);
            currentWords.sort(function(a, b): number {
              return a[1] - b[1];
            });
            currentWords.pop();
          }
        }

        //Used for testing duplicate finder. (See docs/bitmap_testing.md)
        /*
        console.log(
          "Start: " + wordCollections.length,
          "Filtered: " + this.filterTest[0] / wordCollections.length,
          "Result: " + this.filterTest[1] / wordCollections.length
        );
        */

        //return empty 2d array if no possible duplicates found
        if (currentWords.length <= 0) return this.empty2dArray;

        //return the wordlist from the scored list
        return currentWords.map(function(scoredList) {
          return scoredList[0];
        });
      }
    );
    return wordsFromDB;
  }
  /** defines vernacular and gloss bitmaps */
  setMapsAndMaskWords(wordCollection: Word[]) {
    //empty bitmaps
    this.vernmap.clear();
    this.glossmap.clear();

    //define bitmaps
    wordCollection.forEach(word => {
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
    wordCollection.forEach(word => {
      this.maskedWords.push(this.maskWord(word));
    });
  }
  //returns a set of words from the database
  async getWordsFromDB(): Promise<Word[]> {
    var wordCollection = backend.getFrontierWords();
    return wordCollection;
  }

  //scores a collection and returns
  getDuplicatesOfWord(parent: Word): [Word[], number] {
    //narrow down very different words
    let words = this.filter(parent, this.maskedWords);

    //Used for testing duplicate finder. (See docs/bitmap_testing.md)
    //this.filterTest[0] += words.length;

    //thorough scoring
    let scoredWords: ScoredWord[] = this.scoreWords(parent, words);

    //apply thresholds
    let scoredList: [Word[], number] = this.getAcceptedWords(scoredWords);

    //Used for testing duplicate finder. (See docs/bitmap_testing.md)
    //this.filterTest[1] += scoredList[0].length;

    return scoredList;
  }

  //map a word and return as type MappedWord
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
      map: {
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

  private compareMasks(a: Bitmask, b: Bitmask, threshold: number): boolean {
    //compare masks against threshold
    if (
      this.calculateMaskScore(a.vernMask & ~b.vernMask) +
        this.calculateMaskScore(b.vernMask & ~a.vernMask) <
      threshold * 2
    )
      return true;

    a.glossMasks.forEach(agloss => {
      b.glossMasks.forEach(bgloss => {
        if (
          this.calculateMaskScore(agloss & ~bgloss) +
            this.calculateMaskScore(bgloss & ~agloss) <
          threshold * 2
        )
          return true;
      });
    });
    return false;
  }

  private calculateMaskScore(mask: number): number {
    let score = 0;
    while (mask > 0) {
      if (mask % 2 === 1) score++;
      mask = mask >> 1;
    }
    return score;
  }

  /** remove words that are more than one longer or shorter than parent */
  filter(parent: Word, words: MaskedWord[]): Word[] {
    let mappedParent: MaskedWord = this.maskWord(parent);

    let bitFilteredWords: Word[] = [];

    //filter words with bitmap
    words.forEach(mappedWord => {
      if (this.compareMasks(mappedParent.map, mappedWord.map, 3))
        bitFilteredWords.push(mappedWord.word);
    });

    let filteredWords: Word[] = [];

    //filter based on word length - may not be worth the computation time
    bitFilteredWords.forEach(word => {
      if (Math.abs(parent.vernacular.length - word.vernacular.length) < 2)
        filteredWords.push(word);
    });

    return filteredWords;
  }

  /** removes words which do not fit the quality thresholds and returns a reordered collection of the accepted words */
  getAcceptedWords(words: ScoredWord[]): [Word[], number] {
    let outputCollection: [Word[], number] = [[], 0];

    words = this.quicksort(words);

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

  //takes in an array of words, scores each word and returns the result
  scoreWords(parent: Word, words: Word[]): ScoredWord[] {
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
  //quicksort implmentation O(n log n)
  quicksort(scoredwords: ScoredWord[]): ScoredWord[] {
    if (scoredwords.length <= 1) return scoredwords;

    let pivotIndex = 0;
    let pivot = scoredwords[0];

    let less = [];
    let greater = [];

    for (let i = 0; i < scoredwords.length; i++) {
      if (i !== pivotIndex) {
        scoredwords[i].score > pivot.score
          ? greater.push(scoredwords[i])
          : less.push(scoredwords[i]);
      }
    }

    return [...this.quicksort(less), pivot, ...this.quicksort(greater)];
  }

  //extra level of abstraction for readability
  wordLevenshteinDistance(a: Word, b: Word): number {
    //get current word score
    let vernScore = this.getLevenshteinDistance(a.vernacular, b.vernacular);
    let glossScore = 0;
    if (hasSenses(a) && hasSenses(b)) {
      glossScore = this.getLevenshteinDistance(
        a.senses[0].glosses[0].def,
        b.senses[0].glosses[0].def
      );
      if (glossScore === 0) return 1;
    }
    if (vernScore <= 1) return vernScore;

    return vernScore + glossScore * 3;
  }

  //controls the scoring of a particular child by calculating the Levenshtein distance in O(n^(1 + ε)
  getLevenshteinDistance(aInput: string, bInput: string): number {
    const matrix: number[][] = [];

    //may need to change the way we split to preserve non-roman characters. Untested.
    let a: string[] = aInput.split("");
    let b: string[] = bInput.split("");

    if (a.length <= 0 || b.length <= 0) return 0;
    for (let i = 0; i < a.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < b.length; j++) {
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
        if (a[i] !== b[j]) thisSubCost = this.subsitutionCost;

        matrix[i][j] = Math.min(
          matrix[i - 1][j] + this.deletionCost, //deletion
          matrix[i][j - 1] + this.insertionCost, //insertion
          matrix[i - 1][j - 1] + thisSubCost //substitution
        );
      }
    }
    return matrix[a.length - 1][b.length - 1];
  }
}
