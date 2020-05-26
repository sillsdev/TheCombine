import * as React from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import {
  withLocalize,
  LocalizeContextProps,
  Translate,
} from "react-localize-redux";

export interface FindAndReplaceProps {
  initialFindValue: string;
  allWords: string[];
  findAndReplace: (findValue: string, replaceValue: string) => void;
}

export interface FindAndReplaceState {
  findValue: string;
  replaceValue: string;
}

export class FindAndReplace extends React.Component<
  FindAndReplaceProps & LocalizeContextProps,
  FindAndReplaceState
> {
  constructor(props: FindAndReplaceProps & LocalizeContextProps) {
    super(props);
    this.state = {
      findValue: props.initialFindValue,
      replaceValue: "",
    };
  }

  componentDidUpdate(prevProps: FindAndReplaceProps & LocalizeContextProps) {
    if (prevProps.initialFindValue !== this.props.initialFindValue)
      this.setState({
        findValue: this.props.initialFindValue,
        replaceValue: "",
      });
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
      [field]: value,
    } as Pick<FindAndReplaceState, K>);
  }

  render() {
    return (
      <React.Fragment>
        <Typography variant="overline">Find + Replace</Typography>
        <TextField
          label={<Translate id="charInventory.characterSet.find" />}
          value={this.state.findValue}
          onChange={(e) => this.updateField(e, "findValue")}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label={<Translate id="charInventory.characterSet.replace" />}
          value={this.state.replaceValue}
          onChange={(e) => this.updateField(e, "replaceValue")}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        <Button
          color="primary"
          onClick={() =>
            this.props.findAndReplace(
              this.state.findValue,
              this.state.replaceValue
            )
          }
        >
          <Translate id="charInventory.characterSet.apply" />
        </Button>
      </React.Fragment>
    );
  }
}

export default withLocalize(FindAndReplace);
