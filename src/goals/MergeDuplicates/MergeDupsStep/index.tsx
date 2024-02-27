import { Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import MergeDragDrop from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop";
import SaveDeferButtons from "goals/MergeDuplicates/MergeDupsStep/SaveDeferButtons";
import { StoreState } from "Redux/rootReduxTypes";
import { useAppSelector } from "types/hooks";
import theme from "types/theme";

export default function MergeDupsStep(): ReactElement {
  const wordCount = useAppSelector(
    (state: StoreState) =>
      Object.keys(state.mergeDuplicateGoal.data.words).length
  );

  const { t } = useTranslation();

  return wordCount ? (
    <>
      <div style={{ background: "#eee", padding: theme.spacing(1) }}>
        <MergeDragDrop />
      </div>
      <SaveDeferButtons />
    </>
  ) : (
    // TODO: create component with button back to goals.
    <Typography>{t("mergeDups.helpText.noDups")}</Typography>
  );
}
