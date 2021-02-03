import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";
import { Typography, GridList, GridListTile, Button } from "@material-ui/core";

import { Goal } from "types/goals";

const style = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflowY: "hidden",
    overflowX: "scroll",
  },
  buttonStyle: {
    height: "95%",
    padding: "1vw",
  },
};

export interface HorizontalDisplayProps {
  data: Goal[];
  width: number;
  numPanes: number;
  scrollToEnd: boolean;
  handleChange: (name: string) => void;
}

export class HorizontalDisplay extends React.Component<
  HorizontalDisplayProps & LocalizeContextProps
> {
  optionWidth: number;

  constructor(props: HorizontalDisplayProps & LocalizeContextProps) {
    super(props);

    this.optionWidth = this.props.width / 3 - 1;
    this.prevCompletionButton = this.prevCompletionButton.bind(this);
    this.noPrevCompletionButton = this.noPrevCompletionButton.bind(this);
  }

  prevCompletionButton(goal: Goal, index: number) {
    return (
      <GridListTile key={index + "tileHorizontal"} cols={1}>
        <Button
          color="primary"
          variant="outlined"
          style={
            { ...style.buttonStyle, width: this.optionWidth + "vw" } as any
          }
          onClick={() => {
            this.props.handleChange(goal.name);
          }}
        >
          <Typography variant={"h6"}>
            <Translate id={goal.name + ".title"} />
          </Typography>
        </Button>
      </GridListTile>
    );
  }

  noPrevCompletionButton() {
    return (
      <GridListTile key={-1} cols={1}>
        <Button
          style={
            { ...style.buttonStyle, width: this.optionWidth + "vw" } as any
          }
          variant="contained"
          disabled={true}
        >
          <Typography variant={"h6"}>
            <Translate id={"goal.selector.noHistory"} />
          </Typography>
        </Button>
      </GridListTile>
    );
  }

  render() {
    return (
      <GridList
        style={{
          flexWrap: "nowrap",
          width: this.props.width + "vw",
          overflowX: "scroll",
          overflowY: "hidden",
        }}
        cols={this.props.numPanes}
      >
        {this.props.data.length > 0
          ? this.props.data.map(this.prevCompletionButton)
          : this.noPrevCompletionButton()}
        <div
          ref={(element: HTMLDivElement) => {
            if (this.props.scrollToEnd && element) element.scrollIntoView(true);
          }}
        />
      </GridList>
    );
  }
}

export default withLocalize(HorizontalDisplay);
