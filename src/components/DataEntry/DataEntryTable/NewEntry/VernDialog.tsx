import {
  Dialog,
  DialogContent,
  MenuItem,
  MenuList,
  Typography,
  withStyles,
} from "@material-ui/core";
import React from "react";
import {
  LocalizeContextProps,
  Translate,
  withLocalize,
} from "react-localize-redux";

import theme from "types/theme";
import { Word } from "types/word";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import SenseCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/SenseCell";
import { parseWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

export function VernDialog(
  props: {
    vernacularWords: Word[];
    open: boolean;
    handleClose: (selectedWordId?: string) => void;
    analysisLang: string;
  } & LocalizeContextProps
) {
  return (
    <Dialog
      open={props.open}
      onClose={() => props.handleClose()}
      disableBackdropClick
    >
      <DialogContent>
        <VernList
          vernacularWords={props.vernacularWords}
          closeDialog={props.handleClose}
          analysisLang={props.analysisLang}
        />
      </DialogContent>
    </Dialog>
  );
}

interface VernListProps {
  vernacularWords: Word[];
  closeDialog: (selectedWordId: string) => void;
  analysisLang: string;
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
      <Typography variant="h3">
        <Translate id="addWords.selectEntry" />
      </Typography>
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
                value={parseWord(word, props.analysisLang).senses}
                rowData={parseWord(word, props.analysisLang)}
              />
            </div>
            <div style={{ margin: theme.spacing(4) }}>
              <DomainCell
                rowData={parseWord(word, props.analysisLang)}
                sortingByDomains={false}
              />
            </div>
          </StyledMenuItem>
        ))}

        <StyledMenuItem onClick={() => props.closeDialog("")}>
          <Translate id="addWords.newEntryFor" />
          {props.vernacularWords[0].vernacular}
        </StyledMenuItem>
      </MenuList>
    </React.Fragment>
  );
}
export default withLocalize(VernDialog);
