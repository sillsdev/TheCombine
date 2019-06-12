import React from "react";
import ReactDOM from "react-dom";
import { BaseGoal } from "../../../../types/baseGoal";
import { User } from "../../../../types/user";
import { Goal } from "../../../../types/goals";
import BaseGoalSelect from "../BaseGoalSelect";

it("renders without crashing", () => {
  const div = document.createElement("div");
  let user: User = { name: "TestUser", username: "TestUsername", id: 0 };
  let goal: Goal = new BaseGoal();
  goal.user = user;
  ReactDOM.render(<BaseGoalSelect goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
