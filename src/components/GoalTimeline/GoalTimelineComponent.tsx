import { Button, GridList, GridListTile, Typography } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import GoalList from "components/GoalTimeline/GoalList";
import { Goal, GoalsState } from "types/goals";
import { goalTypeToGoal } from "types/goalUtilities";

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

interface GoalTimelineProps {
  chooseGoal: (goal: Goal) => void;
  loadHistory: () => void;
}

interface GoalTimelineState {
  portrait: boolean;
}

/**
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
export default class GoalTimeline extends React.Component<
  GoalTimelineProps & GoalsState,
  GoalTimelineState
> {
  constructor(props: GoalTimelineProps & GoalsState) {
    super(props);
    this.state = {
      portrait: window.innerWidth < window.innerHeight,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    this.setState({
      portrait: window.innerWidth < window.innerHeight,
    });
  };

  // Load history from database
  componentDidMount() {
    window.addEventListener("resize", this.handleWindowSizeChange);
    this.props.loadHistory();
  }

  // Given a change event, find which goal the user selected, and choose it
  // as the next goal to work on.
  handleChange(goal: Goal) {
    this.props.chooseGoal(goal);
  }

  // Creates a list of suggestions, with non-suggested goals at the end and
  // our main suggestion absent (to be displayed on the suggestions button).
  createSuggestionData(): Goal[] {
    const suggestions = this.props.goalTypeSuggestions;
    if (!suggestions?.length) {
      return this.props.allGoalTypes.map((type) => goalTypeToGoal(type));
    }
    const secondarySuggestions = suggestions.slice(1);
    const nonSuggestions = this.props.allGoalTypes.filter(
      (t) => !suggestions.includes(t)
    );
    secondarySuggestions.push(...nonSuggestions);
    return secondarySuggestions.map((type) => goalTypeToGoal(type));
  }

  // Creates a button for our recommended goal
  goalButton(): ReactElement {
    const done = this.props.goalTypeSuggestions.length === 0;
    const goal = goalTypeToGoal(this.props.goalTypeSuggestions[0]);
    return (
      <Button
        style={timelineStyle.centerButton as any}
        color={"primary"}
        variant={"contained"}
        disabled={done}
        onClick={() => {
          this.props.chooseGoal(goal);
        }}
      >
        <Typography variant={"h4"}>
          <Translate id={done ? "goal.selector.done" : goal.name + ".title"} />
        </Typography>
      </Button>
    );
  }

  renderPortrait() {
    return (
      <React.Fragment>
        {/* Alternatives */}
        <div style={{ ...timelineStyle.paneStyling, float: "right" } as any}>
          <GoalList
            orientation="horizontal"
            data={this.createSuggestionData()}
            handleChange={this.handleChange}
            size={100}
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
      </React.Fragment>
    );
  }

  renderLandscape() {
    return (
      <GridList cols={13} cellHeight="auto">
        {/* Alternatives */}
        <GridListTile cols={4}>
          <div style={{ ...timelineStyle.paneStyling, float: "right" } as any}>
            <Typography variant="h6">
              <Translate id={"goal.selector.other"} />
            </Typography>
            <GoalList
              orientation="vertical"
              data={this.createSuggestionData()}
              handleChange={this.handleChange}
              size={35}
              numPanes={3}
            />
          </div>
        </GridListTile>

        {/* Recommendation */}
        <GridListTile cols={3} style={timelineStyle.paneStyling as any}>
          <Typography variant="h5">
            <Translate id={"goal.selector.present"} />
          </Typography>
          {this.goalButton()}
        </GridListTile>

        {/* History */}
        <GridListTile cols={4}>
          <div style={timelineStyle.paneStyling as any}>
            <Typography variant="h6">
              <Translate id={"goal.selector.past"} />
            </Typography>
            <GoalList
              orientation="vertical"
              data={[...this.props.history].reverse()}
              handleChange={this.handleChange}
              size={35}
              numPanes={3}
            />
          </div>
        </GridListTile>
      </GridList>
    );
  }

  render() {
    return this.state.portrait ? this.renderPortrait() : this.renderLandscape();
  }
}
