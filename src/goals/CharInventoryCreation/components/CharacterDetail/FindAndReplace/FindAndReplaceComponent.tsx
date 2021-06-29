import { Button, TextField, Typography } from "@material-ui/core";
import React from "react";
import { LocalizeContextProps, withLocalize } from "react-localize-redux";
import CharacterReplaceDialog from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace/CharacterReplaceDialog";

interface FindAndReplaceProps {
  initialFindValue: string;
  allWords: string[];
  findAndReplace: (findValue: string, replaceValue: string) => void;
}

interface FindAndReplaceState {
  findValue: string;
  replaceValue: string;
  warningDialogOpen: boolean;
}

export class FindAndReplace extends React.Component<
  FindAndReplaceProps & LocalizeContextProps,
  FindAndReplaceState
> {
  constructor(props: FindAndReplaceProps & LocalizeContextProps) {
    super(props);
    this.state = {
      warningDialogOpen: false,
      findValue: props.initialFindValue,
      replaceValue: "",
    };
  }

  componentDidUpdate(prevProps: FindAndReplaceProps & LocalizeContextProps) {
    if (prevProps.initialFindValue !== this.props.initialFindValue) {
      this.setState((_, props) => ({
        findValue: props.initialFindValue,
        replaceValue: "",
      }));
    }
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
        <Typography variant="overline">
          {this.props.translate("charInventory.characterSet.findAndReplace")}
        </Typography>
        <TextField
          label={this.props.translate("charInventory.characterSet.find")}
          value={this.state.findValue}
          onChange={(e) => this.updateField(e, "findValue")}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label={this.props.translate("charInventory.characterSet.replaceWith")}
          value={this.state.replaceValue}
          onChange={(e) => this.updateField(e, "replaceValue")}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        <Button
          color="primary"
          onClick={() => {
            this.setState({ warningDialogOpen: true });
          }}
        >
          {this.props.translate("charInventory.characterSet.apply")}
        </Button>
        <CharacterReplaceDialog
          open={this.state.warningDialogOpen}
          dialogFindValue={this.state.findValue}
          dialogReplaceValue={this.state.replaceValue}
          handleCancel={() => {
            this.setState({ warningDialogOpen: false });
          }}
          handleAccept={() => {
            this.setState({ warningDialogOpen: false });
            this.props.findAndReplace(
              this.state.findValue,
              this.state.replaceValue
            );
          }}
        />
      </React.Fragment>
    );
  }
}

export default withLocalize(FindAndReplace);
