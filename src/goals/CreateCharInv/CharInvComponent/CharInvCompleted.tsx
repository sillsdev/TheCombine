import { Typography } from "@mui/material";
import { ArrowRightAlt } from "@mui/icons-material";
import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { CharacterChange } from "goals/CharInventoryCreation/Redux/CharacterInventoryReduxTypes";
import CharacterStatusText from "goals/CharInventoryCreation/components/CharacterList/CharacterStatusText";
import { CreateCharInvChanges } from "goals/CreateCharInv/CreateCharInvTypes";
import { StoreState } from "types";

export default function CharInvCompleted(): ReactElement {
  const changes = useSelector(
    (state: StoreState) =>
      state.goalsState.currentGoal.changes as CreateCharInvChanges
  );
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4">
        {t("charInventory.title")}
      </Typography>
      {CharInvChangesMade(changes)}
    </React.Fragment>
  );
}

function CharInvChangesMade(
  changes: CreateCharInvChanges
): ReactElement | ReactElement[] {
  const { t } = useTranslation();

  if (!changes.charChanges?.length) {
    return <Typography>{t("charInventory.changes.noChanges")}</Typography>;
  }
  return changes.charChanges.map(CharInvChange);
}

export function CharInvChangesGoalList(
  changes: CreateCharInvChanges
): ReactElement {
  const { t } = useTranslation();
  const changeLimit = 3;

  if (!changes.charChanges?.length) {
    return <Typography>{t("charInventory.changes.noChanges")}</Typography>;
  }
  if (changes.charChanges.length > changeLimit) {
    return (
      <React.Fragment>
        <Typography />
        {changes.charChanges.slice(0, changeLimit - 1).map(CharInvChange)}
        <Typography>
          {`+${changes.charChanges.length - 3} `}
          {t("charInventory.changes.more")}
        </Typography>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Typography />
      {changes.charChanges.map(CharInvChange)}
    </React.Fragment>
  );
}

function CharInvChange(change: CharacterChange): ReactElement {
  return (
    <React.Fragment key={change[0]}>
      <Typography display="inline">{`${change[0]}: `}</Typography>
      <CharacterStatusText status={change[1]} inline />
      <ArrowRightAlt fontSize="inherit" />
      <CharacterStatusText status={change[2]} inline />
      <Typography />
    </React.Fragment>
  );
}
