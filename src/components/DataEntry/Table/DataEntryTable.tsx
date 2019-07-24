import React from "react";
import {
  Typography,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  Button
} from "@material-ui/core";
import theme from "../../../types/theme";

import { Translate, TranslateFunction } from "react-localize-redux";
import { Word, SemanticDomain, State, Gloss } from "../../../types/word";
import { Delete } from "@material-ui/icons";
import * as Backend from "../../../backend";
import DuplicateFinder from "../../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";
import DomainTree from "../../TreeView/SemanticDomain";
import SpellChecker from "./spellChecker";

interface DataEntryTableProps {
  domain: DomainTree;
  translate: TranslateFunction;
  spellChecker: SpellChecker;
}

interface DataEntryState {
  rows: Row[];
  newVern: string;
  newGloss: string;
  hoverRow?: number;
  newVernInFrontier: Boolean; // does the new word already exist in the frontier?
  glossSpelledCorrectly: boolean;
  showDuplicate?: number;
}

/** A row in the view */
interface Row {
  id: string;
  /** The ID of the duplicate word in the frontier */
  dupId: string;
  glossSpelledCorrectly: boolean;
  vernacular: string;
  glosses: string;
  /** The index of the sense of the word that we're showing in the view */
  senseIndex: number;
  /** The vernacular of the duplicate word in the frontier */
  dupVernacular?: string;
  /** The `def` field of the glosses of the duplicate word in the frontier */
  dupGlosses?: string[];
}

export class DataEntryTable extends React.Component<
  DataEntryTableProps,
  DataEntryState
