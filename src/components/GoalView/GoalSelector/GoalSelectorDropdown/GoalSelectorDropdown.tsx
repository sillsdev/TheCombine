import React from "react";

import { Goal } from "../../../../types/goals";
import Select from "@material-ui/core/Select";
import { FormControl, MenuItem } from "@material-ui/core";

export interface GoalSelectorDropdownProps {
  goalOptions: Goal[];
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
            {this.props.goalOptions.map(goal => (
              <MenuItem key={goal.id} value={goal.name}>
                {goal.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </form>
    );
  }
}
