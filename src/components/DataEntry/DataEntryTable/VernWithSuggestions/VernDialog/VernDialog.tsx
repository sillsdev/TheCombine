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
import { Word } from "../../../../../types/word";
import DomainCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import SenseCell from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import { parseWord } from "../../../../../goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

export function VernDialog(
  props: {
    vernacularWords: Word[];
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
        <VernList
          vernacularWords={props.vernacularWords}
          closeDialog={props.handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

interface VernListProps {
  vernacularWords: Word[];
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

export function VernList(props: VernListProps) {
  return (
    <React.Fragment>
      <h1>Select the desired entry</h1>
      <MenuList autoFocusItem>
        {props.vernacularWords.map((word: Word) => (
          <StyledMenuItem
            onClick={() => props.closeDialog(word.id)}
            key={word.id}
            id={word.id}
          >
            {<h4 style={{ margin: theme.spacing(2) }}>{word.vernacular}</h4>}
            <div style={{ margin: theme.spacing(4) }}>
              <SenseCell
                editable={false}
                sortingByGloss={false}
                value={parseWord(word).senses}
                rowData={parseWord(word)}
              />
            </div>
            <div style={{ margin: theme.spacing(4) }}>
              <DomainCell rowData={parseWord(word)} sortingByDomains={false} />
            </div>
          </StyledMenuItem>
        ))}

        <StyledMenuItem onClick={() => props.closeDialog("")}>
          {"New entry for " + props.vernacularWords[0].vernacular}
        </StyledMenuItem>
      </MenuList>
    </React.Fragment>
  );
}
export default withLocalize(VernDialog);
