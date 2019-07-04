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
import { Edit, Delete } from "@material-ui/icons";
import * as Backend from "../../backend";

let testdata = [["yun", "cloud"], ["tian", "sky"], ["taiyang", "sun"]];

interface AddWordsProps {
  domain: string;
  translate: TranslateFunction;
}

interface AddWordsState {
  fields: string[][];
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
    this.state = {
      newVern: "",
      newGloss: "",
      fields: testdata
    };
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

    let words = [...this.state.fields];
    words.push([vernacular, gloss]);
    this.setState({ fields: words, newVern: "", newGloss: "" });

    this.focusVernInput();
  }

  updateWord(values: string[], index: number) {
    let words = [...this.state.fields];
    words.splice(index, 1, values);
    this.setState({ fields: words });
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
    let words = [...this.state.fields];
    words.splice(index, 1);
    this.setState({ fields: words });
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

    for (let tuple of this.state.fields) {
      word.vernacular = tuple[0];

      word.senses[0].glosses = [];
      let defs = tuple[1].split(",");
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

  render() {
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
              {this.state.fields.map((word, index) => {
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
                          value={word[0]}
                          onChange={e => {
                            this.updateWord([e.target.value, word[1]], index);
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
                          value={word[1]}
                          onChange={e => {
                            this.updateWord([word[0], e.target.value], index);
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
                        label={
                          this.props.translate("addWords.vernacular") as string
                        }
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
                        label={
                          this.props.translate("addWords.glosses") as string
                        }
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
