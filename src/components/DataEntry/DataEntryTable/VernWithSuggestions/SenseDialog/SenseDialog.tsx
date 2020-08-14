import {
  Dialog,
  DialogContent,
  withStyles,
  MenuItem,
  MenuList,
} from "@material-ui/core";
import React from "react";
import { withLocalize, LocalizeContextProps } from "react-localize-redux";

import theme from "../../../../../types/theme";
import { Word, Sense } from "../../../../../types/word";
import DomainCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import SenseCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import { parseWord } from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

export function SenseDialog(
  props: {
    selectedVernacular: Word;
    open: boolean;
    handleClose: (selectedWordId?: string) => void;
  } & LocalizeContextProps
) {
  return (
    <Dialog
      open={props.open}
      onClose={() => props.handleClose()}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <DialogContent>
        <SenseList
          selectedVernacular={props.selectedVernacular}
          closeDialog={props.handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

interface SenseListProps {
  selectedVernacular: Word;
  closeDialog: (selectedWordId: string) => void;
}

// Copied from customized menus at https://material-ui.com/components/menus/
export const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:focus": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

export function SenseList(props: SenseListProps) {
  return (
    <React.Fragment>
      <h1>Select the desired sense</h1>
      <MenuList autoFocusItem>
        {props.selectedVernacular.senses.map((sense: Sense) => (
          <StyledMenuItem
            onClick={() => props.closeDialog(word.id)}
            key={sense.glosses[0].def}
            id={sense.glosses[0].def}
          >
            <div style={{ margin: theme.spacing(4) }}>
              {sense.glosses[0].def}
            </div>
            <div style={{ margin: theme.spacing(4) }}>Semantic Domains</div>
          </StyledMenuItem>
        ))}

        <StyledMenuItem onClick={() => props.closeDialog("")}>
          {"New Sense for " + props.selectedVernacular.vernacular}
        </StyledMenuItem>
      </MenuList>
    </React.Fragment>
  );
}
export default withLocalize(SenseDialog);
