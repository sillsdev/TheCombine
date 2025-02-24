import {
  Dialog,
  DialogContent,
  Grid,
  ListItemText,
  MenuList,
  Typography,
} from "@mui/material";
import { CSSProperties, Fragment, ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { GramCatGroup, type Word } from "api/models";
import { CloseButton } from "components/Buttons";
import StyledMenuItem from "components/DataEntry/DataEntryTable/NewEntry/StyledMenuItem";
import SensesTextSummary from "components/WordCard/SensesTextSummary";
import DomainsCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/DomainsCell";
import PartOfSpeechCell from "goals/ReviewEntries/ReviewEntriesTable/Cells/PartOfSpeechCell";
import theme from "types/theme";
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

  // Use CSSProperties instead of SxProps to avoid conflict with StyledMenuItem theming.
  const conditionalGrey: CSSProperties = props.selectedWordId
    ? { backgroundColor: theme.palette.grey[300] }
    : {};

  /** MenuItem for a word, or for the first sense of the word if isSense = true. */
  const menuItem = (word: Word, isSense = false): ReactElement => {
    const sense = isSense ? word.senses[0] : undefined;
    const text = sense
      ? firstGlossText(sense, props.analysisLang)
      : word.vernacular;

    const hasDefinitions = sense && sense.definitions.length > 0;
    const hasDomain = word.senses.some((s) => s.semanticDomains.length);
    const hasPartsOfSpeech = word.senses.some(
      (s) => s.grammaticalInfo.catGroup !== GramCatGroup.Unspecified
    );

    return (
      <StyledMenuItem
        key={sense?.guid ?? word.id}
        onClick={() => props.onSelect(word.id, sense?.guid)}
        sx={isSense ? { marginLeft: theme.spacing(4) } : conditionalGrey}
      >
        <DialogListItemText
          isSubitem={isSense}
          showDefinitions={hasDefinitions}
          showDomain={hasDomain}
          showGlosses={!sense}
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
          sx={{ marginLeft: theme.spacing(4) }}
        >
          <DialogListItemText isSubitem text={t("addWords.newSense")} />
        </StyledMenuItem>
      );
    }
  }
  menuItems.push(
    <StyledMenuItem
      key="new-entry"
      onClick={() => props.onSelect("")}
      sx={conditionalGrey}
    >
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
  isSubitem?: boolean;
  showDefinitions?: boolean;
  showDomain?: boolean;
  showGlosses?: boolean;
  showPartOfSpeech?: boolean;
  text: string;
  word?: Word;
}

/** Child of a MenuItem in the duplicate-vernacular Dialog.
 *
 * Note: The MenuItem must stay out of this component and remain a direct child of
 * the MenuList to allow for the first item to be auto-selected. */
const DialogListItemText = (props: DialogListItemTextProps): ReactElement => {
  return (
    <ListItemText>
      <Grid
        alignItems="center"
        columnSpacing={4}
        container
        justifyContent="align-start"
        rowSpacing={1}
      >
        <Grid item xs="auto">
          <Typography variant={props.isSubitem ? "h6" : "h5"}>
            {props.text}
          </Typography>
        </Grid>
        {!!props.word && (
          <>
            {props.showGlosses && (
              <Grid item xs="auto">
                <SensesTextSummary
                  definitionsOrGlosses="glosses"
                  maxLengthPerSense={20}
                  senses={props.word.senses}
                />
              </Grid>
            )}
            {props.showDefinitions && (
              <Grid item xs="auto">
                <SensesTextSummary
                  definitionsOrGlosses="definitions"
                  maxLengthPerSense={50}
                  senses={props.word.senses}
                />
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
