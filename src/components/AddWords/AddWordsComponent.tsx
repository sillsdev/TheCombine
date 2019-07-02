import React from "react";
import {
  Paper,
  Typography,
  Container,
  TextField,
  Grid,
  Divider,
  Button
} from "@material-ui/core";
import theme from "../../types/theme";
import { LocalizeContextProps } from "react-localize-redux";
import { Word, State } from "../../types/word";

interface AddWordsProps {
  domain: string;
}

interface AddWordsState {
  words: Word[];
  editing?: number;
  newVern: string;
  newGloss: string;
}

export default class AddWords extends React.Component<
  AddWordsProps & LocalizeContextProps,
  AddWordsState
> {
  constructor(props: AddWordsProps & LocalizeContextProps) {
    super(props);
    this.state = { words: [], newVern: "", newGloss: "" };
  }

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
  }

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
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ marginTop: theme.spacing(2) }}
                >
                  Vernacular
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  variant="h5"
                  align="center"
                  style={{ marginTop: theme.spacing(2) }}
                >
                  Gloss
                </Typography>
              </Grid>
              {this.state.words.map((word, index) => (
                <React.Fragment>
                  <Grid
                    item
                    xs={6}
                    style={{
                      paddingLeft: theme.spacing(3),
                      paddingRight: theme.spacing(2)
                    }}
                  >
                    <Typography variant="body1">{word.vernacular}</Typography>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    style={{
                      paddingLeft: theme.spacing(2),
                      paddingRight: theme.spacing(2)
                    }}
                  >
                    <Typography variant="body1">
                      {word.senses[0].glosses[0].def}
                    </Typography>
                  </Grid>
                </React.Fragment>
              ))}
              <React.Fragment>
                <Grid
                  item
                  xs={6}
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
                  />
                </Grid>
                <Grid
                  item
                  xs={6}
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
                  />
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
