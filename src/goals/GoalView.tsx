import React from "react";

// import { GoalHistory } from "./GoalHistory";
import { GoalSelector } from "./GoalSelector";
// import { GoalFuture } from "./GoalFuture";
import { Goals } from "../types/goals";
import { User } from "../types/user";
import { TempGoal } from "./tempGoal";
import { Stack } from "../types/stack";

let tempUser: User = { name: "Joe", username: "JoeUsername", id: 5 };
let possibleGoals: Goals[] = [];
possibleGoals.push(new TempGoal(tempUser));
possibleGoals.push(new TempGoal(tempUser));
possibleGoals.push(new TempGoal(tempUser));
const suggestedGoals: Stack<Goals> = new Stack<Goals>(possibleGoals);

export interface GoalViewProps {}

export interface GoalViewState {
  goalHistory: Stack<Goals>;
  goalSuggestions: Stack<Goals>;
}

export class GoalView extends React.Component<GoalViewProps, GoalViewState> {
  constructor(props: GoalViewProps) {
    super(props);
    this.state = {
      goalHistory: new Stack<Goals>([]),
      goalSuggestions: suggestedGoals
    };

    this.addGoal = this.addGoal.bind(this);
  }

  addGoal(goal: Goals) {
    this.addToHistory(goal);
    this.removeGoalFromFuture(goal);
  }

  addToHistory(goal: Goals) {
    this.state.goalHistory.push(goal);
    this.setState({
      goalHistory: this.state.goalHistory,
      goalSuggestions: this.state.goalSuggestions
    });
  }

  removeGoalFromFuture(goal: Goals) {
    let nextSuggestion = this.state.goalSuggestions.peekFirst();
    if (nextSuggestion && nextSuggestion.name === goal.name) {
      let newSuggestions = new Stack<Goals>(
        this.state.goalSuggestions.stack.filter(
          goal => nextSuggestion.name != goal.name
        )
      );
      this.setState({
        goalHistory: this.state.goalHistory,
        goalSuggestions: newSuggestions
      });
    }
  }

  render() {
    return (
      <div className="GoalView">
        {/* <GoalHistory chosenGoals={this.state.goalHistory} /> */}
        <GoalSelector addToHistory={this.addGoal} />
        {/* <GoalFuture suggestedGoals={this.state.goalSuggestions} /> */}
      </div>
    );
  }
}
