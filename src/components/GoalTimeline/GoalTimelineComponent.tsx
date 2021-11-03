import {
  Button,
  ImageList,
  ImageListItem,
  Typography,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import GoalList from "components/GoalTimeline/GoalList";
import { goalTypeToGoal } from "types/goalUtilities";
import { Goal, GoalsState } from "types/goals";

const timelineStyle = {
  centerButton: {
    padding: "70px 0",
    textAlign: "center" as const,
    width: "100%",
    height: "80%",
  },
  paneStyling: {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    justifyContent: "center",
    textAlign: "center" as const,
  },
};

interface GoalTimelineProps {
  chooseGoal: (goal: Goal) => void;
  clearHistory: () => void;
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
      portrait: window.innerWidth - 40 < window.innerHeight,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowSizeChange);
    this.props.clearHistory();
  }

  handleWindowSizeChange = () => {
    this.setState({
      portrait: window.innerWidth - 40 < window.innerHeight,
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
        style={timelineStyle.centerButton}
        color="primary"
        variant="contained"
        disabled={done}
        onClick={() => {
          this.props.chooseGoal(goal);
        }}
        id={`new-goal-${goal.name}`}
      >
        <Typography variant="h4">
          <Translate id={done ? "goal.selector.done" : goal.name + ".title"} />
        </Typography>
      </Button>
    );
  }

  renderPortrait() {
    return (
      <React.Fragment>
        {/* Alternatives */}
        <div style={{ ...timelineStyle.paneStyling, float: "right" }}>
          <GoalList
            orientation="horizontal"
            data={this.createSuggestionData()}
            handleChange={this.handleChange}
            size={100}
            numPanes={2}
            scrollable={false}
          />
        </div>

        {/* Recommendation */}
        <div style={{ ...timelineStyle.paneStyling, width: "60%" }}>
          <Typography variant="h6">
            <Translate id="goal.selector.present" />
          </Typography>
          {this.goalButton()}
        </div>

        {/* History */}
        <div style={timelineStyle.paneStyling}>
          <Typography variant="h6">
            <Translate id="goal.selector.past" />
          </Typography>
          <GoalList
            completed
            orientation="horizontal"
            data={[...this.props.history].reverse()}
            handleChange={this.handleChange}
            size={100}
            numPanes={3}
            scrollable={true}
          />
        </div>
      </React.Fragment>
    );
  }

  renderLandscape() {
    return (
      <ImageList cols={13} rowHeight="auto">
        {/* Alternatives */}
        <ImageListItem
          cols={5}
          style={{ ...timelineStyle.paneStyling, float: "right" }}
        >
          <Typography variant="h6">
            <Translate id="goal.selector.other" />
          </Typography>
          <GoalList
            orientation="vertical"
            data={this.createSuggestionData()}
            handleChange={this.handleChange}
            size={35}
            numPanes={3}
            scrollable={false}
          />
        </ImageListItem>

        {/* Recommendation */}
        <ImageListItem cols={3} style={timelineStyle.paneStyling}>
          <Typography variant="h5">
            <Translate id="goal.selector.present" />
          </Typography>
          {this.goalButton()}
        </ImageListItem>

        {/* History */}
        <ImageListItem cols={5} style={timelineStyle.paneStyling}>
          <Typography variant="h6">
            <Translate id="goal.selector.past" />
          </Typography>
          <GoalList
            completed
            orientation="vertical"
            data={[...this.props.history].reverse()}
            handleChange={this.handleChange}
            size={35}
            numPanes={3}
            scrollable={true}
          />
        </ImageListItem>
      </ImageList>
    );
  }

  render() {
    return this.state.portrait ? this.renderPortrait() : this.renderLandscape();
  }
}
