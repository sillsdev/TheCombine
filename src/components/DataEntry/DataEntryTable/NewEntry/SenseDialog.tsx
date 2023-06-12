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

import { GramCatGroup, Sense, Word } from "api/models";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import {
  DomainCell,
  PartOfSpeechCell,
} from "goals/ReviewEntries/ReviewEntriesComponent/CellComponents";
import { ReviewEntriesWord } from "goals/ReviewEntries/ReviewEntriesComponent/ReviewEntriesTypes";
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
      maxWidth={false}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          props.handleClose();
        }
      }}
      open={props.open}
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

  const hasPartsOfSpeech = !!props.selectedWord.senses.find(
    (s) => s.grammaticalInfo.catGroup !== GramCatGroup.Unspecified
  );

  const menuItem = (sense: Sense): ReactElement => {
    const entry = new ReviewEntriesWord(
      { ...props.selectedWord, senses: [sense] },
      props.analysisLang
    );
    const gloss = firstGlossText(sense);
    return (
      <StyledMenuItem
        id={sense.guid}
        key={sense.guid}
        onClick={() => props.closeDialog(gloss)}
      >
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={5}
        >
          <Grid item xs="auto">
            <Typography variant="h5">{gloss}</Typography>
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
  for (const s of props.selectedWord.senses) {
    menuItems.push(menuItem(s));
    menuItems.push(<Divider key={`${s.guid}-divider`} />);
  }
  menuItems.push(
    <StyledMenuItem key="new-sense" onClick={() => props.closeDialog("")}>
      {t("addWords.newSenseFor")}
      {props.selectedWord.vernacular}
    </StyledMenuItem>
  );

  return (
    <>
      <Typography variant="h3">{t("addWords.selectSense")}</Typography>
      <MenuList autoFocusItem>{menuItems}</MenuList>
    </>
  );
}
