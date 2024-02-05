import { ArrowRightAlt } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import CharacterStatusText from "goals/CharacterInventory/CharInv/CharacterList/CharacterStatusText";
import {
  CharacterChange,
  CharInvChanges,
} from "goals/CharacterInventory/CharacterInventoryTypes";
import { StoreState } from "types";

export default function CharInvCompleted(): ReactElement {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as CharInvChanges
  );
  const { t } = useTranslation();

  return (
    <>
      <Typography component="h1" variant="h4">
        {t("charInventory.title")}
      </Typography>
      {changes.charChanges?.length ? (
        changes.charChanges.map((c) => <CharInvChange change={c} key={c[0]} />)
      ) : (
        <Typography>{t("charInventory.changes.noChanges")}</Typography>
      )}
    </>
  );
}

export function CharInvChangesGoalList(changes: CharInvChanges): ReactElement {
  const { t } = useTranslation();
  const changeLimit = 3;

  if (!changes.charChanges?.length) {
    return <Typography>{t("charInventory.changes.noChanges")}</Typography>;
  }
  if (changes.charChanges.length > changeLimit) {
    return (
      <>
        <Typography />
        {changes.charChanges.slice(0, changeLimit - 1).map((c) => (
          <CharInvChange change={c} key={c[0]} />
        ))}
        <Typography>
          {`+${changes.charChanges.length - 3} `}
          {t("charInventory.changes.more")}
        </Typography>
      </>
    );
  }
  return (
    <>
      <Typography />
      {changes.charChanges.map((c) => (
        <CharInvChange change={c} key={c[0]} />
      ))}
    </>
  );
}

function CharInvChange(props: { change: CharacterChange }): ReactElement {
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
