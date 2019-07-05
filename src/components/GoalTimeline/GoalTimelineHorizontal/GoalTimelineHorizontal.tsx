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
import { User } from "../../../types/user";

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
  loadUserEdits: (id: string) => void;
  chooseGoal: (goal: Goal) => void;

  allPossibleGoals: Goal[];
  history: Goal[];
  suggestions: Goal[];
}

/**
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
export class GoalTimelineHorizontal extends React.Component<
  GoalTimelineHorizontalProps & LocalizeContextProps
> {
  constructor(props: GoalTimelineHorizontalProps & LocalizeContextProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  // Load history from database
  componentDidMount() {
    let currentUserString = localStorage.getItem("user");
    if (currentUserString) {
      let currentUserObject: User = JSON.parse(currentUserString);
      if (currentUserObject.userEditId) {
        this.props.loadUserEdits(currentUserObject.userEditId);
      } else {
        this.props.loadUserEdits("878611321567894156984651"); // Pass a nonexistent id
      }
    }
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

  render() {
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
}

export default withLocalize(GoalTimelineHorizontal);
