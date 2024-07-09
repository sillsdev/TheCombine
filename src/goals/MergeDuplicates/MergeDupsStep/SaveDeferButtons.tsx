import { Grid } from "@mui/material";
import { ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";

import { LoadingButton } from "components/Buttons";
import {
  deferMerge,
  mergeAll,
  setSidebar,
} from "goals/MergeDuplicates/Redux/MergeDupsActions";
import { asyncAdvanceStep } from "goals/Redux/GoalActions";
import { useAppDispatch } from "rootRedux/hooks";
import theme from "types/theme";

export default function SaveDeferButtons(): ReactElement {
  const dispatch = useAppDispatch();

  const [isDeferring, setIsDeferring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { t } = useTranslation();

  const next = async (): Promise<void> => {
    setIsDeferring(false);
    setIsSaving(false);
    await dispatch(asyncAdvanceStep());
  };

  const defer = async (): Promise<void> => {
    setIsDeferring(true);
    dispatch(setSidebar());
    await dispatch(deferMerge()).then(next);
  };

  const saveContinue = async (): Promise<void> => {
    setIsSaving(true);
    dispatch(setSidebar());
    await dispatch(mergeAll()).then(next);
  };

  return (
    <Grid container justifyContent="flex-start">
      <Grid item>
        <LoadingButton
          loading={isSaving}
          buttonProps={{
            style: { marginRight: theme.spacing(3) },
            onClick: saveContinue,
            title: t("mergeDups.helpText.saveAndContinue"),
            id: "merge-save",
          }}
        >
          {t("buttons.saveAndContinue")}
        </LoadingButton>
        <LoadingButton
          loading={isDeferring}
          buttonProps={{
            color: "secondary",
            style: { marginRight: theme.spacing(3) },
            onClick: defer,
            title: t("mergeDups.helpText.defer"),
            id: "merge-defer",
          }}
        >
          {t("buttons.defer")}
        </LoadingButton>
      </Grid>
    </Grid>
  );
}
