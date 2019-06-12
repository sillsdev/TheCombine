import React from "react";
import { User } from "../../types/user";
import { Goal, Tools, GoalOption, GoalsState } from "../../types/goals";
import BaseGoalScreen from "../../goals/DefaultGoal/BaseGoalScreen/BaseGoalScreen";
import BaseGoalSelect from "../../goals/DefaultGoal/BaseGoalSelect/BaseGoalSelect";
import Stack from "../../types/stack";
import { BaseGoal } from "../../types/baseGoal";

const tempUser: User = {
  name: "Chewbacca",
  username: "WUUAHAHHHAAAAAAAAAA",
  id: 1
};

let goal1: Goal = {
  id: 1,
  name: "handleDuplicates",
  user: tempUser,
  display: <BaseGoalScreen goal={new BaseGoal()} />,
  goalWidget: <BaseGoalSelect goal={new BaseGoal()} />,
  steps: [],
  curNdx: -1,
  data: {},
  tool: Tools.TempTool,
  completed: false,
  result: GoalOption.Current
};

goal1.display = <BaseGoalScreen goal={goal1} />; // goal1 has to be instantiated first
goal1.goalWidget = <BaseGoalSelect goal={goal1} />; // goal1 has to be instantiated first

let goal2: Goal = {
  id: 2,
  name: "handleFlags",
  user: tempUser,
  display: <BaseGoalScreen goal={new BaseGoal()} />,
  goalWidget: <BaseGoalSelect goal={new BaseGoal()} />,
  steps: [],
  curNdx: -1,
  data: {},
  tool: Tools.TempTool,
  completed: false,
  result: GoalOption.Current
};

goal2.display = <BaseGoalScreen goal={goal2} />;
goal2.goalWidget = <BaseGoalSelect goal={goal2} />;

let goal3: Goal = {
  id: 3,
  name: "grammarCheck",
  user: tempUser,
  display: <BaseGoalScreen goal={new BaseGoal()} />,
  goalWidget: <BaseGoalSelect goal={new BaseGoal()} />,
  steps: [],
  curNdx: -1,
  data: {},
  tool: Tools.TempTool,
  completed: false,
  result: GoalOption.Current
};

goal3.display = <BaseGoalScreen goal={goal3} />;
goal3.goalWidget = <BaseGoalSelect goal={goal3} />;

let allTheGoals: Goal[] = [goal1, goal2, goal3];

let suggestion1: Goal = {
  id: 4,
  name: "handleDuplicates",
  user: tempUser,
  display: <BaseGoalScreen goal={new BaseGoal()} />,
  goalWidget: <BaseGoalSelect goal={new BaseGoal()} />,
  steps: [],
  curNdx: -1,
  data: {},
  tool: Tools.TempTool,
  completed: false,
  result: GoalOption.Current
};

suggestion1.display = <BaseGoalScreen goal={suggestion1} />;
suggestion1.goalWidget = <BaseGoalSelect goal={suggestion1} />;

let suggestion2: Goal = {
  id: 5,
  name: "grammarCheck",
  user: tempUser,
  display: <BaseGoalScreen goal={new BaseGoal()} />,
  goalWidget: <BaseGoalSelect goal={new BaseGoal()} />,
  steps: [],
  curNdx: -1,
  data: {},
  tool: Tools.TempTool,
  completed: false,
  result: GoalOption.Current
};

suggestion2.display = <BaseGoalScreen goal={suggestion2} />;
suggestion2.goalWidget = <BaseGoalSelect goal={suggestion2} />;

let suggestionsArray: Goal[] = [suggestion1, suggestion2];

export const defaultState: GoalsState = {
  historyState: {
    history: new Stack<Goal>([])
  },
  goalOptions: allTheGoals,
  suggestionsState: {
    suggestions: new Stack<Goal>(suggestionsArray)
  }
};
