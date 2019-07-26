import * as React from "react";
import { Typography, TextField } from "@material-ui/core";
import { ArrowRightAlt } from "@material-ui/icons";
import {
  withLocalize,
  LocalizeContextProps,
  Translate
} from "react-localize-redux";

export interface FindAndReplaceProps {
  initialFindValue: string;
  allWords: string[];
}

export interface FindAndReplaceState {
  find: string;
  replace: string;
}

export class FindAndReplace extends React.Component<
  FindAndReplaceProps & LocalizeContextProps,
  FindAndReplaceState
> {
  constructor(props: FindAndReplaceProps & LocalizeContextProps) {
    super(props);
    this.state = {
      find: props.initialFindValue,
      replace: ""
    };
  }

  /** Updates the state to match the value in a textbox */
  updateField<K extends keyof FindAndReplaceState>(
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >,
    field: K
  ) {
    const value = e.target.value;

    this.setState({
      [field]: value
    } as Pick<FindAndReplaceState, K>);
  }

  render() {
    return (
      <React.Fragment>
        <TextField
          required
          autoFocus
          autoComplete="name"
          label={<Translate id="login.name" />}
          value={this.state.find}
          onChange={e => this.updateField(e, "find")}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
      </React.Fragment>
    );
  }
}

export default withLocalize(FindAndReplace);
