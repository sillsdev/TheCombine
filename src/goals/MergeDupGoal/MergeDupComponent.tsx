import * as React from "react";
import { LocalizeContextProps } from "react-localize-redux";
import { Goal } from "../../types/goals";

//interface for component state
interface MergeDupState {}

//interface for component state
export interface MergeDupProps {
  goal: Goal;
}

class MergeDupComponent extends React.Component<
  MergeDupProps & LocalizeContextProps,
  MergeDupState
> {
  constructor(props: MergeDupProps & LocalizeContextProps) {
    super(props);
  }
}
