import React from "react";
import ReactDOM from "react-dom";

import { User } from "types/user";
import { Goal } from "types/goals";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import BaseGoalWidget from "goals/DefaultGoal/BaseGoalWidget/BaseGoalWidget";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const user: User = new User("TestUser", "TestUsername", "TestPass");
  const goal: Goal = new CreateCharInv();
  goal.user = user;
  ReactDOM.render(<BaseGoalWidget goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
