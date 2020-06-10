import React from "react";
import {
  LocalizeContextProps,
  withLocalize,
  Translate,
} from "react-localize-redux";
import { Typography, GridList, GridListTile, Button } from "@material-ui/core";

import { Goal } from "../../../types/goals";

const style = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflowY: "scroll",
    overflowX: "hidden",
  },
  buttonStyle: {
    height: "95%",
    padding: "1vw",
  },
};

export interface VerticalDisplayProps {
  data: Goal[];
  height: number;
  numPanes: number;
  scrollToEnd: boolean;
  handleChange: (name: string) => void;
}

export class VerticalDisplay extends React.Component<
  VerticalDisplayProps & LocalizeContextProps
> {
  optionHeight: number;

  constructor(props: VerticalDisplayProps & LocalizeContextProps) {
    super(props);

    this.optionHeight = this.props.height / 3 - 1;
    this.historyButton = this.historyButton.bind(this);
    this.noHistoryButton = this.noHistoryButton.bind(this);
  }

  historyButton(goal: Goal, index: number) {
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
        >
          <Typography variant={"h6"}>
            <Translate id={goal.name + ".title"} />
          </Typography>
        </Button>
      </GridListTile>
    );
  }

  noHistoryButton() {
    return (
      <GridListTile key={-1} cols={1}>
        <Button
          style={
            { ...style.buttonStyle, height: this.optionHeight + "vw" } as any
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
          height: this.props.height + "vw",
          overflowX: "hidden",
          overflowY: "scroll",
        }}
        cols={1} //this.props.numPanes
      >
        {this.props.data.length > 0
          ? this.props.data.map(this.historyButton)
          : this.noHistoryButton()}
        <div
          ref={(element: HTMLDivElement) => {
            if (this.props.scrollToEnd && element) element.scrollIntoView(true);
          }}
        />
      </GridList>
    );
  }
}

export default withLocalize(VerticalDisplay);
