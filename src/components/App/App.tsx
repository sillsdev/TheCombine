//external modules
import React from "react";

//TC modules
import Temp from "../Temp";
import Login from "../Login";
import CreateProject from "../CreateProject";
import { GoalView } from "../../goals/GoalView";

const App: React.FC = () => {
  return (
    <div className="App">
      <Temp />
      <CreateProject />
      <GoalView />
    </div>
  );
};

export default App;
