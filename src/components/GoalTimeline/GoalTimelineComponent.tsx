import React from "react";

import GoalHistory from "./GoalHistory/index";
import GoalSwitcher from "./GoalSwitcher";
import GoalSuggestions from "./GoalSuggestions";
import AppBarComponent from "../AppBar/AppBarComponent";
import { User } from "../../types/user";

const timelineStyle = {
  centerDisplays: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export interface GoalTimelineProps {
  loadUserEdits: (projectId: string, userEditId: string) => void;
}

/**
 * Displays the list of goals the user has decided they will work on, their
 * choices for the next goal, and suggestions for which goals they should choose
 * to work on.
 */
export class GoalTimeline extends React.Component<GoalTimelineProps> {
  componentDidMount() {
    let currentUserString = localStorage.getItem("user");
    if (currentUserString) {
      let currentUserObject: User = JSON.parse(currentUserString);
      // if (currentUserObject.userEditId) {
      //   this.props.loadUserEdits(currentUserObject.userEditId);
      // } else {
      //   this.props.loadUserEdits("878611321567894156984651"); // Pass a nonexistent id
      // }
    }
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
