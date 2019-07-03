import React from "react";
import {
  Paper,
  Typography,
  Container,
  TextField,
  Grid,
  Divider,
  Button,
  IconButton
} from "@material-ui/core";
import theme from "../../types/theme";
import { LocalizeContextProps } from "react-localize-redux";
import { Word, State } from "../../types/word";
import { Edit, Delete } from "@material-ui/icons";

let testdata: Word[] = [
  {
    id: "",
    vernacular: "nihao",
    senses: [
      {
        glosses: [
          {
            language: "",
            def: "hello"
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
  },
  {
    id: "",
    vernacular: "tianqi",
    senses: [
      {
        glosses: [
          {
            language: "",
            def: "weather"
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
  },
  {
    id: "",
    vernacular: "yun",
    senses: [
      {
        glosses: [
          {
            language: "",
            def: "cloud"
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
  }
];

interface AddWordsProps {
  domain: string;
}

interface AddWordsState {
  words: Word[];
  editing?: number;
  newVern: string;
  newGloss: string;
  hoverRow?: number;
  editWord?: number;
}

export default class AddWords extends React.Component<
  AddWordsProps & LocalizeContextProps,
  AddWordsState
> {
  constructor(props: AddWordsProps & LocalizeContextProps) {
    super(props);
    this.state = { words: testdata, newVern: "", newGloss: "" };
    this.vernInput = React.createRef<HTMLDivElement>();
    this.glossInput = React.createRef<HTMLDivElement>();
  }

  vernInput: React.RefObject<HTMLDivElement>;
  glossInput: React.RefObject<HTMLDivElement>;

  submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const vernacular = this.state.newVern;
    const gloss = this.state.newGloss;

    if (vernacular === "") return;

    let word: Word = {
      id: "",
      vernacular: vernacular,
      senses: [
        {
          glosses: [
            {
              language: "",
              def: gloss
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
    let words = JSON.parse(JSON.stringify(this.state.words));
    words.push(word);
    this.setState({ words, newVern: "", newGloss: "" });

    this.focusVernInput();
  }

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
    let words = JSON.parse(JSON.stringify(this.state.words));
    words.splice(index, 1);
    this.setState({ words });
  }

  render() {
    let rows = [];
    for (const word of this.state.words) {
      rows.push(
        <React.Fragment>
          <Grid
            item
            xs={6}
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2)
            }}
          >
            {word.vernacular}
          </Grid>
        </React.Fragment>
      );
    }

    return (
      <Container>
        <Paper
          style={{
            padding: theme.spacing(2),
            width: 600,
            marginLeft: "auto",
            marginRight: "auto"
          }}
        >
          <Typography
            variant="h4"
            align="center"
            style={{ marginBottom: theme.spacing(2) }}
          >
            Domain: Sky
          </Typography>
          <Divider />
          <form onSubmit={e => this.submit(e)}>
            <input type="submit" style={{ display: "none" }} />
            <Grid container spacing={3}>
              {/* Table title */}
              <Grid item xs={5}>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ marginTop: theme.spacing(2) }}
                >
                  Vernacular
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ marginTop: theme.spacing(2) }}
                >
                  Gloss
                </Typography>
              </Grid>

              {/* Rows of words */}
              {this.state.words.map((word, index) => {
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
                          paddingLeft: theme.spacing(3),
                          paddingRight: theme.spacing(2)
                        }}
                      >
                        <Typography variant="body1" contentEditable>
                          {word.vernacular}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        xs={5}
                        style={{
                          paddingLeft: theme.spacing(3),
                          paddingRight: theme.spacing(2)
                        }}
                      >
                        <Typography variant="body1" contentEditable>
                          {word.senses[0].glosses[0].def}
                        </Typography>
                      </Grid>
                      <Grid item xs={2} style={{ position: "relative" }}>
                        {this.state.hoverRow === index && (
                          <React.Fragment>
                            <IconButton
                              size="small"
                              style={{ position: "absolute" }}
                              onClick={() => this.setState({ editWord: index })}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              style={{ position: "absolute", left: 32 }}
                              onClick={() => this.removeWord(index)}
                            >
                              <Delete />
                            </IconButton>
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
                        label={"Vernacular"}
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
                        label={"Gloss"}
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
                Next
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }
}
