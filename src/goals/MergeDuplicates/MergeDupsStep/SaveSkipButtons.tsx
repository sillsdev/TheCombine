import { Button, Grid } from "@mui/material";
import { ReactElement, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { LoadingButton } from "components/Buttons";
import { asyncAdvanceStep } from "components/GoalTimeline/Redux/GoalActions";
import {
  mergeAll,
  setSidebar,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { useAppDispatch } from "types/hooks";
import theme from "types/theme";

export default function SaveSkipButtons(): ReactElement {
  const dispatch = useAppDispatch();

  const advanceStep = useCallback(
    async () => await dispatch(asyncAdvanceStep()),
    [dispatch]
  );
  const clearSidebar = useCallback(() => dispatch(setSidebar()), [dispatch]);
  const merge = useCallback(async () => await dispatch(mergeAll()), [dispatch]);

  const [isSaving, setIsSaving] = useState(false);

  const { t } = useTranslation();

  const next = async (): Promise<void> => {
    clearSidebar();
    setIsSaving(false);
    await advanceStep();
  };

  const saveContinue = async (): Promise<void> => {
    setIsSaving(true);
    clearSidebar();
    await merge().then(next);
  };

  return (
    <Grid container justifyContent="flex-start">
      <Grid item>
        <LoadingButton
          loading={isSaving}
          buttonProps={{
            color: "primary",
            variant: "contained",
            style: { marginRight: theme.spacing(3) },
            onClick: saveContinue,
            title: t("mergeDups.helpText.saveAndContinue"),
            id: "merge-save",
          }}
        >
          {t("buttons.saveAndContinue")}
        </LoadingButton>
        <Button
          color="secondary"
          variant="contained"
          style={{ marginRight: theme.spacing(3) }}
          onClick={next}
          title={t("mergeDups.helpText.skip")}
          id="merge-skip"
        >
          {t("buttons.skip")}
        </Button>
      </Grid>
    </Grid>
  );
}
