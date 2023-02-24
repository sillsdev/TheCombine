import { ButtonProps } from "@material-ui/core/Button";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import { isFrontierNonempty } from "backend";
import LoadingButton from "components/Buttons/LoadingButton";
import { asyncExportProject } from "components/ProjectExport/Redux/ExportProjectActions";
import { ExportStatus } from "components/ProjectExport/Redux/ExportProjectReduxTypes";
import PositionedSnackbar from "components/SnackBar/SnackBar";
import { StoreState } from "types";

interface ExportButtonProps {
  projectId: string;
  buttonProps?: ButtonProps;
}

/** A button for exporting project to Lift file */
export default function ExportButton(props: ExportButtonProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  //Update the alert message and display it for 3 seconds
  function handleToastUpdate(message: string) {
    setToastMessage(message);
    setToastOpen(true);
    setTimeout(() => {
      setToastMessage("");
      setToastOpen(false);
    }, 3000);
    return;
  }

  function exportProj() {
    isFrontierNonempty(props.projectId).then((isNonempty) => {
      if (isNonempty) {
        dispatch(asyncExportProject(props.projectId));
      } else {
        handleToastUpdate(t("projectExport.cannotExportEmpty"));
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

  function handleToastDisplay(bool: boolean) {
    if (bool)
      return (
        <PositionedSnackbar
          open={toastOpen}
          message={toastMessage}
          vertical={"top"}
          horizontal={"center"}
        />
      );
  }

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
      {handleToastDisplay(toastOpen)}
    </React.Fragment>
  );
}
