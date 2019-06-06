import React from "react";

import GoalHistory from "./GoalHistory";
import GoalSelector from "./GoalSelector";
import GoalFuture from "./GoalFuture";
import { Goals } from "../../types/goals";
import Stack from "../../types/stack";

export interface GoalViewProps {}

export interface GoalViewState {
  goalHistory: Stack<Goals>;
  all: Goals[];
  goalSuggestions: Stack<Goals>;
}

export class GoalView extends React.Component<GoalViewProps, GoalViewState> {
  constructor(props: GoalViewProps) {
    super(props);
    this.state = {
      goalHistory: new Stack<Goals>([]),
      all: [],
      goalSuggestions: new Stack<Goals>([])
    };

    // this.addGoal = this.addGoal.bind(this);
  }

  // addGoal(goal: Goals) {
  //   this.addToHistory(goal);
  //   this.removeGoalFromFuture(goal);
  // }

  // addToHistory(goal: Goals) {
  //   this.state.goalHistory.push(goal);
  //   this.setState({
  //     goalHistory: this.state.goalHistory,
  //     goalSuggestions: this.state.goalSuggestions
  //   });
  // }

  // removeGoalFromFuture(goal: Goals) {
  //   let nextSuggestion = this.state.goalSuggestions.peekFirst();
  //   if (
  //     nextSuggestion &&
  //     nextSuggestion.data.words.join() === goal.data.words.join()
  //   ) {
  //     let newSuggestions = new Stack<Goals>(
  //       this.state.goalSuggestions.stack.filter(
  //         goal => nextSuggestion.data.words.join() != goal.data.words.join()
  //       )
  //     );
  //     this.setState({
  //       goalHistory: this.state.goalHistory,
  //       goalSuggestions: newSuggestions
  //     });
  //   }
  // }

  render() {
    return (
      <div className="GoalView">
        <GoalHistory />
        <GoalSelector />
        <GoalFuture />
      </div>
    );
  }
}
