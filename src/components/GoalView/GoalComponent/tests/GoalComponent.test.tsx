import React from "react";
import ReactDOM from "react-dom";
import { Goal } from "../GoalComponent";
import { TempGoal } from "../../../../goals/tempGoal";
import { User } from "../../../../types/user";
import { Goals } from "../../../../types/goals";

it("renders without crashing", () => {
  const div = document.createElement("div");
  let user: User = { name: "TestUser", username: "TestUsername", id: 0 };
  let goal: Goals = new TempGoal(user);
  ReactDOM.render(<Goal goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
