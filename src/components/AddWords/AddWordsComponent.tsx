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
import { Word, State } from "../../types/word";
import { Delete } from "@material-ui/icons";
import * as Backend from "../../backend";

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
  /** The vernacular of the duplicate word in the frontier */
  dupVernacular?: string;
  /** The `def` field of the glosses of the duplicate word in the frontier */
  dupGlosses?: string[];

  duplicate?: Boolean;
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
        {
          vernacular: "sam",
          glosses: "boy",
          id: "5d2501f2188d610ef03a42f2",
          duplicate: true,
          dupId: "5d250046188d610ef03a42ed"
        }
      ],
      newVernInFrontier: false
    };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  allWords: Word[] = [];

  async componentDidMount() {
    this.allWords = await Backend.getFrontierWords();
  }

  /** If the venacular is in the frontier, returns that words id */
  vernInFrontier(vernacular: string): string {
    for (let word of this.allWords) {
      if (word.vernacular === vernacular) {
        //TODO: check accessability
        return word.id;
      }
    }
    return "";
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
      this.rowToWord({ vernacular, glosses, id: "", dupId: "" })
    )
      .catch(err => console.log(err))
      .then(res => {
        let word = res as Word;
        let dupId = this.vernInFrontier(word.vernacular);
        rows.push({ ...this.wordToRow(word), dupId });
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

  /** updates a row in the view only */
  updateRow(row: Row, index: number) {
    let rows = [...this.state.rows];
    rows.splice(index, 1, { ...rows[index], ...row });
    this.setState({ rows });
  }

  /** updates the word in the backend */
  updateWord(index: number, callback?: Function) {
    let row = this.state.rows[index];
    Backend.updateWord(this.rowToWord(row))
      .catch(err => console.log(err))
      .then(res => {
        this.updateRow(this.wordToRow(res as Word), index);
        if (callback) callback();
      });
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

  rowToWord(row: Row): Word {
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

  wordToRow(word: Word): Row {
    let row: Row = {
      vernacular: word.vernacular,
      id: word.id,
      glosses: "",
      dupId: ""
    };
    let glosses: string[] = [];
    word.senses[0].glosses.forEach(gloss => {
      glosses.push(gloss.def);
    });
    row.glosses = glosses.join(",");
    return row;
  }

  getWord(id: string): Word {
    let word = this.allWords.find(word => word.id === id);
    if (!word) throw "No word exists with this id";
    return word;
  }

  mergeRow(index: number) {
    if (index >= this.state.rows.length) {
      console.log("That row does not exist");
      return;
    }
    let row: Row = { ...this.state.rows[index] };
    if (!row.dupId) {
      console.log("No duplicate for this row");
      return;
    }
    let originalWord = this.getWord(row.dupId);
    let newRow: Row = {
      ...row,
      ...this.wordToRow(originalWord),
      duplicate: false,
      dupId: ""
    };
    //this.removeWord(index);
    this.updateRow(newRow, index);
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
              {this.state.rows.map((row, index) => {
                return (
                  <React.Fragment>
                    <Grid
                      item
                      xs={12}
                      key={index}
                      onMouseEnter={() => this.setState({ hoverRow: index })}
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
                              this.updateRow(
                                {
                                  ...row,
                                  vernacular: e.target.value,
                                  dupId
                                },
                                index
                              );
                            }}
                            onBlur={() => {
                              this.updateWord(index);
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
                                onClick={() => this.showDuplicateForRow(index)}
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
                                index
                              );
                            }}
                            onBlur={() => {
                              this.updateWord(index);
                            }}
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                this.focusVernInput();
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          {this.state.hoverRow === index && (
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
                                      this.removeRow(index)
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
                    {this.state.showDuplicate === index && row.dupId && (
                      <Grid
                        item
                        xs={12}
                        key={index}
                        onMouseEnter={() => this.setState({ hoverRow: index })}
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
                              row.dupGlosses.map((gloss, index) => (
                                <Chip
                                  label={gloss}
                                  onClick={() => console.log("Edit gloss")}
                                  style={{
                                    margin: theme.spacing(1)
                                  }}
                                />
                              ))}
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
