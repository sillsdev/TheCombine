//Sam Delaney, 6/12/19

import { Word, testWordList } from "../../../types/word";

export interface ScoredWord {
  word: Word;
  score: number;
}

export interface ScoredCollection {
  words: Word[];
  score: number;
}

export default class DupFinder {
  constructor(
    searchLim: number = 500,
    maxScore: number = 6,
    maxCount: number = 20,
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
  getNextDups(): Word[] {
    let outputCollection: Word[] = [];

    //iterate until getDupsFromWordList loop returns more than one Word
    for (
      this.searchCount = 0;
      this.searchCount <= this.searchLimit;
      this.searchCount++
    ) {
      //iterate until getWordsFromDB returns more than one Word
      for (
        ;
        outputCollection.length <= 1 && this.searchCount <= this.searchLimit;
        this.searchCount++
      ) {
        outputCollection = this.getWordsFromDB();
      }

      //find the parent that returns the highest number of duplicates
      let parent: ScoredCollection = { words: [], score: 0 }; //index, count
      for (let i = 0; i < outputCollection.length; i++) {
        let iterDups: ScoredCollection = {
          score: i,
          words: this.getDupsFromWordList(outputCollection[i], outputCollection)
        };
        if (parent.score < iterDups.score) parent = iterDups;
      }
      outputCollection = parent.words;
    }
    return outputCollection;
  }

  //temporary placeholder TODO
  //returns a set of words from the database
  getWordsFromDB(): Word[] {
    return testWordList();
  }

  //scores a collection and returns
  getDupsFromWordList(parent: Word, words: Word[]): Word[] {
    let scoredWords: ScoredWord[] = this.scoreWords(parent, words);

    let outputCollection: Word[] = this.getAcceptedWords(scoredWords);

    return outputCollection;
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
        word.gloss === parent.gloss
      ) {
        scoredWords.push({ word, score: 0 });
      } else {
        //get current word score
        let score = this.getLevenshteinDistance(
          parent.vernacular,
          word.vernacular
        );

        score *= this.getLevenshteinDistance(parent.gloss, word.gloss);

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
      if (i != pivotIndex) {
        scoredwords[i].score > pivot.score
          ? greater.push(scoredwords[i])
          : less.push(scoredwords[i]);
      }
    }

    return [...this.quicksort(less), pivot, ...this.quicksort(greater)];
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
        if (i == 0) {
          matrix[i][j] = j;
          continue;
        }

        //populate first row
        if (j == 0) {
          matrix[i][j] = i;
          continue;
        }

        let thisSubCost = 0;
        if (a[i] != b[j]) thisSubCost = this.subsitutionCost;

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
