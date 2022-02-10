import {
  Button,
  ImageList,
  ImageListItem,
  Typography,
} from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";

import { getUserRole } from "backend";
import { getCurrentUser } from "backend/localStorage";
import GoalList from "components/GoalTimeline/GoalList";
import { requiredPermission, goalTypeToGoal } from "types/goalUtilities";
import { Goal, GoalsState, GoalType } from "types/goals";

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
  currentProjectId: string;
  chooseGoal: (goal: Goal) => void;
  clearHistory: () => void;
  loadHistory: () => void;
}

interface GoalTimelineState {
  availableGoalTypes: GoalType[];
  suggestedGoalTypes: GoalType[];
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
      availableGoalTypes: [],
      suggestedGoalTypes: [],
      portrait: window.innerWidth - 40 < window.innerHeight,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => this.handleWindowSizeChange());
    this.props.clearHistory();
  }

  handleWindowSizeChange = () => {
    const portrait = window.innerWidth - 40 < window.innerHeight;
    this.setState({ portrait });
  };

  // Load history from database
  async componentDidMount() {
    window.addEventListener("resize", () => this.handleWindowSizeChange());
    await this.getSuggestionsWithPermission();
    this.props.loadHistory();
  }

  // Given a change event, find which goal the user selected, and choose it
  // as the next goal to work on.
  handleChange(goal: Goal) {
    this.props.chooseGoal(goal);
  }

  async getSuggestionsWithPermission() {
    const userRoleId =
      getCurrentUser()?.projectRoles[this.props.currentProjectId];
    if (!userRoleId) {
      return;
    }
    const permissions = (await getUserRole(userRoleId)).permissions;
    this.setState((_, props) => {
      const availableGoalTypes = props.allGoalTypes.filter((type) =>
        permissions.includes(requiredPermission(type))
      );
      const suggestedGoalTypes = availableGoalTypes.filter((t) =>
        props.goalTypeSuggestions.includes(t)
      );
      return { availableGoalTypes, suggestedGoalTypes };
    });
  }

  // Creates a list of suggestions, with non-suggested goals at the end and
  // our main suggestion absent (to be displayed on the suggestions button).
  // Avoids referencing this.state for testing purposes.
  createSuggestionData(availableGoalTypes: GoalType[]): Goal[] {
    const suggestions = this.props.goalTypeSuggestions.filter((t) =>
      availableGoalTypes.includes(t)
    );
    // Use ? even though suggestions shouldn't ever be undefined, because somehow it can
    // be while loading component props from the Redux state.
    if (!suggestions?.length) {
      return availableGoalTypes.map(goalTypeToGoal);
    }
    const secondarySuggestions = suggestions.slice(1);
    const nonSuggestions = availableGoalTypes.filter(
      (t) => !suggestions.includes(t)
    );
    secondarySuggestions.push(...nonSuggestions);
    return secondarySuggestions.map(goalTypeToGoal);
  }

  // Creates a button for our recommended goal
  goalButton(): ReactElement {
    const done = this.state.suggestedGoalTypes.length === 0;
    const goal = goalTypeToGoal(this.state.suggestedGoalTypes[0]);
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
            data={this.createSuggestionData(this.state.availableGoalTypes)}
            handleChange={this.handleChange}
            size={100}
            numPanes={2}
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
            scrollable
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
            data={this.createSuggestionData(this.state.availableGoalTypes)}
            handleChange={this.handleChange}
            size={35}
            numPanes={3}
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
            scrollable
          />
        </ImageListItem>
      </ImageList>
    );
  }

  render() {
    return this.state.portrait ? this.renderPortrait() : this.renderLandscape();
  }
}
