import React from "react";
import ReactDOM from "react-dom";
import DisplayProg from "../displayProg";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<DisplayProg currentStep={1} numSteps={2} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
