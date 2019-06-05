import React from "react";

import { Goals } from "../types/goals";
import { TempGoal } from "./tempGoal";
import { User } from "../types/user";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from "@material-ui/core/Select";
import {
  FormControlLabel,
  DialogContent,
  FormControl,
  MenuItem,
  Button
} from "@material-ui/core";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";

const tempUser: User = {
  name: "Chewbacca",
  username: "WUUAHAHHHAAAAAAAAAA",
  id: 1
};

let allTheGoals: Goals[] = [];
let goal1: Goals = new TempGoal(tempUser);
let goal1Message = "A goal";
goal1.data = { words: goal1Message.split(" "), step: 1 };
let goal2: Goals = new TempGoal(tempUser);
let goal2Message = "Another goal";
goal2.data = { words: goal2Message.split(" "), step: 2 };
allTheGoals.push(goal1);
allTheGoals.push(goal2);

export interface SimpleDialogProps {
  open: boolean;
  possibleGoals: Array<Goals>;
}

export class SimpleDialog extends React.Component<SimpleDialogProps> {
  constructor(props: SimpleDialogProps) {
    super(props);
  }

  render() {
    return (
      <Dialog open={this.props.open}>
        <DialogTitle id="Goal">Choose Goal</DialogTitle>
        <DialogContent dividers>
          <RadioGroup>
            {this.props.possibleGoals.map(goal => (
              <FormControlLabel
                value={goal.data.step}
                key={goal.data.step}
                control={<Radio />}
                label={goal.data.step}
              />
            ))}
          </RadioGroup>
        </DialogContent>
      </Dialog>
    );
  }
}

export interface GoalSelectorDropdownProps {
  possibleGoals: Array<Goals>;
  handleChange: (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void;
}

export interface GoalSelectorDropdownState {
  value: string;
}

export class GoalSelectorDropdown extends React.Component<
  GoalSelectorDropdownProps,
  GoalSelectorDropdownState
> {
  constructor(props: GoalSelectorDropdownProps) {
    super(props);

    this.state = {
      value: "None"
    };
  }

  render() {
    return (
      <form autoComplete="off">
        <FormControl>
          <Select value={this.state.value} onChange={this.props.handleChange}>
            {this.props.possibleGoals.map(goal => (
              <MenuItem key={goal.name} value={goal.name}>
                {goal.data.words}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </form>
    );
  }
}

export interface GoalSelectorProps {
  addToHistory: (goal: Goals) => void;
}

export interface GoalSelectorState {}

export class GoalSelector extends React.Component<
  GoalSelectorProps,
  GoalSelectorState
> {
  constructor(props: GoalSelectorProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event: React.ChangeEvent<{ name?: string; value: unknown }>) {
    let theGoal: Goals = new TempGoal(tempUser);
    theGoal.data = {
      words: (event.target.value as string).split(" "),
      step: 1
    };
    this.props.addToHistory(theGoal);
  }

  render() {
    return (
      <div className="GoalPicker">
        <GoalSelectorDropdown
          handleChange={this.handleChange}
          possibleGoals={allTheGoals}
        />
      </div>
    );
  }
}
