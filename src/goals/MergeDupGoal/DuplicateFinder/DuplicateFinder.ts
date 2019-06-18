//Sam Delaney, 6/12/19

import { Word, hasSenses } from "../../../types/word";
import axios from "axios";
const backend = axios.create({ baseURL: "https://localhost:5001/v1" });

export interface ScoredWord {
  word: Word;
  score: number;
}

export default class DupFinder {
  constructor(
    searchLim: number = 500,
    maxScore: number = 4,
    maxCount: number = 8,
    subCost: number = 1,
    insCost: number = 1,
    delCost: number = 1,
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

  // get list of suspected duplicates from DB O(n^(4+ε)). Returns [] if no duplicates have been found.
  async getNextDups(): Promise<Word[]> {
    let wordsFromDB: Promise<Word[]> = this.getWordsFromDB().then(words => {
      let foundWords: Word[] = [];
      for (let i = 0; i < words.length; i++) {
        let iterDups: Word[] = this.getDupsFromWordList(words[i], words);
        if (foundWords.length < iterDups.length) foundWords = iterDups;
      }
      return foundWords;
    });
    return wordsFromDB;
  }

  //returns a set of words from the database
  async getWordsFromDB(): Promise<Word[]> {
    var wordCollection = backend
      .get("project/words/frontier")
      .then(async resp => await resp.data);
    return wordCollection;
  }

  //scores a collection and returns
  getDupsFromWordList(parent: Word, words: Word[]): Word[] {
    //narrow down very different words
    words = this.quickscore(parent, words);

    //thorough scoring
    let scoredWords: ScoredWord[] = this.scoreWords(parent, words);

    //apply thresholds
    words = this.getAcceptedWords(scoredWords);

    return words;
  }

  //remove words that are more than one longer or shorter than parent
  quickscore(parent: Word, words: Word[]): Word[] {
    words.forEach(word => {
      if (Math.abs(parent.vernacular.length - word.vernacular.length) > 1)
        words.filter(w => w !== word);
    });
    return words;
  }

  //removes words which do not fit the quality thresholds and returns a reordered collection of the accepted words
  getAcceptedWords(words: ScoredWord[]): Word[] {
    let outputCollection: Word[] = [];

    words = this.quicksort(words);

    //apply thresholds (score is redundant)
    words.forEach(scoredword => {
      if (
        scoredword.score <= this.maxScore &&
        outputCollection.length <= this.maxCount
      ) {
        outputCollection.push(scoredword.word);
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
        score += this.sizeAdjust(parent, word);

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
    return 3 - (a.vernacular.length + b.vernacular.length) / 4;
  }

  //extra level of abstraction for readability
  wordLevenshteinDistance(a: Word, b: Word): number {
    //get current word score
    let score = this.getLevenshteinDistance(a.vernacular, b.vernacular);
    if (hasSenses(a) && hasSenses(b)) {
      score *= this.getLevenshteinDistance(
        a.senses[0].glosses[0].def,
        b.senses[0].glosses[0].def
      );
    }
    return score;
  }

  //controls the scoring of a particular child by calculating the Levenshtein distance in O(n^(1 + ε)
  getLevenshteinDistance(aInput: string, bInput: string): number {
    const matrix: number[][] = [];

    //may need to change the way we split to preserve non-roman characters. Untested.
    let a: string[] = aInput.split("");
    let b: string[] = bInput.split("");

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
