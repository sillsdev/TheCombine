import { Box, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import MergeDragDrop from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop";
import SaveDeferButtons from "goals/MergeDuplicates/MergeDupsStep/SaveDeferButtons";
import { useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";

export default function MergeDupsStep(): ReactElement {
  const wordCount = useAppSelector(
    (state: StoreState) =>
      Object.keys(state.mergeDuplicateGoal.data.words).length
  );

  const { t } = useTranslation();

  return wordCount ? (
    <>
      <Box sx={{ bgcolor: "#eee", p: 1, pb: 0 }}>
        <MergeDragDrop />
      </Box>

      <SaveDeferButtons />
    </>
  ) : (
    // TODO: create component with button back to goals.
    <Typography>{t("mergeDups.helpText.noDups")}</Typography>
  );
}
