import { ButtonProps } from "@material-ui/core/Button";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { isFrontierNonempty } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import { StoreState } from "types";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  function exportProj() {
    isFrontierNonempty(props.projectId).then((isNonempty) => {
      if (isNonempty) {
        dispatch(asyncExportProject(props.projectId));
      } else {
        enqueueSnackbar(t("projectExport.cannotExportEmpty"));
      }
    });
  }

  const exportResult = useSelector(
    (state: StoreState) => state.exportProjectState
  );
  const loading =
    exportResult.status === ExportStatus.Exporting ||
    exportResult.status === ExportStatus.Success ||
    exportResult.status === ExportStatus.Downloading;

  return (
    <React.Fragment>
      <LoadingButton
        loading={loading}
        disabled={loading}
        buttonProps={{
          ...props.buttonProps,
          onClick: exportProj,
          color: "primary",
          id: `project-${props.projectId}-export`,
        }}
      >
        {t("buttons.export")}
      </LoadingButton>
    </React.Fragment>
  );
}
