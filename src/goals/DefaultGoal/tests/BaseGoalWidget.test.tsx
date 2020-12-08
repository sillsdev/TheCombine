import React from "react";
import ReactDOM from "react-dom";

import { Goal } from "../../../types/goals";
import { User } from "../../../types/user";
import { CreateCharInv } from "../../CreateCharInv/CreateCharInv";
import BaseGoalWidget from "../BaseGoalWidget";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const user = new User("TestUser", "TestUsername", "TestPass");
  const goal: Goal = new CreateCharInv();
  goal.user = user;
  ReactDOM.render(<BaseGoalWidget goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
