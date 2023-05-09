import { Button, Grid, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingButton from "components/Buttons/LoadingButton";
import MergeDragDrop from "goals/MergeDupGoal/MergeDupStep/DragDropComponents/MergeDragDrop";
import theme from "types/theme";

interface MergeDupStepProps {
  wordCount: number;
  advanceStep: () => void;
  clearSidebar: () => void;
  mergeAll: () => Promise<void>;
}

export default function MergeDupStep(props: MergeDupStepProps): ReactElement {
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const next = (): void => {
    props.clearSidebar();
    setIsSaving(false);
    props.advanceStep();
  };

  const saveContinue = (): void => {
    setIsSaving(true);
    props.clearSidebar();
    props.mergeAll().then(() => next());
  };

  return props.wordCount ? (
    <React.Fragment>
      {/* Merging pane */}
      <div style={{ background: "#eee", padding: theme.spacing(1) }}>
        <MergeDragDrop />
      </div>
      {/* Merge/skip buttons */}
      <Grid container justifyContent="flex-start">
        <Grid item>
          <LoadingButton
            loading={isSaving}
            buttonProps={{
              color: "primary",
              variant: "contained",
              style: { marginRight: theme.spacing(3) },
              onClick: () => saveContinue(),
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
            onClick={() => next()}
            title={t("mergeDups.helpText.skip")}
            id="merge-skip"
          >
            {t("buttons.skip")}
          </Button>
        </Grid>
      </Grid>
    </React.Fragment>
  ) : (
    // TODO: create component with button back to goals.
    <Typography>{t("mergeDups.helpText.noDups")}</Typography>
  );
}
