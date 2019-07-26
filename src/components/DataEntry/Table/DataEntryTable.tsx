import React from "react";
import { Typography, Grid, Chip, Button } from "@material-ui/core";
import theme from "../../../types/theme";

import {
  Translate,
  TranslateFunction,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";
import { Word, SemanticDomain, State, Gloss } from "../../../types/word";
import * as Backend from "../../../backend";
import DuplicateFinder from "../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import DomainTree from "../../TreeView/SemanticDomain";
import SpellChecker from "./spellChecker";
import { DeleteRow } from "../ExistingEntry/DeleteRow/DeleteRow";
import { NewVernEntry } from "../NewEntry/NewVernEntry.tsx/NewVernEntry";
import { NewGlossEntry } from "../NewEntry/NewGlossEntry.tsx/NewGlossEntry";
import { ExistingVernEntry } from "../ExistingEntry/ExistingVernEntry/ExistingVernEntry";
import { ExistingGlossEntry } from "../ExistingEntry/ExistingGlossEntry/ExistingGlossEntry";

interface DataEntryTableProps {
  domain: DomainTree;
  translate: TranslateFunction;
  spellChecker: SpellChecker;
  semanticDomain: SemanticDomain;
}

interface DataEntryState {
  rows: Row[];
  hoverIndex?: number /** Index of row being hovered over */;
}

export interface Row {
  id: string;
  vernacular: string;
  glosses: string;
  dupId: string /** The ID of the duplicate word in the frontier */;
  dupVernacular?: string /** The vernacular of the duplicate word in the frontier */;
  dupGlosses?: string[] /** The `def` field of the glosses of the duplicate word in the frontier */;
  glossSpelledCorrectly: boolean;
  showMispelled?: boolean;
  showDuplicate?: boolean;
  senseIndex: number /** The index of the sense of the word that we're showing in the view */;
}

export class DataEntryTable extends React.Component<
  DataEntryTableProps & LocalizeContextProps,
  DataEntryState
> {
  constructor(props: DataEntryTableProps & LocalizeContextProps) {
    super(props);
    let dataEntryRow: Row = {
      id: "",
      vernacular: "",
      glosses: "",
      dupId: "",
      glossSpelledCorrectly: true,
      senseIndex: 0
    };
    this.state = {
      rows: [dataEntryRow]
    };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  allWords: Word[] = [];
  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;

  async componentDidMount() {
    this.allWords = await Backend.getFrontierWords();
  }

  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();

    let rows = [...this.state.rows];
    let lastRow: Row = rows[rows.length - 1];

    if (lastRow.vernacular === "") return;

    let newWord = this.rowToNewWord(lastRow);
    let dupId = this.vernInFrontier(newWord.vernacular); // Check if already exists before adding to backend

    Backend.createWord(newWord)
      .catch(err => console.log(err))
      .then(async res => {
        let word = res as Word;
        this.allWords = await Backend.getFrontierWords();

        if (dupId === lastRow.id) {
          console.log("Duplicate");
        }

        let glossSpelledCorrectly = this.isSpelledCorrectly(lastRow.glosses);

        let newRow: Row = this.wordToRow(word, 0);
        newRow.id = word.id;
        newRow.dupId = dupId;
        newRow.glossSpelledCorrectly = glossSpelledCorrectly;
        rows[rows.length - 1] = newRow;

        // Clear the data entry row
        let dataEntryRow: Row = {
          id: "",
          vernacular: "",
          glosses: "",
          dupId: "",
          glossSpelledCorrectly: true,
          senseIndex: 0
        };

        rows.push(dataEntryRow);
        this.setState({ rows });

        this.focusVernInput();
        if (callback) callback(res);
      });
  }

  /** Return a new word based on a row */
  rowToNewWord(row: Row): Word {
    let word: Word = {
      id: row.id,
      vernacular: row.vernacular,
      senses: [
        {
          glosses: [],
          semanticDomains: [
            { name: this.props.domain.name, id: this.props.domain.id }
          ]
        }
      ],
      audio: "",
      created: "",
      modified: "",
      history: [],
      partOfSpeech: "",
      editedBy: [],
      accessability: State.active,
      otherField: "",
      plural: ""
    };
    word.senses[0].glosses = this.splitGloses(row.glosses);
    return word;
  }

  /** Convert a string containing glosses into an array of glosses */
  splitGloses(glossesString: string): Gloss[] {
    let glossesArray: Gloss[] = [];
    let defs: string[] = glossesString.split(",");
    for (let def of defs) {
      let gloss: Gloss = {
        language: "en",
        def: def.trim()
      };
      glossesArray.push(gloss);
    }

    return glossesArray;
  }

  /** If the venacular is in the frontier, returns that words id */
  vernInFrontier(vernacular: string): string {
    let Finder = new DuplicateFinder();

    //[vernacular form, levenshtein distance]
    // the number defined here sets the upper bound on acceptable scores
    let foundDuplicate: [string, number] = ["", 2];

    for (let word of this.allWords) {
      let accessible = false;
      for (let sense of word.senses) {
        if (sense.accessibility === 0) {
          accessible = true;
          break;
        }
      }
      if (accessible) {
        let levenD: number = Finder.getLevenshteinDistance(
          vernacular,
          word.vernacular
        );
        if (levenD < foundDuplicate[1]) {
          foundDuplicate = [word.id, levenD];
        }
      }
    }

    return foundDuplicate[0];
  }

  isSpelledCorrectly(gloss: string): boolean {
    return this.props.spellChecker.correct(gloss);
  }

  getSpellingSuggestions(gloss: string): string[] {
    return this.props.spellChecker.getSpellingSuggestions(gloss);
  }

  wordToRow(word: Word, senseIndex: number): Row {
    let row: Row = {
      vernacular: word.vernacular,
      glosses: "",
      glossSpelledCorrectly: true,
      id: word.id,
      dupId: "",
      senseIndex: senseIndex
    };
    let glosses: string[] = [];
    word.senses[senseIndex].glosses.forEach(gloss => {
      if (!this.isSpelledCorrectly(gloss.def)) {
        // Temporary. In future, keep track of whether each gloss is spelled correctly
        row.glossSpelledCorrectly = false;
      }
      glosses.push(gloss.def);
    });
    row.glosses = glosses.join(", ");
    return row;
  }

  /** Move the focus to the vernacular textbox */
  focusVernInput() {
    if (this.vernInput.current) this.vernInput.current.focus();
  }

  /** Update a row in the view only */
  updateRow(row: Row, index: number, callback?: Function) {
    let rows = [...this.state.rows];
    rows.splice(index, 1, { ...rows[index], ...row });
    if (callback) this.setState({ rows }, () => callback());
    else this.setState({ rows });
  }

  /** Update an existing word, then update the view */
  async updateWordInFrontAndBack(rowIndex: number) {
    let row = this.state.rows[rowIndex];
    let word = await this.rowToExistingWord(row);
    let updatedWord = await Backend.updateWord(word);
    this.allWords = await Backend.getFrontierWords();

    let glossSpelledCorrectly = this.isSpelledCorrectly(row.glosses);

    let updatedRow: Row = {
      ...row,
      id: updatedWord.id,
      dupId: row.dupId,
      glossSpelledCorrectly: glossSpelledCorrectly
    };

    this.updateRow(updatedRow, rowIndex);
  }

  /** Add the fields in a row to the word it corresponds to in the database */
  async rowToExistingWord(row: Row): Promise<Word> {
    let word = await Backend.getWord(row.id);

    let glosses: Gloss[] = [];
    let gloss: Gloss;
    let defs = row.glosses.split(",");
    console.log(defs);
    for (let def of defs) {
      gloss = {
        language: "en",
        def: def.trim()
      };
      glosses.push(gloss);
    }
    word.senses[row.senseIndex] = {
      glosses,
      semanticDomains: [
        { name: this.props.domain.name, id: this.props.domain.id }
      ]
    };

    word.vernacular = row.vernacular;
    return word;
  }

  /** Remove a word from the backend */
  removeWord(id: string, callback?: Function) {
    Backend.deleteWordById(id)
      .catch(err => console.log(err))
      .then(res => {
        if (callback) callback(res);
      });
  }

  /** Delete a row from the view only */
  // May need to fix
  removeRow(index: number) {
    let rows = [...this.state.rows];
    rows.splice(index, 1);
    this.setState({ rows });
  }

  getWord(id: string): Word {
    let word = this.allWords.find(word => word.id === id);
    if (!word) throw new Error("No word exists with this id");
    return word;
  }

  // Fix
  toggleDuplicateVernacularView(rowIndex: number) {
    let row: Row = this.state.rows[rowIndex];
    let dupWord: Word = this.getWord(row.dupId);
    row.dupVernacular = dupWord.vernacular;
    row.dupGlosses = [];
    for (let sense of dupWord.senses) {
      let glosses = [];
      for (let gloss of sense.glosses) {
        glosses.push(gloss.def);
      }
      row.dupGlosses.push(glosses.join(", "));
    }

    let newRow: Row = {
      ...row,
      showDuplicate: !row.showDuplicate
    };

    this.updateRow(newRow, rowIndex);
  }

  // Fix
  displayDuplicates(row: Row, rowIndex: number) {
    return (
      <Grid
        item
        xs={12}
        key={"d" + rowIndex}
        style={{ background: "whitesmoke" }}
      >
        <Grid container>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">
              {"Duplicate in database: " + row.dupVernacular}
            </Typography>
          </Grid>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">{"Glosses: "}</Typography>
            {row.dupGlosses &&
              row.dupGlosses.map((gloss, senseIndex) => (
                <Chip
                  label={gloss}
                  onClick={() =>
                    this.switchToExistingWord(rowIndex, senseIndex)
                  }
                  style={{
                    margin: 4
                  }}
                />
              ))}
            {/* <Chip
              variant="outlined"
              label={"Add New Sense +"}
              onClick={() =>
                this.switchToExistingWord(
                  rowIndex,
                  row.dupGlosses ? row.dupGlosses.length : 0
                )
              }
              style={{
                margin: 4
              }}
            /> */}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  toggleSpellingSuggestionsView(rowIndex: number) {
    let row: Row = this.state.rows[rowIndex];
    let newRow: Row = {
      ...row,
      showMispelled: !row.showMispelled
    };
    this.updateRow(newRow, rowIndex);
  }

  displaySpellingSuggestions(row: Row, rowIndex: number) {
    let spellingSuggestions = this.getSpellingSuggestions(
      this.state.rows[rowIndex].glosses
    );
    return (
      <Grid
        item
        xs={12}
        key={"mispelled" + rowIndex}
        style={{ background: "whitesmoke" }}
      >
        <Grid container>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">
              {"Mispelled gloss: " + row.glosses}
            </Typography>
          </Grid>
          <Grid
            item
            xs={5}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            <Typography variant="body1">{"Suggestions: "}</Typography>
            {spellingSuggestions.length > 0 ? (
              spellingSuggestions.map(suggestion => (
                <Chip
                  label={suggestion}
                  onClick={() =>
                    this.chooseSpellingSuggestion(rowIndex, suggestion)
                  }
                  style={{
                    margin: 4
                  }}
                />
              ))
            ) : (
              <Typography variant="body1">
                {"No suggestions available"}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Grid>
    );
  }

  chooseSpellingSuggestion(rowIndex: number, suggestion: string) {
    let row: Row = this.state.rows[rowIndex];
    row.glosses = suggestion;
    this.updateWordInFrontAndBack(rowIndex)
      .catch((err: string) => console.log(err))
      .then(() => {
        console.log("Updated word");
      });
  }

  /** Switch a row to edit a sense of a word in the database */
  switchToExistingWord(rowIndex: number, senseIndex: number) {
    let row: Row = this.state.rows[rowIndex];
    if (row.dupId === "") {
      throw new Error("This row does not have a duplicate");
    } else {
      Backend.deleteWordById(row.id)
        .catch(err => console.log(err))
        .then(() => {
          if (row.dupVernacular && row.dupGlosses) {
            let newRow: Row = {
              vernacular: row.dupVernacular,
              glosses: row.dupGlosses[senseIndex]
                ? row.dupGlosses[senseIndex]
                : row.glosses,
              dupId: "",
              glossSpelledCorrectly: true,
              id: row.dupId,
              senseIndex: senseIndex
            };

            this.updateRow(newRow, rowIndex);
          }
        });
    }
  }

  // /** Update the state */
  // updateState(row: Row, index: number) {
  //   let rows = [...this.state.rows];
  //   rows.splice(index, 1, { ...rows[index], ...row });
  //   this.setState({ rows });
  // }

  /** Move the focus to the gloss textbox */
  focusGlossInput() {
    if (this.glossInput.current) this.glossInput.current.focus();
  }

  render() {
    return (
      <form onSubmit={e => this.submit(e)}>
        <input type="submit" style={{ display: "none" }} />

        {/* Table titles */}
        <Grid container spacing={3}>
          <Grid item xs={5}>
            <Typography
              variant="h5"
              align="center"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="addWords.vernacular" />
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Typography
              variant="h5"
              align="center"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="addWords.glosses" />
            </Typography>
          </Grid>

          {/* Rows of words */}
          {this.state.rows.map((row, rowIndex, array) => (
            <React.Fragment>
              {rowIndex === array.length - 1 ? (
                <React.Fragment>
                  <Grid item xs={12}>
                    <Grid container>
                      <NewVernEntry
                        row={row}
                        rowIndex={rowIndex}
                        vernInput={this.vernInput}
                        vernInFrontier={this.vernInFrontier}
                        updateRow={this.updateRow}
                        focusGlossInput={this.focusGlossInput}
                        toggleDuplicateVernacularView={
                          this.toggleDuplicateVernacularView
                        }
                        translate={this.props.translate}
                      />
                      <NewGlossEntry
                        row={row}
                        rowIndex={rowIndex}
                        glossInput={this.glossInput}
                        isSpelledCorrectly={this.isSpelledCorrectly}
                        updateRow={this.updateRow}
                        focusVernInput={this.focusVernInput}
                        toggleSpellingSuggestionsView={
                          this.toggleSpellingSuggestionsView
                        }
                        translate={this.props.translate}
                      />
                    </Grid>
                  </Grid>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Grid container>
                    <Grid
                      item
                      xs={12}
                      key={rowIndex}
                      onMouseEnter={() => {
                        this.setState({ hoverIndex: rowIndex });
                      }}
                      onMouseLeave={() => {
                        this.setState({ hoverIndex: undefined });
                      }}
                    >
                      <ExistingVernEntry
                        row={row}
                        rowIndex={rowIndex}
                        vernInFrontier={this.vernInFrontier}
                        updateRow={this.updateRow}
                        updateWordInFrontAndBack={this.updateWordInFrontAndBack}
                        focusVernInput={this.focusVernInput}
                        toggleDuplicateVernacularView={
                          this.toggleDuplicateVernacularView
                        }
                        translate={this.props.translate}
                      />
                      <ExistingGlossEntry
                        row={row}
                        rowIndex={rowIndex}
                        isSpelledCorrectly={this.isSpelledCorrectly}
                        updateRow={this.updateRow}
                        updateWordInFrontAndBack={this.updateWordInFrontAndBack}
                        focusVernInput={this.focusVernInput}
                        toggleSpellingSuggestionsView={
                          this.toggleSpellingSuggestionsView
                        }
                        translate={this.props.translate}
                      />

                      <Grid item xs={2}>
                        {this.state.hoverIndex === rowIndex && <DeleteRow />}
                      </Grid>
                    </Grid>
                  </Grid>
                </React.Fragment>
              )}
              {/* This is where it shows the duplicate if the red dot is clicked */}
              {this.state.rows[rowIndex].showDuplicate &&
                row.dupId &&
                this.displayDuplicates(row, rowIndex)}
              {/* This is where it shows spelling suggestions if the red dot is clicked */}
              {this.state.rows[rowIndex].showMispelled &&
                !row.glossSpelledCorrectly &&
                this.displaySpellingSuggestions(row, rowIndex)}
            </React.Fragment>
          ))}
        </Grid>

        {/* Submit button */}
        <Grid container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: theme.spacing(2) }}
            >
              <Translate id="addWords.next" />
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}

export default withLocalize(DataEntryTable);
