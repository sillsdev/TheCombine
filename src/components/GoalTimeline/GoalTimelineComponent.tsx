import React from "react";

import GoalHistory from "./GoalHistory/index";
import GoalSwitcher from "./GoalSwitcher";
import GoalSuggestions from "./GoalSuggestions";
import AppBarComponent from "../AppBar/AppBarComponent";

const timelineStyle = {
  centerDisplays: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export interface GoalTimelineProps {
  loadUserEdits: (id: string) => void;
}

/**
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
export class GoalTimeline extends React.Component<GoalTimelineProps> {
  constructor(props: GoalTimelineProps) {
    super(props);
  }

  componentDidMount() {
    this.props.loadUserEdits("");
  }

  render() {
    return (
      <div className="GoalView">
        <AppBarComponent />
        <div style={timelineStyle.centerDisplays}>
          <GoalHistory />
        </div>
        <div style={timelineStyle.centerDisplays}>
          <GoalSwitcher />
        </div>
        <div style={timelineStyle.centerDisplays}>
          <GoalSuggestions />
        </div>
      </div>
    );
  }
}
