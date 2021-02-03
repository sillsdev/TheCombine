import { Typography, GridList, GridListTile, Button } from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { Goal } from "types/goals";

const style = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflowY: "scroll",
    overflowX: "hidden",
  },
  buttonStyle: {
    height: "80%",
    padding: "2vw",
  },
};

interface VerticalDisplayProps {
  data: Goal[];
  height: number;
  numPanes: number;
  scrollToEnd: boolean;
  handleChange: (name: string) => void;
}

interface VerticalDisplayStates {
  scrollVisible: boolean;
}

export default class VerticalDisplay extends React.Component<
  VerticalDisplayProps,
  VerticalDisplayStates
> {
  optionHeight: number;

  constructor(props: VerticalDisplayProps) {
    super(props);
    this.state = { scrollVisible: false };
    this.optionHeight = this.props.height / 3 - 1.25;
    this.prevCompletionButton = this.prevCompletionButton.bind(this);
    this.noPrevCompletionButton = this.noPrevCompletionButton.bind(this);
  }

  prevCompletionButton(goal: Goal, index: number) {
    return (
      <GridListTile key={index + "tileVertical"} cols={1}>
        <Button
          color="primary"
          variant="outlined"
          style={
            { ...style.buttonStyle, height: this.optionHeight + "vw" } as any
          }
          onClick={() => {
            this.props.handleChange(goal.name);
          }}
          fullWidth
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
            { ...style.buttonStyle, height: this.optionHeight + "vw" } as any
          }
          variant="contained"
          disabled={true}
          fullWidth
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
          flexWrap: "wrap",
          height: this.props.height + "vw",
          overflowX: "auto",
          overflowY: this.state.scrollVisible ? "scroll" : "hidden",
          padding: "50px",
        }}
        cols={1}
        onMouseOver={() => {
          this.setState({ scrollVisible: true });
        }}
        onMouseLeave={() => {
          this.setState({ scrollVisible: false });
        }}
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
