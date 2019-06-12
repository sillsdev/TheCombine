import React from "react";
import ReactDOM from "react-dom";
import { User } from "../../../../../types/user";
import { Goal } from "../../../../../types/goals";
import DisplayHeader from "../displayHeader";
import { CreateCharInv } from "../../../../CreateCharInv/CreateCharInv";

it("renders without crashing", () => {
  const div = document.createElement("div");
  let user: User = { name: "TestUser", username: "TestUsername", id: 0 };
  let goal: Goal = new CreateCharInv([]);
  goal.user = user;
  ReactDOM.render(<DisplayHeader goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
