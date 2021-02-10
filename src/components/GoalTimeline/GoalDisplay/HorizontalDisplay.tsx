import React from "react";
import { Translate } from "react-localize-redux";
import { Typography, GridList, GridListTile, Button } from "@material-ui/core";

import { Goal, GoalType } from "types/goals";

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

interface HorizontalDisplayProps {
  data: Goal[];
  width: number;
  numPanes: number;
  scrollToEnd: boolean;
  handleChange: (goalType: GoalType) => void;
}

export default class HorizontalDisplay extends React.Component<HorizontalDisplayProps> {
  optionWidth: number;

  constructor(props: HorizontalDisplayProps) {
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
            this.props.handleChange(goal.goalType);
          }}
          disabled={goal.completed}
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
