import { ArrowRightAlt } from "@mui/icons-material";
import { List, ListItem, Typography } from "@mui/material";
import { type ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { type Word } from "api/models";
import { getWord } from "backend";
import WordCard from "components/WordCard";
import CharacterStatusText from "goals/CharacterInventory/CharInv/CharacterList/CharacterStatusText";
import {
  type CharInvChanges,
  type CharacterChange,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { type StoreState } from "types";
import { useAppSelector } from "types/hooks";

export default function CharInvCompleted(): ReactElement {
  const changes = useAppSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as CharInvChanges
  );
  const { t } = useTranslation();

  const entryChanges = Object.entries(changes.wordChanges ?? {});

  return (
    <>
      <Typography component="h1" variant="h4">
        {t("charInventory.title")}
      </Typography>
      {changes.charChanges?.length ? (
        changes.charChanges.map((c) => <CharChange change={c} key={c[0]} />)
      ) : (
        <Typography>{t("charInventory.changes.noCharChanges")}</Typography>
      )}
      <br />
      {entryChanges.length ? (
        <>
          <Typography>{t("charInventory.changes.wordChanges")}</Typography>
          <List>
            {entryChanges.map(([oldId, newId]) => (
              <WordChangeListItem key={newId} oldId={oldId} newId={newId} />
            ))}
          </List>
        </>
      ) : (
        <Typography>{t("charInventory.changes.noWordChanges")}</Typography>
      )}
    </>
  );
}

export function CharInvChangesGoalList(changes: CharInvChanges): ReactElement {
  const { t } = useTranslation();
  const changeLimit = 3;

  const wordsChanged = Object.keys(changes.wordChanges ?? {}).length;
  const wordChangesTypography = wordsChanged ? (
    <Typography>{`${t(
      "charInventory.changes.wordChanges"
    )} ${wordsChanged}`}</Typography>
  ) : (
    <Typography>{t("charInventory.changes.noWordChanges")}</Typography>
  );

  if (!changes.charChanges?.length) {
    return (
      <>
        <Typography>{t("charInventory.changes.noCharChanges")}</Typography>
        {wordChangesTypography}
      </>
    );
  }
  if (changes.charChanges.length > changeLimit) {
    return (
      <>
        <Typography />
        {changes.charChanges.slice(0, changeLimit - 1).map((c) => (
          <CharChange change={c} key={c[0]} />
        ))}
        <Typography>
          {`+${changes.charChanges.length - 3} `}
          {t("charInventory.changes.more")}
        </Typography>
        {wordChangesTypography}
      </>
    );
  }
  return (
    <>
      <Typography />
      {changes.charChanges.map((c) => (
        <CharChange change={c} key={c[0]} />
      ))}
      {wordChangesTypography}
    </>
  );
}

function CharChange(props: { change: CharacterChange }): ReactElement {
  return (
    <>
      <Typography display="inline">{`${props.change[0]}: `}</Typography>
      <CharacterStatusText status={props.change[1]} inline />
      <ArrowRightAlt fontSize="inherit" />
      <CharacterStatusText status={props.change[2]} inline />
      <Typography />
    </>
  );
}

function WordChangeListItem(props: {
  newId: string;
  oldId: string;
}): ReactElement {
  const [oldVern, setOldVern] = useState("");
  const [newWord, setNewWord] = useState<Word | undefined>();

  useEffect(() => {
    getWord(props.oldId).then((w) => setOldVern(w.vernacular));
    getWord(props.newId).then(setNewWord);
  }, [props]);

  const vernacular = `${oldVern}  →  ${newWord?.vernacular}`;

  return (
    <ListItem>
      {oldVern && newWord ? (
        <WordCard word={{ ...newWord, vernacular }} />
      ) : null}
    </ListItem>
  );
}