> {
  constructor(props: DataEntryTableProps) {
    super(props);
    this.state = {
      newVern: "",
      newGloss: "",
      rows: [],
      newVernInFrontier: false,
      glossSpelledCorrectly: true
    };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  allWords: Word[] = [];
  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;
  semanticDomain: SemanticDomain = { name: "Sky", id: "1.2" };

  async componentDidMount() {
    this.allWords = await Backend.getFrontierWords();
  }

  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();

    const vernacular = this.state.newVern;
    const glosses = this.state.newGloss;
    const glossSpelledCorrectly = this.state.glossSpelledCorrectly;

    if (vernacular === "") return;

    let rows = [...this.state.rows];
    Backend.createWord(
      this.rowToNewWord({
        vernacular,
        glosses,
        id: "",
        dupId: "",
        glossSpelledCorrectly,
        senseIndex: 0
      })
    )
      .catch(err => console.log(err))
      .then(res => {
        let word = res as Word;
        let dupId = this.vernInFrontier(word.vernacular);
        rows.push({ ...this.wordToRow(word, 0), dupId });
        this.setState({
          rows,
          newVern: "",
          newGloss: "",
          newVernInFrontier: false
        });
        this.focusVernInput();
        if (callback) callback(res);
      });
  }

  /** Return a new word based on a row */
  rowToNewWord(row: Row): Word {
    let word: Word = {
      id: row.id,
      vernacular: "",
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
    word.vernacular = row.vernacular;

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

  wordToRow(word: Word, senseIndex: number): Row {
    let row: Row = {
      vernacular: word.vernacular,
      id: word.id,
      glosses: "",
      dupId: "",
      glossSpelledCorrectly: true,
      senseIndex
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

  /** Update the word in the backend */
  updateWord(index: number, callback?: Function) {
    let row = this.state.rows[index];
    this.rowToExistingWord(row)
      .catch(err => console.log(err))
      .then(res =>
        Backend.updateWord(res as Word)
          .catch(err => console.log(err))
          .then(res => {
            this.updateRow(this.wordToRow(res as Word, row.senseIndex), index);
            if (callback) callback();
          })
      );
  }

  /** Add the fields in a row to the word it corresponds to in the database */
  async rowToExistingWord(row: Row): Promise<Word> {
    let word = await Backend.getWord(row.id);

    let glosses: Gloss[] = [];
    let gloss: Gloss;
    let defs = row.glosses.split(",");
    for (let def of defs) {
      gloss = {
        language: "en",
        def: def.trim()
      };
      glosses.push(gloss);
    }
    word.senses[row.senseIndex] = {
      glosses,
      semanticDomains: [this.semanticDomain]
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

  showDuplicateForRow(rowIndex: number) {
    let row = this.state.rows[rowIndex];
    let dupWord = this.getWord(row.dupId);
    row.dupVernacular = dupWord.vernacular;
    row.dupGlosses = [];
    for (let sense of dupWord.senses) {
      let glosses = [];
      for (let gloss of sense.glosses) {
        glosses.push(gloss.def);
      }
      row.dupGlosses.push(glosses.join(", "));
    }
    this.updateRow(row, rowIndex);
    this.setState({ showDuplicate: rowIndex });
  }

  /** Switch a row to edit a sense of a word in the database */
  switchToExistingWord(rowIndex: number, senseIndex: number) {
    let row = this.state.rows[rowIndex];
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
              id: row.dupId,
              dupId: "",
              glossSpelledCorrectly: true,
              senseIndex
            };
            this.updateRow(newRow, rowIndex, () => this.updateWord(rowIndex));
          }
        });
    }
  }

  // Used by new word input
  /** Update the state to match the value in a textbox */
  updateField<K extends keyof DataEntryState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K,
    callback?: () => void
  ) {
    const value = e.target.value;

    this.setState(
      {
        [field]: value
      } as Pick<DataEntryState, K>,
      callback
    );
  }

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
          {this.state.rows.map((row, rowIndex) => {
            return (
              <React.Fragment>
                <Grid
                  item
                  xs={12}
                  key={rowIndex}
                  onMouseEnter={() => this.setState({ hoverRow: rowIndex })}
                  onMouseLeave={() => this.setState({ hoverRow: undefined })}
                >
                  <Grid container>
                    {/* Vernacular entry */}
                    <Grid
                      item
                      xs={5}
                      style={{
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2),
                        position: "relative"
                      }}
                    >
                      <TextField
                        fullWidth
                        value={row.vernacular}
                        onChange={e => {
                          let dupId = this.vernInFrontier(e.target.value);
                          if (dupId === row.id) dupId = ""; // the "duplicate" is the word we're already editing
                          this.updateRow(
                            {
                              ...row,
                              vernacular: e.target.value,
                              dupId
                            },
                            rowIndex
                          );
                        }}
                        onBlur={() => {
                          this.updateWord(rowIndex);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            this.focusVernInput();
                          }
                        }}
                      />
                      {row.dupId !== "" && (
                        <Tooltip
                          title={
                            this.props.translate(
                              "addWords.wordInDatabase"
                            ) as string
                          }
                          placement="top"
                        >
                          <div
                            style={{
                              height: "5px",
                              width: "5px",
                              border: "2px solid red",
                              borderRadius: "50%",
                              position: "absolute",
                              top: 8,
                              right: 48,
                              cursor: "pointer"
                            }}
                            onClick={() => this.showDuplicateForRow(rowIndex)}
                          />
                        </Tooltip>
                      )}
                    </Grid>

                    {/* Gloss entry */}
                    <Grid
                      item
                      xs={5}
                      style={{
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2)
                      }}
                    >
                      <TextField
                        fullWidth
                        value={row.glosses}
                        onChange={e => {
                          const isSpelledCorrectly = this.isSpelledCorrectly(
                            e.target.value
                          );
                          this.updateRow(
                            {
                              ...row,
                              glosses: e.target.value,
                              glossSpelledCorrectly: isSpelledCorrectly
                            },
                            rowIndex
                          );
                        }}
                        onBlur={() => {
                          this.updateWord(rowIndex);
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            this.focusVernInput();
                          }
                        }}
                        InputProps={
                          !row.glossSpelledCorrectly
                            ? {
                                style: {
                                  color: "red"
                                }
                              }
                            : {
                                style: {
                                  color: "black"
                                }
                              }
                        }
                      />
                    </Grid>
                    <Grid item xs={2}>
                      {this.state.hoverRow === rowIndex && (
                        <React.Fragment>
                          <Tooltip
                            title={
                              this.props.translate(
                                "addWords.deleteRow"
                              ) as string
                            }
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                this.removeWord(row.id, () =>
                                  this.removeRow(rowIndex)
                                )
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </React.Fragment>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                {/* This is where it shows the duplicate if the red dot is clicked */}
                {this.state.showDuplicate === rowIndex && row.dupId && (
                  <Grid
                    item
                    xs={12}
                    key={"d" + rowIndex}
                    onMouseEnter={() => this.setState({ hoverRow: rowIndex })}
                    onMouseLeave={() => this.setState({ hoverRow: undefined })}
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
                        <Chip
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
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </React.Fragment>
            );
          })}

          {/* New word entry */}
          <React.Fragment>
            <Grid item xs={12}>
              <Grid container>
                {/* Vernacular new word entry */}
                <Grid
                  item
                  xs={5}
                  style={{
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                    position: "relative"
                  }}
                >
                  <TextField
                    autoFocus
                    label={<Translate id="addWords.vernacular" />}
                    fullWidth
                    variant="outlined"
                    value={this.state.newVern}
                    onChange={e => {
                      this.updateField(e, "newVern", () =>
                        this.setState({
                          newVernInFrontier:
                            this.vernInFrontier(this.state.newVern) !== ""
                        })
                      );
                    }}
                    inputRef={this.vernInput}
                    // Move the focus to the next box when the right arrow key is pressed
                    onKeyDown={e => {
                      if (
                        e.key === "ArrowRight" &&
                        (e.target as HTMLInputElement).selectionStart ===
                          this.state.newVern.length
                      )
                        this.focusGlossInput();
                    }}
                  />
                  {this.state.newVernInFrontier && (
                    <Tooltip
                      title={
                        this.props.translate(
                          "addWords.wordInDatabase"
                        ) as string
                      }
                      placement="top"
                    >
                      <div
                        style={{
                          height: "5px",
                          width: "5px",
                          border: "2px solid red",
                          borderRadius: "50%",
                          position: "absolute",
                          top: 24,
                          right: 48,
                          cursor: "pointer"
                        }}
                      />
                    </Tooltip>
                  )}
                </Grid>

                {/* Gloss new word entry */}
                <Grid
                  item
                  xs={5}
                  style={{
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2)
                  }}
                >
                  <TextField
                    label={<Translate id="addWords.glosses" />}
                    fullWidth
                    variant="outlined"
                    value={this.state.newGloss}
                    onChange={e => {
                      const isSpelledCorrectly = this.isSpelledCorrectly(
                        e.target.value
                        // this.state.newGloss
                      );
                      this.updateField(e, "newGloss", () =>
                        this.setState({
                          glossSpelledCorrectly: isSpelledCorrectly
                        })
                      );
                    }}
                    inputRef={this.glossInput}
                    // Move the focus to the previous box when the left arrow key is pressed
                    onKeyDown={e => {
                      if (
                        e.key === "ArrowLeft" &&
                        (e.target as HTMLInputElement).selectionStart === 0
                      )
                        this.focusVernInput();
                    }}
                    InputProps={
                      !this.state.glossSpelledCorrectly
                        ? {
                            style: {
                              color: "red"
                            }
                          }
                        : {
                            style: {
                              color: "black"
                            }
                          }
                    }
                  />
                </Grid>
              </Grid>
            </Grid>
          </React.Fragment>
        </Grid>
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
