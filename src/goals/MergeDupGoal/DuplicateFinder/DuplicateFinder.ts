import { Word, hasSenses } from "../../../types/word";
import * as backend from "../../../backend";

export interface ScoredWord {
  word: Word;
  score: number;
}

export default class DupFinder {
  constructor(
    searchLim: number = 500,
    maxScore: number = 3,
    maxCount: number = 8,
    subCost: number = 1,
    insCost: number = 2,
    delCost: number = 2,
    qualVal: number = 0
  ) {
    this.searchLimit = searchLim;

    this.searchCount = 0;

    this.qualifiedValue = qualVal;

    this.maxScore = maxScore;
    this.maxCount = maxCount;

    this.insertionCost = insCost;
    this.deletionCost = delCost;
    this.subsitutionCost = subCost;
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

  empty2dArray = [[]];

  // get n lists of suspected duplicates from DB O(n^(4+ε)). Returns [] if no duplicates have been found.
  async getNextDups(n: number = 1): Promise<Word[][]> {
    let wordsFromDB: Promise<Word[][]> = this.getWordsFromDB().then(words => {
      //return no words if DB empty
      console.log(words);
      if (words.length <= 0) {
        return this.empty2dArray;
      }
      //[wordlist, list score]
      let currentWords: [Word[], number][] = [];

      //use each word as a parent and compare the resulting lists against each other
      for (let i = 0; i < words.length; i++) {
        //word list to compare against current words
        let newWordList: [Word[], number] = this.getDupsFromWordList(
          words[i],
          words
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
        if (currentWords[currentWords.length - 1].length < newWordList.length) {
          currentWords.push(newWordList);
          currentWords.sort(function(a, b): number {
            return a[1] - b[1];
          });
          currentWords.pop();
        }
      }

      //return empty 2d array if no possible duplicates found
      if (currentWords.length <= 0) return this.empty2dArray;

      //return the wordlist from the scored list
      return currentWords.map(function(scoredList) {
        return scoredList[0];
      });
    });
    return wordsFromDB;
  }

  //returns a set of words from the database
  async getWordsFromDB(): Promise<Word[]> {
    var wordCollection = backend.getFrontierWords();
    return wordCollection;
  }

  //scores a collection and returns
  getDupsFromWordList(parent: Word, words: Word[]): [Word[], number] {
    //narrow down very different words
    words = this.filter(parent, words);

    //thorough scoring
    let scoredWords: ScoredWord[] = this.scoreWords(parent, words);

    //apply thresholds
    let scoredList: [Word[], number] = this.getAcceptedWords(scoredWords);

    return scoredList;
  }

  //remove words that are more than one longer or shorter than parent
  filter(parent: Word, words: Word[]): Word[] {
    let filteredWords: Word[] = [];
    words.forEach(word => {
      if (Math.abs(parent.vernacular.length - word.vernacular.length) < 2)
        filteredWords.push(word);
    });
    return filteredWords;
  }

  //removes words which do not fit the quality thresholds and returns a reordered collection of the accepted words
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

  //adjust for levenshtein's bias toward short words
  sizeAdjust(a: Word, b: Word): number {
    return Math.max(
      this.maxScore - (a.vernacular.length + b.vernacular.length) / 3,
      0
    );
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
