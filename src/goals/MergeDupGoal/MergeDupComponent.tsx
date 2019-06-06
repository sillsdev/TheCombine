import * as React from "react";
import { LocalizeContextProps } from "react-localize-redux";
import { Goal, DefaultDisplay } from "../../types/goals";

//interface for component state
interface MergeDupState {}

//interface for component state
interface MergeDupProps {
  goal: Goal;
}

class MergeDupComponent extends React.Component<
  MergeDupProps & LocalizeContextProps,
  MergeDupState
> {
  constructor(props: MergeDupProps & LocalizeContextProps) {
    super(props);

    this.props.goal.display = DefaultDisplay;
  }
}
