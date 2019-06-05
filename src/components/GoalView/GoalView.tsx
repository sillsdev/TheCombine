import React from "react";

import { GoalHistory } from "./GoalHistory/GoalHistory";
import GoalSelector from "./GoalSelector";
import { GoalFuture } from "./GoalFuture/GoalFuture";
import { Goals } from "../../types/goals";
import { User } from "../../types/user";
import { TempGoal } from "../../goals/tempGoal";
import { Stack } from "../../types/stack";

let tempUser: User = { name: "Joe", username: "JoeUsername", id: 5 };
let possibleGoals: Goals[] = [];
let goal1: Goals = new TempGoal(tempUser);
let goal1Message = "A goal";
goal1.id = 1;
goal1.data = { words: goal1Message.split(" "), step: 1 };
let goal2: Goals = new TempGoal(tempUser);
let goal2Message = "Another goal";
goal1.id = 2;
goal2.data = { words: goal2Message.split(" "), step: 2 };
possibleGoals.push(goal1);
possibleGoals.push(goal2);
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
    if (
      nextSuggestion &&
      nextSuggestion.data.words.join() === goal.data.words.join()
    ) {
      let newSuggestions = new Stack<Goals>(
        this.state.goalSuggestions.stack.filter(
          goal => nextSuggestion.data.words.join() != goal.data.words.join()
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
        <GoalHistory chosenGoals={this.state.goalHistory} />
        <GoalSelector />
        <GoalFuture suggestedGoals={this.state.goalSuggestions} />
      </div>
    );
  }
}
