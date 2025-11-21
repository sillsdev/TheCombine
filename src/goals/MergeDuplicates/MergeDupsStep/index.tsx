import { Box, Typography } from "@mui/material";
import { ReactElement } from "react";
import { useTranslation } from "react-i18next";

import IdenticalDuplicatesDialog from "goals/MergeDuplicates/IdenticalDuplicatesDialog";
import MergeDragDrop from "goals/MergeDuplicates/MergeDupsStep/MergeDragDrop";
import SaveDeferButtons from "goals/MergeDuplicates/MergeDupsStep/SaveDeferButtons";
import {
  asyncLoadSimilarDuplicates,
  setDataLoadStatus,
} from "goals/Redux/GoalActions";
import { DataLoadStatus } from "goals/Redux/GoalReduxTypes";
import { useAppDispatch, useAppSelector } from "rootRedux/hooks";
import { type StoreState } from "rootRedux/types";
import router from "router/browserRouter";
import { Path } from "types/path";

export default function MergeDupsStep(): ReactElement {
  const dispatch = useAppDispatch();
  const wordCount = useAppSelector(
    (state: StoreState) =>
      Object.keys(state.mergeDuplicateGoal.data.words).length
  );
  const dataLoadStatus = useAppSelector(
    (state: StoreState) => state.goalsState.dataLoadStatus
  );

  const { t } = useTranslation();

  const handleCancel = (): void => {
    dispatch(setDataLoadStatus(DataLoadStatus.Default));
    router.navigate(Path.DataEntry);
  };

  const handleContinue = (): void => {
    dispatch(asyncLoadSimilarDuplicates());
  };

  const handleReviewDeferred = (): void => {
    dispatch(setDataLoadStatus(DataLoadStatus.Default));
    router.navigate(Path.Goals);
    // TODO: Navigate to review deferred duplicates goal
  };

  if (dataLoadStatus === DataLoadStatus.IdenticalCompleted) {
    return (
      <IdenticalDuplicatesDialog
        onCancel={handleCancel}
        onContinue={handleContinue}
        onReviewDeferred={handleReviewDeferred}
      />
    );
  }

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
