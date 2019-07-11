import React from "react";
import ReactDOM from "react-dom";
import { User } from "../../../../types/user";
import { Goal } from "../../../../types/goals";
import BaseGoalWidget from "../BaseGoalWidget";
import { CreateCharInv } from "../../../CreateCharInv/CreateCharInv";

it("renders without crashing", () => {
  const div = document.createElement("div");
  let user: User = new User("TestUser", "TestUsername", "password");
  let goal: Goal = new CreateCharInv();
  goal.user = user;
  ReactDOM.render(<BaseGoalWidget goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
