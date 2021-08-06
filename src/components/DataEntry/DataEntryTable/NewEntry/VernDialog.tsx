import {
  Dialog,
  DialogContent,
  MenuItem,
  MenuList,
  Typography,
  withStyles,
} from "@material-ui/core";
import React from "react";
import { Translate } from "react-localize-redux";

import { Word } from "api/models";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import GlossCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/GlossCell";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import theme from "types/theme";

interface vernDialogProps {
  vernacularWords: Word[];
  open: boolean;
  handleClose: (selectedWordId?: string) => void;
  analysisLang?: string;
}

export default function VernDialog(props: vernDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          props.handleClose();
        }
      }}
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
  analysisLang?: string;
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
        {props.vernacularWords.map((word) => (
          <StyledMenuItem
            onClick={() => props.closeDialog(word.id)}
            key={word.id}
            id={word.id}
          >
            {<h4 style={{ margin: theme.spacing(2) }}>{word.vernacular}</h4>}
            <div style={{ margin: theme.spacing(4) }}>
              <GlossCell
                value={new ReviewEntriesWord(word, props.analysisLang).senses}
                rowData={new ReviewEntriesWord(word, props.analysisLang)}
              />
            </div>
            <div style={{ margin: theme.spacing(4) }}>
              <DomainCell
                rowData={new ReviewEntriesWord(word, props.analysisLang)}
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
