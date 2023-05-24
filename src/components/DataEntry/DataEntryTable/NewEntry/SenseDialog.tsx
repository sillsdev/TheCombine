import { Dialog, DialogContent, MenuList, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import theme from "types/theme";
import { firstGlossText } from "utilities/wordUtilities";

interface SenseDialogProps {
  selectedWord: Word;
  open: boolean;
  // Call handleClose with no input to indicate no selection was made.
  handleClose: (gloss?: string) => void;
  analysisLang: string;
}

export default function SenseDialog(props: SenseDialogProps): ReactElement {
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
  closeDialog: (gloss: string) => void;
  analysisLang: string;
}

export function SenseList(props: SenseListProps) {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h3">{t("addWords.selectSense")}</Typography>
      <MenuList autoFocusItem>
        {props.selectedWord.senses.map((sense) => {
          const gloss = firstGlossText(sense);
          return (
            <StyledMenuItem
              onClick={() => props.closeDialog(gloss)}
              key={gloss}
              id={gloss}
            >
              <div style={{ margin: theme.spacing(4) }}>
                <h3>{gloss}</h3>
              </div>
              <div style={{ margin: theme.spacing(4) }}>
                <DomainCell
                  rowData={
                    new ReviewEntriesWord(
                      { ...props.selectedWord, senses: [sense] },
                      props.analysisLang
                    )
                  }
                />
              </div>
            </StyledMenuItem>
          );
        })}

        <StyledMenuItem onClick={() => props.closeDialog("")}>
          {t("addWords.newSenseFor")}
          {props.selectedWord.vernacular}
        </StyledMenuItem>
      </MenuList>
    </>
  );
}
