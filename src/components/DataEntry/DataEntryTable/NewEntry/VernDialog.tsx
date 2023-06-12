import {
  Dialog,
  DialogContent,
  Divider,
  Grid,
  MenuList,
  Typography,
} from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, Word } from "api/models";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import {
  DomainCell,
  GlossCell,
  PartOfSpeechCell,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";

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
      maxWidth={false}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          props.handleClose();
        }
      }}
      open={props.open}
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

  const hasPartsOfSpeech = !!props.vernacularWords.find((w) =>
    w.senses.find(
      (s) => s.grammaticalInfo.catGroup !== GramCatGroup.Unspecified
    )
  );

  const menuItem = (word: Word): ReactElement => {
    const entry = new ReviewEntriesWord(word, props.analysisLang);
    return (
      <StyledMenuItem
        id={word.id}
        key={word.id}
        onClick={() => props.closeDialog(word.id)}
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={5}
        >
          <Grid item xs="auto">
            <Typography variant="h5">{word.vernacular}</Typography>
          </Grid>
          <Grid item xs="auto">
            <GlossCell rowData={entry} value={entry.senses} />
          </Grid>
          {hasPartsOfSpeech && (
            <Grid item xs="auto">
              <PartOfSpeechCell rowData={entry} />
            </Grid>
          )}
          <Grid item xs>
            <DomainCell rowData={entry} />
          </Grid>
        </Grid>
      </StyledMenuItem>
    );
  };

  const menuItems: ReactElement[] = [];
  for (const w of props.vernacularWords) {
    menuItems.push(menuItem(w));
    menuItems.push(<Divider key={`${w.id}-divider`} />);
  }
  menuItems.push(
    <StyledMenuItem key="new-entry" onClick={() => props.closeDialog("")}>
      {t("addWords.newEntryFor")}
      {props.vernacularWords[0].vernacular}
    </StyledMenuItem>
  );

  return (
    <>
      <Typography variant="h3">{t("addWords.selectEntry")}</Typography>
      <MenuList autoFocusItem>{menuItems}</MenuList>
    </>
  );
}
