import React, { ReactElement } from "react";

import AppBarComponent from "../../AppBar/AppBarComponent";
import { Goal } from "../../../types/goals";
import { GridList, GridListTile, Button, Typography } from "@material-ui/core";
import HorizontalDisplay from "./HorizontalDisplay";
import VerticalDisplay from "./VerticalDisplay";
import {
  Translate,
  LocalizeContextProps,
  withLocalize,
} from "react-localize-redux";

const timelineStyle = {
  centerDisplays: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    padding: "70px 0",
    textAlign: "center",
    width: "100%",
    height: "80%",
  },
  paneStyling: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
    textAlign: "center",
  },
};

export interface GoalTimelineVerticalProps {
  chooseGoal: (goal: Goal) => void;
  loadHistory: () => void;

  allPossibleGoals: Goal[];
  history: Goal[];
  suggestions: Goal[];
}

export interface GoalTimelineVerticalState {
  portrait: boolean;
  reducedLandScape: boolean;
}

/**
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
export class GoalTimelineVertical extends React.Component<
  GoalTimelineVerticalProps & LocalizeContextProps,
  GoalTimelineVerticalState
> {
  constructor(props: GoalTimelineVerticalProps & LocalizeContextProps) {
    super(props);
    this.state = {
      portrait: window.innerWidth < window.innerHeight,
      reducedLandScape: (window.innerWidth * 7) / 10 < window.innerHeight,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({
      portrait: window.innerWidth < window.innerHeight,
      reducedLandScape: (window.innerWidth * 7) / 10 < window.innerHeight,
    });
  };

  // Load history from database
  componentDidMount() {
    window.addEventListener("resize", this.handleWindowSizeChange);
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
          <div
            style={{
              ...(timelineStyle.paneStyling as any),
              width: "80%",
              height: 50,
            }}
          >
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
        <GridList cols={this.state.reducedLandScape ? 6 : 8} cellHeight="auto">
          {/* Alternatives */}
          <GridListTile cols={2}>
            <div
              style={{ ...timelineStyle.paneStyling, float: "right" } as any}
            >
              <Typography variant="h6">
                <Translate id={"goal.selector.other"} />
              </Typography>
              <VerticalDisplay
                data={this.createSuggestionData()}
                scrollToEnd={false}
                handleChange={this.handleChange}
                height={35}
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

          {/* History */}

          <GridListTile cols={2}>
            <div style={timelineStyle.paneStyling as any}>
              <Typography variant="h6">
                <Translate id={"goal.selector.past"} />
              </Typography>
              <VerticalDisplay
                data={this.props.history}
                scrollToEnd={false}
                handleChange={this.handleChange}
                height={35}
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

export default withLocalize(GoalTimelineVertical);
