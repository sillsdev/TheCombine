import { Button, TextField, Typography } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";

import CharacterReplaceDialog from "goals/CharInventoryCreation/components/CharacterDetail/FindAndReplace/CharacterReplaceDialog";

interface FindAndReplaceProps extends WithTranslation {
  initialFindValue: string;
  allWords: string[];
  findAndReplace: (findValue: string, replaceValue: string) => Promise<void>;
}

interface FindAndReplaceState {
  findValue: string;
  replaceValue: string;
  warningDialogOpen: boolean;
}

export class FindAndReplace extends React.Component<
  FindAndReplaceProps,
  FindAndReplaceState
> {
  constructor(props: FindAndReplaceProps) {
    super(props);
    this.state = {
      warningDialogOpen: false,
      findValue: props.initialFindValue,
      replaceValue: "",
    };
  }

  componentDidUpdate(prevProps: FindAndReplaceProps) {
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

    this.setState({ [field]: value } as Pick<FindAndReplaceState, K>);
  }

  render() {
    return (
      <React.Fragment>
        <Typography variant="overline">
          {this.props.t("charInventory.characterSet.findAndReplace")}
        </Typography>
        <TextField
          label={this.props.t("charInventory.characterSet.find")}
          value={this.state.findValue}
          onChange={(e) => this.updateField(e, "findValue")}
          variant="outlined"
          style={{ width: "100%" }}
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label={this.props.t("charInventory.characterSet.replaceWith")}
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
          {this.props.t("charInventory.characterSet.apply")}
        </Button>
        <CharacterReplaceDialog
          open={this.state.warningDialogOpen}
          dialogFindValue={this.state.findValue}
          dialogReplaceValue={this.state.replaceValue}
          handleCancel={() => {
            this.setState({ warningDialogOpen: false });
          }}
          handleAccept={async () => {
            await this.props.findAndReplace(
              this.state.findValue,
              this.state.replaceValue
            );
            this.setState({ warningDialogOpen: false });
          }}
        />
      </React.Fragment>
    );
  }
}

export default withTranslation()(FindAndReplace);
