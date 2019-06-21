import * as React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate
} from "react-localize-redux";
import { Grid, Typography, Paper, Button } from "@material-ui/core";
import { Refresh as RefreshIcon } from "@material-ui/icons";
import { Word } from "../../../../types/word";
import * as backend from "../../../../backend";

export interface SampleWordsProps {
  setInventory: (inventory: string[]) => void;
  inventory: string[];
}

interface SampleWordsState {
  words: string[];
  selected: string[];
  dragChar: string;
  dropChar: string;
}

class SampleWords extends React.Component<
  SampleWordsProps & LocalizeContextProps,
  SampleWordsState
> {
  constructor(props: SampleWordsProps & LocalizeContextProps) {
    super(props);
    this.state = {
      words: [],
      selected: [],
      dragChar: "",
      dropChar: ""
    };
  }

  componentDidMount() {
    this.getWords();
  }

  // toggles selection (for deletion) of a word (not used right now)
  toggleSelected(word: string) {
    let selected = this.state.selected;
    let index = selected.indexOf(word);

    if (index === -1) {
      selected.push(word);
    } else {
      selected.splice(index, 1);
    }

    this.setState({
      selected
    });
  }

  // deletes selected word (not used right now)
  deleteSelected() {
    this.props.setInventory([
      ...this.props.inventory.filter(
        char => !this.state.selected.includes(char)
      )
    ]);
    this.setState({
      selected: []
    });
  }

  /**
   * Gets the words that don't fit the character inventory
   */
  async getWords() {
    console.log("hya");
    let inv = [...this.props.inventory];
    let sampleWords: string[] = [];
    let allWords: Word[] = await backend.getFrontierWords();

    let word;
    for (let i: number = 0; i < allWords.length; i++) {
      if (sampleWords.length >= 5) break;
      word = allWords[i].vernacular;
      for (let j: number = 0; j < word.length; j++) {
        if (inv.indexOf(word[j]) === -1 && word[j] !== " ") {
          sampleWords.push(word);
          break;
        }
      }
    }

    this.setState({
      words: [...sampleWords]
    });
  }

  render() {
    return (
      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography component="h1" variant="h4">
            <Translate id="charInventory.sampleWords.title" />
          </Typography>
          <Typography variant="subtitle1">
            <Translate id="charInventory.sampleWords.description" />
          </Typography>
          <Button
            onClick={() => {
              this.getWords();
            }}
          >
            <RefreshIcon />
          </Button>
        </Grid>
        {this.state.words.map(word => (
          <Grid item xs={12} key={word}>
            <Grid container justify="flex-start">
              <Paper
                className="classes.paper"
                style={{
                  minWidth: 40,
                  textAlign: "center",
                  padding: "5px 10px",
                  cursor: "pointer",
                  background: this.state.selected.includes(word)
                    ? "#cfc"
                    : "#fff"
                }}
                onClick={() => this.toggleSelected(word)}
              >
                {word}
              </Paper>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12} />
      </Grid>
    );
  }
}

export default withLocalize(SampleWords);
