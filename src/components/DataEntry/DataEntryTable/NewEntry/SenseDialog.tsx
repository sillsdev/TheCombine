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
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import theme from "types/theme";

interface SenseDialogProps {
  selectedWord: Word;
  open: boolean;
  handleClose: (senseIndex?: number) => void;
  analysisLang: string;
}

export default function SenseDialog(props: SenseDialogProps) {
  return (
    <Dialog
      open={props.open}
      disableBackdropClick
      onClose={() => props.handleClose()}
    >
      <DialogContent>
        <SenseList
          selectedWord={props.selectedWord}
          closeDialog={props.handleClose}
          analysisLang={props.analysisLang}
        />
      </DialogContent>
    </Dialog>
  );
}

interface SenseListProps {
  selectedWord: Word;
  closeDialog: (senseIndex: number) => void;
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

export function SenseList(props: SenseListProps) {
  return (
    <React.Fragment>
      <Typography variant="h3">
        <Translate id="addWords.selectSense" />
      </Typography>
      <MenuList autoFocusItem>
        {props.selectedWord.senses.map((sense, index) => (
          <StyledMenuItem
            onClick={() => props.closeDialog(index)}
            key={sense.glosses[0].def}
            id={sense.glosses[0].def}
          >
            <div style={{ margin: theme.spacing(4) }}>
              <h3>{sense.glosses[0].def}</h3>
            </div>
            <div style={{ margin: theme.spacing(4) }}>
              <DomainCell
                rowData={
                  new ReviewEntriesWord(
                    {
                      ...props.selectedWord,
                      senses: [sense],
                    },
                    props.analysisLang
                  )
                }
                sortingByDomains={false}
              />
            </div>
          </StyledMenuItem>
        ))}

        <StyledMenuItem onClick={() => props.closeDialog(-1)}>
          <Translate id="addWords.newSenseFor" />
          {props.selectedWord.vernacular}
        </StyledMenuItem>
      </MenuList>
    </React.Fragment>
  );
}
