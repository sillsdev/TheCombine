import { Dialog, DialogContent, MenuList, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { Word } from "api/models";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import DomainCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/DomainCell";
import GlossCell from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents/GlossCell";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
import theme from "types/theme";

interface vernDialogProps {
  vernacularWords: Word[];
  open: boolean;
  // Call handleClose with no input to indicate no selection was made.
  handleClose: (selectedWordId?: string) => void;
  analysisLang?: string;
}

export default function VernDialog(props: vernDialogProps): ReactElement {
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
  closeDialog: (wordId: string) => void;
  analysisLang?: string;
}

export function VernList(props: VernListProps) {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="h3">{t("addWords.selectEntry")}</Typography>
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
          {t("addWords.newEntryFor")}
          {props.vernacularWords[0].vernacular}
        </StyledMenuItem>
      </MenuList>
    </>
  );
}
