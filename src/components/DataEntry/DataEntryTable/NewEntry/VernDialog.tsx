import {
  Dialog,
  DialogContent,
  Grid,
  ListItemText,
  MenuList,
  Typography,
} from "@mui/material";
import { Fragment, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, type Word } from "api/models";
import { CloseButton } from "components/Buttons";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import DefinitionsCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/DefinitionsCell";
import DomainsCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/DomainsCell";
import GlossesCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/GlossesCell";
import PartOfSpeechCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/PartOfSpeechCell";
import { firstGlossText } from "utilities/wordUtilities";

interface VernDialogProps {
  vernacularWords: Word[];
  open: boolean;
  /** Call handleClose with no input to indicate no selection was made.
   * An empty string for selectedWordId indicates a new entry should be created.
   * An empty string for selectedSenseId indicates a new sense for the specified word. */
  handleClose: (selectedWordId?: string, selectedSenseId?: string) => void;
  analysisLang?: string;
}

export default function VernDialog(props: VernDialogProps): ReactElement {
  const [selectedWordId, setSelectedWordId] = useState<string | undefined>();

  if (!props.vernacularWords.length) {
    return <Fragment />;
  }

  const onSelect = (wordId?: string, senseId?: string): void => {
    if (wordId && senseId === undefined) {
      setSelectedWordId((prev) => (wordId === prev ? undefined : wordId));
    } else {
      props.handleClose(wordId, senseId);
      setSelectedWordId(undefined);
    }
  };

  return (
    <Dialog
      disableRestoreFocus
      fullWidth
      maxWidth="sm"
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
          onSelect={onSelect}
          selectedWordId={selectedWordId}
          analysisLang={props.analysisLang}
        />
      </DialogContent>
    </Dialog>
  );
}

interface VernListProps {
  vernacular: string;
  vernacularWords: Word[];
  onSelect: (wordId?: string, senseId?: string) => void;
  selectedWordId?: string;
  analysisLang?: string;
}

export function VernList(props: VernListProps): ReactElement {
  const { t } = useTranslation();

  const hasPartsOfSpeech = props.vernacularWords.some((w) =>
    w.senses.some(
      (s) => s.grammaticalInfo.catGroup !== GramCatGroup.Unspecified
    )
  );

  const menuItem = (word: Word, isSense = false): ReactElement => {
    const sense = isSense ? word.senses[0] : undefined;
    const text = sense
      ? firstGlossText(sense, props.analysisLang)
      : word.vernacular;

    return (
      <StyledMenuItem
        key={sense?.guid ?? word.id}
        onClick={() => props.onSelect(word.id, sense?.guid)}
      >
        <DialogListItemText
          inset={isSense}
          showDefinition={!!sense}
          showDomain
          showGloss={!sense}
          showPartOfSpeech={hasPartsOfSpeech}
          text={text}
          word={word}
        />
      </StyledMenuItem>
    );
  };

  const menuItems: ReactElement[] = [];
  for (const word of props.vernacularWords) {
    if (word.id !== props.selectedWordId) {
      menuItems.push(menuItem(word));
    } else {
      menuItems.push(
        <StyledMenuItem key={word.id} onClick={() => props.onSelect(word.id)}>
          <DialogListItemText
            text={`${word.vernacular} — ${t("addWords.selectSense")}`}
          />
        </StyledMenuItem>
      );
      for (const s of word.senses) {
        menuItems.push(menuItem({ ...word, senses: [s] }, true));
      }
      menuItems.push(
        <StyledMenuItem
          key={`${word.id}-new-sense`}
          onClick={() => props.onSelect(word.id, "")}
        >
          <DialogListItemText inset text={t("addWords.newSense")} />
        </StyledMenuItem>
      );
    }
  }
  menuItems.push(
    <StyledMenuItem key="new-entry" onClick={() => props.onSelect("")}>
      <DialogListItemText
        text={`${t("addWords.newEntryFor")} ${props.vernacular}`}
      />
    </StyledMenuItem>
  );

  return (
    <>
      {/* Cancel button */}
      <CloseButton close={() => props.onSelect()} />
      {/* Header */}
      <Typography variant="h3">{t("addWords.selectEntry")}</Typography>
      {/* Entry options */}
      <MenuList autoFocusItem>{menuItems}</MenuList>
    </>
  );
}

interface DialogListItemTextProps {
  inset?: boolean;
  showDefinition?: boolean;
  showGloss?: boolean;
  showPartOfSpeech?: boolean;
  showDomain?: boolean;
  text: string;
  word?: Word;
}

const DialogListItemText = (props: DialogListItemTextProps): ReactElement => {
  return (
    <ListItemText inset={props.inset}>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        spacing={5}
      >
        <Grid item xs="auto">
          <Typography variant="h5">{props.text}</Typography>
        </Grid>
        {!!props.word && (
          <>
            {props.showGloss && (
              <Grid item xs="auto">
                <GlossesCell word={props.word} />
              </Grid>
            )}
            {props.showDefinition && (
              <Grid item xs="auto">
                <DefinitionsCell word={props.word} />
              </Grid>
            )}
            {props.showPartOfSpeech && (
              <Grid item xs="auto">
                <PartOfSpeechCell word={props.word} />
              </Grid>
            )}
            {props.showDomain && (
              <Grid item xs>
                <DomainsCell word={props.word} />
              </Grid>
            )}
          </>
        )}
      </Grid>
    </ListItemText>
  );
};
