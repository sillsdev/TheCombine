import { Goal } from "../../types/goals";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import LinearProgress from "@material-ui/core/LinearProgress";

class BaseGoalScreen extends React.Component<Goal & LocalizeContextProps> {
  constructor(props: Goal & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <this.DisplayHeader />
        <this.DisplayProg />
        {this.props.steps[this.props.curNdx].render}
      </div>
    );
  }

  DisplayHeader: React.FC = () => {
    return (
      <div>
        <h1>{this.props.name}</h1>
      </div>
    );
  };

  DisplayProg: React.FC = () => {
    return (
      <div>
        <LinearProgress
          value={((this.props.curNdx + 1) / this.props.steps.length) * 100}
        />
      </div>
    );
  };
}

export default withLocalize(BaseGoalScreen);
