import React from "react";

import { Goal } from "../../../../types/goals";
import Select from "@material-ui/core/Select";
import { FormControl, MenuItem } from "@material-ui/core";
import {
  withLocalize,
  LocalizeContextProps,
  Translate
} from "react-localize-redux";

export interface GoalSelectorDropdownProps {
  goalOptions: Goal[];
  handleChange: (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => void;
}

export class GoalSelectorDropdown extends React.Component<
  GoalSelectorDropdownProps & LocalizeContextProps
> {
  constructor(props: GoalSelectorDropdownProps & LocalizeContextProps) {
    super(props);
  }

  render() {
    return (
      <form autoComplete="off">
        <FormControl>
          <Select onChange={this.props.handleChange} value={""}>
            {this.props.goalOptions.map(goal => (
              <MenuItem key={goal.id} value={goal.name}>
                <goal.select />
                {/* <Translate id={"goal.name." + goal.name} /> */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </form>
    );
  }
}

export default withLocalize(GoalSelectorDropdown);
