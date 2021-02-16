import ReactDOM from "react-dom";

import GoalWidget from "components/GoalTimeline/GoalHistory/GoalWidget";
import { CreateCharInv } from "goals/CreateCharInv/CreateCharInv";
import { User } from "types/user";

it("renders without crashing", () => {
  const div = document.createElement("div");
  const user = new User("TestUser", "TestUsername", "TestPass");
  const goal = new CreateCharInv();
  goal.user = user;
  ReactDOM.render(<GoalWidget goal={goal} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
