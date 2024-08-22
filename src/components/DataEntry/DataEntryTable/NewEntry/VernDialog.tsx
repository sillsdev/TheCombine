import {
  Dialog,
  DialogContent,
  Grid,
  MenuList,
  Typography,
} from "@mui/material";
import { Fragment, type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, type Word } from "api/models";
import { CloseButton } from "components/Buttons";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import DomainsCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/DomainsCell";
import GlossesCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/GlossesCell";
import PartOfSpeechCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/PartOfSpeechCell";

interface vernDialogProps {
  vernacularWords: Word[];
  open: boolean;
  // Call handleClose with no input to indicate no selection was made.
  handleClose: (selectedWordId?: string) => void;
  analysisLang?: string;
}

export default function VernDialog(props: vernDialogProps): ReactElement {
  if (!props.vernacularWords.length) {
    return <Fragment />;
  }

  return (
    <Dialog
      disableRestoreFocus
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
          vernacular={props.vernacularWords[0].vernacular}
          vernacularWords={props.vernacularWords}
          closeDialog={props.handleClose}
          analysisLang={props.analysisLang}
        />
      </DialogContent>
    </Dialog>
  );
}

interface VernListProps {
  vernacular: string;
  vernacularWords: Word[];
  closeDialog: (wordId?: string) => void;
  analysisLang?: string;
}

export function VernList(props: VernListProps): ReactElement {
  const { t } = useTranslation();

  const hasPartsOfSpeech = props.vernacularWords.some((w) =>
    w.senses.some(
      (s) => s.grammaticalInfo.catGroup !== GramCatGroup.Unspecified
    )
  );

  const menuItem = (word: Word): ReactElement => {
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
            <GlossesCell word={word} />
          </Grid>
          {hasPartsOfSpeech && (
            <Grid item xs="auto">
              <PartOfSpeechCell word={word} />
            </Grid>
          )}
          <Grid item xs>
            <DomainsCell word={word} />
          </Grid>
        </Grid>
      </StyledMenuItem>
    );
  };

  const menuItems = props.vernacularWords.map(menuItem);
  menuItems.push(
    <StyledMenuItem key="new-entry" onClick={() => props.closeDialog("")}>
      {t("addWords.newEntryFor")}
      {props.vernacular}
    </StyledMenuItem>
  );

  return (
    <>
      {/* Cancel button */}
      <CloseButton close={() => props.closeDialog()} />
      {/* Header */}
      <Typography variant="h3">{t("addWords.selectEntry")}</Typography>
      {/* Entry options */}
      <MenuList autoFocusItem>{menuItems}</MenuList>
    </>
  );
}
