//external modules
import React from "react";

//TC modules
import CreateProject from "../CreateProject";
import { GoalView } from "../GoalView/GoalView";

const App: React.FC = () => {
  return (
    <div className="App">
      <CreateProject />
      <GoalView />
    </div>
  );
};

export default App;
