import { Word, Sense } from "../../../../types/word";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import React from "react";
import { Typography, Tabs, Tab } from "@material-ui/core";
import { styled } from "@material-ui/styles";

const SenseTab = styled(Tab)({
  minHeight: "auto",
  minWidth: "auto",
  padding: 3
});

export interface WordCardProps {
  word: Word;
}

interface WordCardState {
  sense: number;
}

class WordCard extends React.Component<
  WordCardProps & LocalizeContextProps,
  WordCardState
> {
  constructor(props: WordCardProps & LocalizeContextProps) {
    super(props);
    this.state = { sense: 0 };
  }

  handleChange(newValue: number) {
    this.setState({ sense: newValue });
  }

  getGlosses(sense: Sense): string {
    if (sense.glosses.length > 0) {
      return sense.glosses
        .map(gloss => gloss.def)
        .reduce((acc, val) => acc + ", " + val);
    } else {
      return "{no gloss}";
    }
  }

  getDomains(sense: Sense): string {
    if (sense.semanticDomains.length > 0) {
      return sense.semanticDomains
        .map(domain => domain.number + " " + domain.name)
        .reduce((acc, val) => acc + ", " + val);
    } else {
      return "{no semantic domain}";
    }
  }

  render() {
    return (
      <div>
        <Typography variant="h5">
          {this.props.word.vernacular}{" "}
          {this.props.word.plural && ", " + this.props.word.plural}
        </Typography>
        <Typography variant="caption">Glosses:</Typography>
        <Tabs
          value={this.state.sense}
          onChange={(event, val) => this.handleChange(val)}
        >
          {this.props.word.senses.map(sense => (
            <SenseTab label={this.getGlosses(sense)} />
          ))}
        </Tabs>
        {this.getDomains(
          this.props.word.senses[
            this.state.sense % this.props.word.senses.length
          ]
        )}
      </div>
    );
  }
}

//export class as default
export default withLocalize(WordCard);
