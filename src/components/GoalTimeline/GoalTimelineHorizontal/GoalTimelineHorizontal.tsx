import React, { ReactElement } from "react";

import AppBarComponent from "../../AppBar/AppBarComponent";
import { Goal } from "../../../types/goals";
import { GridList, GridListTile, Button, Typography } from "@material-ui/core";
import HorizontalDisplay from "./HorizontalDisplay";
import {
  Translate,
  LocalizeContextProps,
  withLocalize
} from "react-localize-redux";

const timelineStyle = {
  centerDisplays: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  centerButton: {
    padding: "70px 0",
    textAlign: "center",
    width: "100%",
    height: "80%"
  },
  paneStyling: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
    textAlign: "center"
  }
};

export interface GoalTimelineHorizontalProps {
  chooseGoal: (goal: Goal) => void;
  loadHistory: () => void;

  allPossibleGoals: Goal[];
  history: Goal[];
  suggestions: Goal[];
}

export interface GoalTimelineHorizontalState {
  portrait: boolean;
}

/**
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
export class GoalTimelineHorizontal extends React.Component<
  GoalTimelineHorizontalProps & LocalizeContextProps,
  GoalTimelineHorizontalState
> {
  constructor(props: GoalTimelineHorizontalProps & LocalizeContextProps) {
    super(props);
    this.state = { portrait: window.innerWidth < window.innerHeight };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    window.addEventListener("resize", this.handleWindowSizeChange);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({ portrait: window.innerWidth < window.innerHeight });
  };

  // Load history from database
  componentDidMount() {
    this.props.loadHistory();
  }

  // Given a change event, find which goal the user selected, and choose it
  // as the next goal to work on.
  handleChange(name: string) {
    let goal: Goal | undefined = this.findGoalByName(
      this.props.allPossibleGoals,
      name
    );
    if (goal) {
      this.props.chooseGoal(goal);
    }
  }

  // Search through the list of possible goals, and find which one the user
  // selected
  findGoalByName(goals: Goal[], name: string): Goal | undefined {
    for (var goal of goals) {
      if (goal.name === name) {
        return goal;
      }
    }
  }

  // Creates a list of suggestions, with non-suggested goals at the end and our main suggestion absent (to be displayed on the suggestions button)
  createSuggestionData(): Goal[] {
    let data: Goal[] = this.props.suggestions.slice(1);
    let hasGoal: boolean;

    for (let goal of this.props.allPossibleGoals) {
      hasGoal = false;
      for (let i = 0; i < data.length && !hasGoal; i++)
        if (goal === data[i]) hasGoal = true;

      if (!hasGoal && goal !== this.props.suggestions[0]) data.push(goal);
    }

    return data;
  }

  // Creates a button for our recommended goal
  goalButton(): ReactElement {
    let done: boolean = this.props.suggestions.length === 0;
    return (
      <Button
        style={timelineStyle.centerButton as any}
        color={"primary"}
        variant={"contained"}
        disabled={done}
        onClick={() => {
          this.props.chooseGoal(this.props.suggestions[0]);
        }}
      >
        <Typography variant={"h4"}>
          <Translate
            id={
              done
                ? "goal.selector.done"
                : this.props.suggestions[0].name + ".title"
            }
          />
        </Typography>
      </Button>
    );
  }

  renderPortrait() {
    return (
      <div className="GoalView">
        <AppBarComponent />
        {/* Alternatives */}
        <div style={{ ...timelineStyle.paneStyling, float: "right" } as any}>
          <HorizontalDisplay
            data={this.createSuggestionData()}
            scrollToEnd={false}
            handleChange={this.handleChange}
            width={100}
            numPanes={3}
          />
        </div>

        {/* Recommendation */}
        <div style={timelineStyle.paneStyling as any}>
          <Typography variant="h5">
            <Translate id={"goal.selector.present"} />
          </Typography>
          <div style={{ ...(timelineStyle.paneStyling as any), width: "80%" }}>
            {this.goalButton()}
          </div>
        </div>
      </div>
    );
  }

  renderLandscape() {
    return (
      <div className="GoalView">
        <AppBarComponent />

        {/* History */}
        <GridList cols={8} cellHeight="auto">
          <GridListTile cols={3}>
            <div style={timelineStyle.paneStyling as any}>
              <Typography variant="h6">
                <Translate id={"goal.selector.past"} />
              </Typography>
              <HorizontalDisplay
                data={this.props.history}
                scrollToEnd={true}
                handleChange={this.handleChange}
                width={35}
                numPanes={3}
              />
            </div>
          </GridListTile>

          {/* Recommendation */}
          <GridListTile cols={2} style={timelineStyle.paneStyling as any}>
            <Typography variant="h5">
              <Translate id={"goal.selector.present"} />
            </Typography>
            {this.goalButton()}
          </GridListTile>

          {/* Alternatives */}
          <GridListTile cols={3}>
            <div
              style={{ ...timelineStyle.paneStyling, float: "right" } as any}
            >
              <Typography variant="h6">
                <Translate id={"goal.selector.other"} />
              </Typography>
              <HorizontalDisplay
                data={this.createSuggestionData()}
                scrollToEnd={false}
                handleChange={this.handleChange}
                width={35}
                numPanes={3}
              />
            </div>
          </GridListTile>
        </GridList>
      </div>
    );
  }

  render() {
    return this.state.portrait ? this.renderPortrait() : this.renderLandscape();
  }
}

export default withLocalize(GoalTimelineHorizontal);
