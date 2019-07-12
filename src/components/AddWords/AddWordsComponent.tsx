import React from "react";
import {
  Paper,
  Typography,
  Container,
  TextField,
  Grid,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Chip
} from "@material-ui/core";
import theme from "../../types/theme";
import { Translate, TranslateFunction } from "react-localize-redux";
import { Word, State, Gloss } from "../../types/word";
import { Delete } from "@material-ui/icons";
import * as Backend from "../../backend";
import { SemanticDomain } from "../../types/project";
import DuplicateFinder from "../../goals/MergeDupGoal/DuplicateFinder/DuplicateFinder";

interface AddWordsProps {
  domain: string;
  translate: TranslateFunction;
}

interface AddWordsState {
  rows: Row[];
  newVern: string;
  newGloss: string;
  hoverRow?: number;
  newVernInFrontier: Boolean; // does the new word already exist in the frontier?
  showDuplicate?: number;
}

/** A row in the view */
interface Row {
  id: string;
  /** The ID of the duplicate word in the frontier */
  dupId: string;
  vernacular: string;
  glosses: string;
  /** The index of the sense of the word that we're showing in the view */
  senseIndex: number;
  /** The vernacular of the duplicate word in the frontier */
  dupVernacular?: string;
  /** The `def` field of the glosses of the duplicate word in the frontier */
  dupGlosses?: string[];
}

export default class AddWords extends React.Component<
  AddWordsProps,
  AddWordsState
> {
  constructor(props: AddWordsProps) {
    super(props);
    this.state = {
      newVern: "",
      newGloss: "",
      rows: [
        // {
        //   vernacular: "sam",
        //   glosses: "boy",
        //   id: "5d2501f2188d610ef03a42f2",
        //   dupId: "5d250046188d610ef03a42ed",
        //   senseIndex: 0
        // }
      ],
      newVernInFrontier: false
    };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  allWords: Word[] = [];
  semanticDomain: SemanticDomain = { name: "Sky", number: "1.2" };

  async componentDidMount() {
    this.allWords = await Backend.getFrontierWords();
  }

  /** If the venacular is in the frontier, returns that words id */
  vernInFrontier(vernacular: string): string {
    let Finder = new DuplicateFinder();

    //[vernacular form, levenshtein distance]
    let foundDuplicate: [string, number] = ["", 2];

    for (let word of this.allWords) {
      //TODO: check accessability
      let levenD: number = Finder.getLevenshteinDistance(
        vernacular,
        word.vernacular
      );
      if (levenD < foundDuplicate[1]) {
        foundDuplicate = [word.id, levenD];
      }
    }

    return foundDuplicate[0];
  }

  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;

  submit(e?: React.FormEvent<HTMLFormElement>, callback?: Function) {
    if (e) e.preventDefault();

    const vernacular = this.state.newVern;
    const glosses = this.state.newGloss;

    if (vernacular === "") return;

    let rows = [...this.state.rows];
    Backend.createWord(
      this.rowToNewWord({
        vernacular,
        glosses,
        id: "",
        dupId: "",
        senseIndex: 0
      })
    )
      .catch(err => console.log(err))
      .then(res => {
        debugger;
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

  /** Creates a new word from a row */
  rowToNewWord(row: Row): Word {
    let word: Word = {
      id: row.id,
      vernacular: "",
      senses: [
        {
          glosses: [],
          semanticDomains: []
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

    word.senses[0].glosses = [];
    let defs = row.glosses.split(",");
    for (let def of defs) {
      let gloss = {
        language: "en",
        def: def.trim()
      };
      word.senses[0].glosses.push(gloss);
    }

    return word;
  }

  /** updates a row in the view only */
  updateRow(row: Row, index: number) {
    console.log(row);
    let rows = [...this.state.rows];
    rows.splice(index, 1, { ...rows[index], ...row });
    this.setState({ rows });
  }

  /** updates the word in the backend */
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

  /** Adds the fields in a row to the word it corresponds to in the database */
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

  // Used by new word input
  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof AddWordsState>(
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
      } as Pick<AddWordsState, K>,
      callback
    );
  }

  /** Moves the focus to the vernacular textbox */
  focusVernInput() {
    if (this.vernInput.current) this.vernInput.current.focus();
  }

  /** Moves the focus to the gloss textbox */
  focusGlossInput() {
    if (this.glossInput.current) this.glossInput.current.focus();
  }

  /** Removes a word from the backend */
  removeWord(id: string, callback?: Function) {
    Backend.deleteWordById(id)
      .catch(err => console.log(err))
      .then(res => {
        if (callback) callback(res);
      });
  }

  /** deletes a row from the view only */
  removeRow(index: number) {
    let rows = [...this.state.rows];
    rows.splice(index, 1);
    this.setState({ rows });
  }

  wordToRow(word: Word, senseIndex: number): Row {
    let row: Row = {
      vernacular: word.vernacular,
      id: word.id,
      glosses: "",
      dupId: "",
      senseIndex
    };
    let glosses: string[] = [];
    word.senses[senseIndex].glosses.forEach(gloss => {
      glosses.push(gloss.def);
    });
    row.glosses = glosses.join(", ");
    return row;
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

  /** TODO: change the name of this method */
  editASenseOfAnExistingWordInsteadOfUsingThisWord(
    rowIndex: number,
    senseIndex: number
  ) {
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
              glosses: row.dupGlosses[senseIndex],
              id: row.dupId,
              dupId: "",
              senseIndex
            };
            this.updateRow(newRow, rowIndex);
          }
        });
    }
  }

  render() {
    return (
      <Container>
        <Paper
          style={{
            padding: theme.spacing(2),
            maxWidth: 800,
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          <Typography
            variant="h4"
            align="center"
            style={{ marginBottom: theme.spacing(2) }}
          >
            <Translate id="addWords.domain" />: Sky
          </Typography>
          <Divider />
          <form onSubmit={e => this.submit(e)}>
            <input type="submit" style={{ display: "none" }} />

            {/* Table title */}
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
                      onMouseLeave={() =>
                        this.setState({ hoverRow: undefined })
                      }
                    >
                      <Grid container>
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
                                onClick={() =>
                                  this.showDuplicateForRow(rowIndex)
                                }
                              />
                            </Tooltip>
                          )}
                        </Grid>
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
                              this.updateRow(
                                { ...row, glosses: e.target.value },
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
                        key={rowIndex}
                        onMouseEnter={() =>
                          this.setState({ hoverRow: rowIndex })
                        }
                        onMouseLeave={() =>
                          this.setState({ hoverRow: undefined })
                        }
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
                            <Typography variant="body1">
                              {"Glosses: "}
                            </Typography>
                            {row.dupGlosses &&
                              row.dupGlosses.map((gloss, senseIndex) => (
                                <Chip
                                  label={gloss}
                                  onClick={() =>
                                    this.editASenseOfAnExistingWordInsteadOfUsingThisWord(
                                      rowIndex,
                                      senseIndex
                                    )
                                  }
                                  style={{
                                    margin: theme.spacing(1)
                                  }}
                                />
                              ))}
                            <Chip
                              variant="outlined"
                              label={"Add New Sense +"}
                              onClick={() =>
                                this.editASenseOfAnExistingWordInsteadOfUsingThisWord(
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
                          this.updateField(e, "newGloss");
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
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </React.Fragment>
            </Grid>
          </form>
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
        </Paper>
      </Container>
    );
  }
}
