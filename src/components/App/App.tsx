//external modules
import React from "react";

//TC modules
import Temp from "../Temp";
import Login from "../Login";
import CreateProject from "../CreateProject";

const App: React.FC = () => {
  return (
    <div className="App">
      <Temp />
      <CreateProject />
    </div>
  );
};

export default App;
