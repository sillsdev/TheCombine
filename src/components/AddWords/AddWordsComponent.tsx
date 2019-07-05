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
  Tooltip
} from "@material-ui/core";
import theme from "../../types/theme";
import {
  LocalizeContextProps,
  Translate,
  TranslateFunction
} from "react-localize-redux";
import { Word, State } from "../../types/word";
import { Edit, Delete, RemoveFromQueueTwoTone } from "@material-ui/icons";
import * as Backend from "../../backend";

interface AddWordsProps {
  domain: string;
  translate: TranslateFunction;
}

interface AddWordsState {
  rows: Row[];
  editing?: number;
  newVern: string;
  newGloss: string;
  hoverRow?: number;
  editWord?: number;
}

/** The data from the `Word` type that the view uses */
interface Row {
  vernacular: string;
  glosses: string;
  id: string;
}

export default class AddWords extends React.Component<
  AddWordsProps & LocalizeContextProps,
  AddWordsState
> {
  constructor(props: AddWordsProps & LocalizeContextProps) {
    super(props);
    this.state = {
      newVern: "",
      newGloss: "",
      rows: []
    };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;

  submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const vernacular = this.state.newVern;
    const glosses = this.state.newGloss;

    if (vernacular === "") return;

    let rows = [...this.state.rows];

    Backend.createWord(this.rowToWord({ vernacular, glosses, id: "" }))
      .catch(err => console.log(err))
      .then(res => {
        rows.push(this.wordToRow(res as Word));
        this.setState({ rows: rows, newVern: "", newGloss: "" });
        this.focusVernInput();
      });
  }

  /** updates the view only */
  updateRow(row: Row, index: number) {
    let words = [...this.state.rows];
    words.splice(index, 1, row);
    this.setState({ rows: words });
  }

  /** updates the word in the backend */
  updateWord(index: number) {
    let row = this.state.rows[index];
    Backend.updateWord(this.rowToWord(row))
      .catch(err => console.log(err))
      .then(res => this.updateRow(this.wordToRow(res as Word), index));
  }

  // Used by new word input
  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof AddWordsState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ) {
    const value = e.target.value;

    this.setState({
      [field]: value
    } as Pick<AddWordsState, K>);
  }

  /** Moves the focus to the vernacular textbox */
  focusVernInput() {
    if (this.vernInput.current) this.vernInput.current.focus();
  }

  /** Moves the focus to the gloss textbox */
  focusGlossInput() {
    if (this.glossInput.current) this.glossInput.current.focus();
  }

  removeWord(index: number) {
    console.log(this.rowToWord(this.state.rows[index]));
    Backend.deleteWord(this.rowToWord(this.state.rows[index]))
      .catch(err => console.log(err))
      .then(res => {
        this.removeRow(index);
      });
  }

  removeRow(index: number) {
    let rows = [...this.state.rows];
    rows.splice(index, 1);
    this.setState({ rows });
  }

  async uploadWords() {
    let word: Word = {
      id: "",
      vernacular: "",
      senses: [
        {
          glosses: [
            {
              language: "",
              def: ""
            }
          ],
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

    for (let row of this.state.rows) {
      word.vernacular = row.vernacular;

      word.senses[0].glosses = [];
      let defs = row.glosses.split(",");
      for (let def of defs) {
        let gloss = {
          language: "",
          def
        };
        word.senses[0].glosses.push(gloss);
      }

      await Backend.createWord(word); // TODO: catch errors
    }
  }

  rowToWord(row: Row): Word {
    let word: Word = {
      id: row.id,
      vernacular: "",
      senses: [
        {
          glosses: [
            {
              language: "",
              def: ""
            }
          ],
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
        language: "",
        def
      };
      word.senses[0].glosses.push(gloss);
    }

    return word;
  }

  wordToRow(word: Word): Row {
    let row: Row = { vernacular: word.vernacular, id: word.id, glosses: "" };
    let glosses: string[] = [];
    word.senses[0].glosses.forEach(gloss => {
      glosses.push(gloss.def);
    });
    row.glosses = glosses.join(",");
    return row;
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
                return this.state.editWord === index ? (
                  "ok"
                ) : (
                  <Grid
                    item
                    xs={12}
                    key={index}
                    onMouseEnter={() => this.setState({ hoverRow: index })}
                    onMouseLeave={() => this.setState({ hoverRow: undefined })}
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
                        <TextField
                          fullWidth
                          value={row.vernacular}
                          onChange={e => {
                            this.updateRow(
                              { ...row, vernacular: e.target.value },
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
                                onClick={() => this.removeWord(index)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </React.Fragment>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
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
                        paddingRight: theme.spacing(2)
                      }}
                    >
                      <TextField
                        autoFocus
                        label={<Translate id="addWords.vernacular" />}
                        fullWidth
                        variant="outlined"
                        value={this.state.newVern}
                        onChange={e => {
                          this.updateField(e, "newVern");
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
                onClick={() => this.uploadWords()}
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
