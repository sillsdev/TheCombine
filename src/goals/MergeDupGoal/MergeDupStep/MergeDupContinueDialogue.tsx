import { Button, Dialog, DialogActions, DialogTitle } from "@material-ui/core";
import React, { ReactElement } from "react";
import { Translate } from "react-localize-redux";

export interface ContinuePromptDialogueProps {
  onSelection: (shouldContinue: boolean) => void;
}

export function MergeDupContinueDialogue(
  props: ContinuePromptDialogueProps
): ReactElement {
  const [open, setOpen] = React.useState<boolean>(true);
  const { onSelection } = props;

  const handleYes = () => {
    setOpen(false);
    onSelection(true);
  };

  const handleNo = () => {
    setOpen(false);
    onSelection(false);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>{"Continue merging?"}</DialogTitle>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={handleYes}
          autoFocus
        >
          <Translate id="charInventory.dialog.yes" />
        </Button>
        <Button color="secondary" variant="contained" onClick={handleNo}>
          <Translate id="charInventory.dialog.no" />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
