import { ArrowRightAlt } from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { Flag, MergeUndoIds, Sense, Status, Word } from "api/models";
import { getFrontierWords, getWord, undoMerge } from "backend";
import FlagButton from "components/Buttons/FlagButton";
import NoteButton from "components/Buttons/NoteButton";
import UndoButton from "components/Buttons/UndoButton";
import { AudioSummary } from "components/WordCard";
import ProtectedWarningIcon from "goals/MergeDuplicates/MergeDupsStep/ProtectedWarningIcon";
import SenseCardContent from "goals/MergeDuplicates/MergeDupsStep/SenseCardContent";
import { MergesCompleted } from "goals/MergeDuplicates/MergeDupsTypes";
import { type StoreState } from "rootRedux/types";
import { newFlag } from "types/word";
import { TypographyWithFont } from "utilities/fontComponents";

export default function MergeDupsCompleted(): ReactElement {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as MergesCompleted
  );
  const { t } = useTranslation();

  return (
    <>
      <Typography component="h1" variant="h4">
        {t("mergeDups.title")}
      </Typography>
      {MergesCount(changes)}
      <List>
        {changes.merges?.map((m, i) => (
          <MergeChange change={m} key={m.parentIds[0] ?? i} />
        ))}
      </List>
    </>
  );
}

export function MergesCount(changes: MergesCompleted): ReactElement {
  const { t } = useTranslation();

  return (
    <Typography>
      {t("mergeDups.completed.number")}
      {changes.merges?.length ?? 0}
    </Typography>
  );
}

export function MergeChange(props: { change: MergeUndoIds }): ReactElement {
  const change = props.change;
  const { t } = useTranslation();
  const handleIsUndoAllowed = (): Promise<boolean> =>
    getFrontierWords().then((words) => doWordsIncludeMerges(words, change));
  const isDeletion = !change.parentIds.length;

  return (
    <ListItem>
      <Stack direction="row">
        {isDeletion && <Typography>{t("mergeDups.undo.deleted")}</Typography>}

        {change.childIds.map((id) => (
          <WordCard key={id} wordId={id} />
        ))}

        {!isDeletion && (
          <>
            <Box alignContent="center" sx={{ m: 1 }}>
              <ArrowRightAlt fontSize="large" />
            </Box>
            {change.parentIds.map((id) => (
              <WordCard key={id} wordId={id} />
            ))}
          </>
        )}

        <Box alignContent="center">
          <UndoButton
            buttonIdEnabled={`merge-undo-${change.parentIds.join("-")}`}
            buttonIdCancel="merge-undo-cancel"
            buttonIdConfirm="merge-undo-confirm"
            textIdDialog={
              isDeletion
                ? "mergeDups.undo.undoDeleteDialog"
                : "mergeDups.undo.undoDialog"
            }
            textIdDisabled="mergeDups.undo.undoDisabled"
            textIdEnabled={
              isDeletion ? "mergeDups.undo.undoDelete" : "mergeDups.undo.undo"
            }
            isUndoAllowed={handleIsUndoAllowed}
            undo={async () => {
              await undoMerge(change);
            }}
          />
        </Box>
      </Stack>
    </ListItem>
  );
}

export function doWordsIncludeMerges(
  words: Word[],
  merge: MergeUndoIds
): boolean {
  const wordIds = words.map((word) => word.id);
  // The undo operation will fail if any of the children are in the frontier.
  return (
    merge.parentIds.every((id) => wordIds.includes(id)) &&
    merge.childIds.every((id) => !wordIds.includes(id))
  );
}

function WordCard(props: { wordId: string }): ReactElement {
  const [word, setWord] = useState<Word | undefined>();
  const [flag, setFlag] = useState<Flag>(newFlag());

  useEffect(() => {
    getWord(props.wordId).then(setWord);
  }, [props.wordId]);
  useEffect(() => {
    setFlag(word?.flag ?? newFlag());
  }, [word]);

  const headerTitle = (
    <TypographyWithFont variant="h5" vernacular>
      {word?.vernacular}
    </TypographyWithFont>
  );

  const headerAction = (
    <>
      {word?.accessibility === Status.Protected && (
        <ProtectedWarningIcon
          id={word.id}
          isCompleted
          protectReasons={word.protectReasons}
          senseOrWord="word"
        />
      )}
      <AudioSummary count={word?.audio?.length ?? 0} />
      {word?.note?.text ? (
        <NoteButton
          buttonId={`word-${props.wordId}-note`}
          noteText={word.note.text}
        />
      ) : null}
      <FlagButton buttonId={`word-${props.wordId}-flag`} flag={flag} />
    </>
  );

  return (
    <Card sx={{ bgcolor: "lightgrey", m: 1 }}>
      <CardHeader
        action={headerAction}
        sx={{ minHeight: 44, minWidth: 100, p: 1 }}
        title={headerTitle}
      />

      <CardContent>
        <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
          {word?.senses?.map(SenseCard)}
        </div>
      </CardContent>
    </Card>
  );
}

function SenseCard(sense: Sense): ReactElement {
  return (
    <Card
      key={sense.guid}
      sx={{
        bgcolor: "white",
        m: 1,
        maxWidth: 300,
        minWidth: 150,
        userSelect: "none",
      }}
    >
      <SenseCardContent isCompleted senses={[sense]} />
    </Card>
  );
}
