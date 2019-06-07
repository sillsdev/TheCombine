import React from "react";
import ReactDOM from "react-dom";
import GoalComponent from "../GoalComponent";
import { TempGoal } from "../../../../goals/tempGoal";
import { User } from "../../../../types/user";
import { Goal } from "../../../../types/goals";

it("renders without crashing", () => {
  const div = document.createElement("div");
  let user: User = { name: "TestUser", username: "TestUsername", id: 0 };
  let goal: Goal = new TempGoal(user);
  ReactDOM.render(<GoalComponent goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
