import {
  Dialog,
  DialogContent,
  Grid,
  MenuList,
  Typography,
} from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, Sense, Word } from "api/models";
import { CloseButton } from "components/Buttons";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import {
  Domains,
  PartOfSpeech,
} from "goals/ReviewEntries/ReviewEntriesTable/Cells";
import { firstGlossText } from "utilities/wordUtilities";

interface SenseDialogProps {
  selectedWord: Word;
  open: boolean;
  // Call handleClose with no input to indicate no selection was made.
  handleClose: (guid?: string) => void;
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
  closeDialog: (guid?: string) => void;
  analysisLang: string;
}

export function SenseList(props: SenseListProps): ReactElement {
  const { t } = useTranslation();

  const hasPartsOfSpeech = !!props.selectedWord.senses.find(
    (s) => s.grammaticalInfo.catGroup !== GramCatGroup.Unspecified
  );

  const menuItem = (sense: Sense): ReactElement => {
    const word: Word = { ...props.selectedWord, senses: [sense] };
    const gloss = firstGlossText(sense);
    return (
      <StyledMenuItem
        id={sense.guid}
        key={sense.guid}
        onClick={() => props.closeDialog(sense.guid)}
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
              <PartOfSpeech word={word} />
            </Grid>
          )}
          <Grid item xs>
            <Domains word={word} />
          </Grid>
        </Grid>
      </StyledMenuItem>
    );
  };

  const menuItems = props.selectedWord.senses.map(menuItem);
  menuItems.push(
    <StyledMenuItem key="new-sense" onClick={() => props.closeDialog("")}>
      {t("addWords.newSenseFor")}
      {props.selectedWord.vernacular}
    </StyledMenuItem>
  );

  return (
    <>
      {/* Cancel button */}
      <CloseButton close={() => props.closeDialog()} />
      {/* Header */}
      <Typography variant="h3">{t("addWords.selectSense")}</Typography>
      {/* Sense options */}
      <MenuList autoFocusItem>{menuItems}</MenuList>
    </>
  );
}
